import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Bot } from "lucide-react"
import ReactMarkdown from 'react-markdown'

interface ChatBubbleProps {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  return (
    <div className={cn(
      "max-w-3xl mx-auto flex gap-4 px-4",
      role === 'user' && "justify-end"
    )}>
      {role === 'assistant' && (
        <Avatar className="h-8 w-8 mt-[5px]">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn(
        "flex gap-3 items-start max-w-[80%] rounded-lg px-4 py-2",
        role === 'assistant'
          ? "border prose prose-sm prose-stone dark:prose-invert"
          : "bg-muted/100"
      )}>
        <div className="leading-normal">
          {role === 'assistant' ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  )
}
