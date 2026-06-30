import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { useChatWithBot } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  role: "user" | "assistant";
  content: string;
};

import { useAuth } from "@/contexts/AuthContext";

export function CivicBot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm CivicBot. I can help you report issues or answer questions about community guidelines. What do you need help with?" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = useChatWithBot({
    mutation: {
      onSuccess: (data: any) => {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      },
      onError: () => {
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now." }]);
      }
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const newMsg: Message = { role: "user", content: input };
    const chatHistory = [...messages, newMsg];
    
    setMessages(chatHistory);
    setInput("");
    
    chatMutation.mutate({ 
      data: { 
        message: input,
        history: messages.slice(-5), // Send last 5 messages for context
        userId: user?.id
      } 
    });
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              drag
              dragElastic={0.1}
              dragMomentum={true}
              dragConstraints={{ left: -1200, right: 0, top: -800, bottom: 0 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="bg-gradient-to-tr from-primary to-secondary text-primary-foreground h-16 w-16 rounded-full flex items-center justify-center shadow-2xl hover:shadow-primary/30 cursor-grab active:cursor-grabbing border-2 border-white/20 backdrop-blur-md relative group"
            >
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75 group-hover:animate-none group-hover:scale-125 transition-all duration-300" />
              <Bot className="h-7 w-7 text-white" />
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-extrabold rounded-full px-1.5 py-0.5 border border-background animate-bounce">
                AI
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              drag
              dragElastic={0.08}
              dragMomentum={true}
              dragConstraints={{
                left: -1200,
                right: 50,
                top: -800,
                bottom: 50
              }}
              initial={{ opacity: 0, y: 40, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: 40, scale: 0.9, rotate: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="absolute bottom-0 right-0 w-85 sm:w-98 z-50 origin-bottom-right"
            >
              <Card className="border shadow-2xl backdrop-blur-lg bg-background/95 overflow-hidden rounded-2xl border-primary/10">
                <CardHeader 
                  className="p-4 bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground rounded-t-2xl flex flex-row items-center justify-between space-y-0 cursor-grab active:cursor-grabbing select-none hover:brightness-110 transition-all"
                  title="Drag me from here!"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="bg-white/20 p-1.5 rounded-xl backdrop-blur-md">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-1.5 text-white">
                        CivicBot <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-wider animate-pulse">Online</span>
                      </CardTitle>
                      <p className="text-[10px] text-primary-foreground/75 font-medium mt-0.5">Drag window to move anywhere</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-primary-foreground hover:bg-white/20 hover:text-white rounded-full transition-all" 
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent 
                  className="p-4 h-96 overflow-y-auto bg-muted/10 flex flex-col gap-3"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {messages.map((msg, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-[85%] items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center shadow-md ${msg.role === 'user' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`}>
                          {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                        </div>
                        <div className={`px-3.5 py-2 rounded-2xl text-sm shadow-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card border rounded-tl-none'}`}>
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {chatMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2">
                        <div className="shrink-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                        <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-none bg-card border shadow-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>
                <CardFooter 
                  className="p-3 bg-background border-t border-border/60"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex w-full items-center space-x-2">
                    <Input
                      placeholder="Ask a question..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-1 rounded-xl"
                      disabled={chatMutation.isPending}
                    />
                    <Button type="submit" size="icon" className="rounded-xl shrink-0" disabled={!input.trim() || chatMutation.isPending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
