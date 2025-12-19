"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageCircle, X, Bot, User, Loader2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your Zeretail AI Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: input }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || "I'm sorry, I couldn't process your request. Please try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Failed to send message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again later.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Function to render markdown-like content with basic formatting
  const renderContent = (content: string) => {
    // Split content by newlines
    const lines = content.split('\n')
    
    return lines.map((line, index) => {
      // Handle headings
      if (line.startsWith('## ')) {
        return <h3 key={index} className="font-semibold mt-2 text-sm">{line.substring(3)}</h3>
      }
      
      // Handle bold text (marked with **)
      if (line.includes('**')) {
        const parts = line.split('**')
        return (
          <p key={index} className="text-xs leading-relaxed">
            {parts.map((part, i) => 
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </p>
        )
      }
      
      // Handle bullet points
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <li key={index} className="ml-3 list-disc text-xs mb-0.5">{line.substring(2)}</li>
      }
      
      // Handle numbered lists
      if (/^\d+\./.test(line)) {
        return <li key={index} className="ml-3 list-decimal text-xs mb-0.5">{line.replace(/^\d+\.\s*/, '')}</li>
      }
      
      // Regular paragraph
      if (line.trim()) {
        return <p key={index} className="text-xs">{line}</p>
      }
      
      // Empty line
      return <div key={index} className="h-1"></div>
    })
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            onClick={() => setIsOpen(true)}
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </Button>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md">
          <Card className="border-border shadow-xl">
            <CardHeader className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                  AI Assistant
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-64 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                          <Bot className="h-3 w-3 text-white" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 ${
                          message.role === "user"
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        <div className="text-xs leading-relaxed">
                          {renderContent(message.content)}
                        </div>
                      </div>

                      {message.role === "user" && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-3 w-3 text-primary" />
                        </div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                        <Bot className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="border-t border-border p-3 space-y-3">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Quick Questions</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setInput("Top products?")}
                      className="rounded-lg border border-border bg-secondary/50 px-2 py-1.5 text-xs text-foreground transition-all hover:bg-secondary hover:border-primary/30 truncate"
                    >
                      Top products?
                    </button>
                    <button
                      onClick={() => setInput("Pending orders?")}
                      className="rounded-lg border border-border bg-secondary/50 px-2 py-1.5 text-xs text-foreground transition-all hover:bg-secondary hover:border-primary/30 truncate"
                    >
                      Pending orders?
                    </button>
                    <button
                      onClick={() => setInput("Fulfillment rate?")}
                      className="rounded-lg border border-border bg-secondary/50 px-2 py-1.5 text-xs text-foreground transition-all hover:bg-secondary hover:border-primary/30 truncate"
                    >
                      Fulfillment rate?
                    </button>
                    <button
                      onClick={() => setInput("Monthly sales?")}
                      className="rounded-lg border border-border bg-secondary/50 px-2 py-1.5 text-xs text-foreground transition-all hover:bg-secondary hover:border-primary/30 truncate"
                    >
                      Monthly sales?
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Input
                    type="text"
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    className="flex-1 text-sm"
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={loading || !input.trim()} 
                    size="icon"
                    className="h-9 w-9"
                  >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}