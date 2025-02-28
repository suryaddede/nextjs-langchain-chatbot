// Import dependencies
import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
    START,
    END,
    MessagesAnnotation,
    StateGraph,
    MemorySaver,
} from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { trimMessages } from "@langchain/core/messages";

async function main() {
    // Define model
    const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        apiKey: process.env.GEMINI_API_KEY,
    });

    // Create prompt template
    const promptTemplate = ChatPromptTemplate.fromMessages([
        [
            "system",
            "You talk like a jarvis. Answer all questions to the best of your ability.",
        ],
        ["placeholder", "{messages}"],
    ]);

    // Limit messages size
    const trimmer = trimMessages({
        maxTokens: 81920,
        strategy: "last",
        tokenCounter: (message) => message.length,
        includeSystem: true,
        allowPartial: false,
        startOn: "human",
    });

    // Define the function that calls the model
    const callModel = async (state) => {
        const trimmedMessage = await trimmer.invoke(state.messages);
        const prompt = await promptTemplate.invoke({messages: trimmedMessage});
        const response = await model.invoke(prompt);
        return {messages: response};
    };

    // Define a new graph
    const workflow = new StateGraph(MessagesAnnotation)
        .addNode("model", callModel)
        .addEdge(START, "model")
        .addEdge("model", END);

    const memory = new MemorySaver();
    const app = workflow.compile({ checkpointer: memory });
    
    // Create config
    const config = {
        configurable: {
            thread_id: uuidv4(),
        }
    };

    // Start the conversation
    const input = [
        {
            role: "user",
            content: "Hello, I'm Iron Man",
        },
    ];
    const output = await app.invoke({ messages: input }, config);
    console.log(output.messages[output.messages.length - 1].content);

    // Continue the conversation
    const input2 = [
        {
            role: "user",
            content: "What's my name?",
        },
    ];
    const output2 = await app.invoke({ messages: input2 }, config);
    console.log(output2.messages[output2.messages.length - 1].content);
}

main();