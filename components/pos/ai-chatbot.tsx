"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Send, X, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatbotProps {
  inline?: boolean;
  compact?: boolean;
  triggerClassName?: string;
}

export function AIChatbot({
  inline = false,
  compact = false,
  triggerClassName,
}: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your SpiceOS assistant. How can I help you with your restaurant operations today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data } = await apiClient.post("/ai", {
        type: "chat",
        prompt: userMessage,
      });
      const response = data?.response as string | undefined;
      setMessages(prev => [...prev, { role: "assistant", content: response || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: getApiErrorMessage(
            error,
            "I couldn't reach the AI assistant just now. Please try again in a moment."
          ),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        disabled={isOpen}
        variant={inline ? (compact ? "ghost" : "outline") : "default"}
        size={inline ? (compact ? "icon" : "sm") : "icon"}
        className={cn(
          inline
            ? compact
              ? "h-10 w-10 rounded-[var(--radius-medium)] bg-background/80 text-text-secondary shadow-[var(--shadow-elevation-1)] hover:bg-muted"
              : "h-10 rounded-lg border border-primary/20 bg-background px-4 font-semibold text-primary shadow-[var(--shadow-elevation-1)] hover:bg-primary/5"
            : "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl transition-all duration-300",
          !inline && (isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"),
          triggerClassName
        )}
        aria-label="Open AI assistant"
        title="Open AI assistant"
      >
        <Sparkles className="w-6 h-6" />
        {inline && !compact ? <span className="ml-2">AI Assistant</span> : null}
      </Button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed inset-x-4 bottom-4 top-24 z-50 flex flex-col md:inset-x-auto md:right-6 md:top-auto md:h-[600px] md:w-[400px] md:bottom-6"
          >
            <Card className="flex-1 flex flex-col shadow-2xl border-primary/20 overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground p-4 flex flex-row items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/12">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">SpiceOS AI Assistant</CardTitle>
                    <p className="text-[10px] text-primary-foreground/80">Menu, service, and ops help</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-surface">
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((msg, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "flex gap-3 max-w-[85%]",
                          msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-text-secondary"
                        )}>
                          {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                    <div className={cn(
                          "p-3 rounded-2xl text-sm leading-relaxed",
                          msg.role === "user" 
                            ? "bg-primary text-primary-foreground rounded-tr-none" 
                            : "rounded-tl-none border border-border/70 bg-card shadow-sm"
                        )}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 mr-auto max-w-[85%]">
                        <div className="w-8 h-8 rounded-lg bg-muted text-text-secondary flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="rounded-2xl rounded-tl-none border border-border/70 bg-card p-3 shadow-sm">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="shrink-0 border-t border-border/70 bg-surface p-4">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                  >
                    <Input 
                      placeholder="Ask anything..." 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="rounded-xl border-border focus-visible:ring-primary"
                      disabled={isLoading}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="rounded-xl shrink-0"
                      disabled={isLoading || !input.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
