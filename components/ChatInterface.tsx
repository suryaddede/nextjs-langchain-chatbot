"use client"

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import ChatBubble from '@/components/ChatBubble'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      const userMessage: Message = { role: 'user', content: input }
      setMessages(prev => [...prev, userMessage])
      setInput('')
      setIsLoading(true)

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, userMessage]
          }),
        })

        if (!response.ok) throw new Error('Failed to fetch response')

        const aiMessage = await response.json()
        console.log(aiMessage)
        setMessages(prev => [...prev, aiMessage])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="flex flex-col h-dvh">
      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/50 scrollbar-thin scrollbar-thumb-rounded-md scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>Start a conversation with the AI...</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatBubble
              key={index}
              role={message.role}
              content={message.content}
            />
          ))
        )}
      </main>
      <div className="border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
