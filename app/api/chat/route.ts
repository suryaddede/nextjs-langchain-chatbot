import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIMessage, trimMessages } from "@langchain/core/messages";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash",
      apiKey: process.env.GEMINI_API_KEY,
    });

    const promptTemplate = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You talk like a jarvis. Answer all questions to the best of your ability. Markdown supported.",
      ],
      ["placeholder", "{messages}"],
    ]);

    const trimmer = trimMessages({
      maxTokens: 81920,
      strategy: "last",
      tokenCounter: (message) => message.length,
      includeSystem: true,
      allowPartial: false,
      startOn: "human",
    });

    const callModel = async (state: typeof MessagesAnnotation.State) => {
      const trimmedMessage = await trimmer.invoke(state.messages);
      const prompt = await promptTemplate.invoke({ messages: trimmedMessage });
      const response = await model.invoke(prompt);
      return { messages: response };
    };

    const workflow = new StateGraph(MessagesAnnotation)
      .addNode("model", callModel)
      .addEdge(START, "model")
      .addEdge("model", END);

    const memory = new MemorySaver();
    const app = workflow.compile({ checkpointer: memory });

    const config = {
      configurable: {
        thread_id: uuidv4(),
      }
    };

    const output = await app.invoke({ messages }, config);
    const lastMessage = output.messages[output.messages.length - 1] as AIMessage;

    return NextResponse.json({
      role: 'assistant',
      content: lastMessage.content
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
