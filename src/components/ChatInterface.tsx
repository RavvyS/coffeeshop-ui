import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Coffee, Bot, User, Calendar, ShoppingCart, Truck } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "suggestion" | "appointment" | "order";
}

interface ChatInterfaceProps {
  onBack: () => void;
}

export const ChatInterface = ({ onBack }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI barista. I'm here to help you find the perfect coffee, book appointments, or just have a therapeutic chat. How can I brighten your day? ☕",
      timestamp: new Date(),
      type: "text"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickSuggestions = [
    "Suggest coffee for rainy weather",
    "Book a coffee meeting",
    "What's my usual order?",
    "I need a therapy session",
    "Show delivery options"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  const simulateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("weather") || lowerMessage.includes("rainy") || lowerMessage.includes("sunny")) {
      return "Based on today's weather, I'd recommend a warm Cappuccino Supreme with extra foam! The rich, creamy texture is perfect for a cozy feeling. Would you like me to add this to your order? ☕🌧️";
    }
    
    if (lowerMessage.includes("appointment") || lowerMessage.includes("meeting") || lowerMessage.includes("book")) {
      return "I'd love to help you book a coffee appointment! Are you looking for a casual coffee meeting or perhaps a therapeutic session? I have availability tomorrow at 2 PM, 4 PM, or Friday at 10 AM. Which works better for you? 📅";
    }
    
    if (lowerMessage.includes("usual") || lowerMessage.includes("order") || lowerMessage.includes("remember")) {
      return "I remember you love our Iced Vanilla Latte with an extra shot! You ordered it last Tuesday and mentioned how it perfectly balanced sweetness with strength. Would you like the same today, or shall we try something new? 💭";
    }
    
    if (lowerMessage.includes("therapy") || lowerMessage.includes("stress") || lowerMessage.includes("talk")) {
      return "I'm here to listen. Sometimes the best therapy happens over a warm cup of coffee. What's on your mind today? While we chat, may I suggest our calming Chamomile Coffee Blend? It's known for its soothing properties. 🤗";
    }
    
    if (lowerMessage.includes("delivery") || lowerMessage.includes("deliver")) {
      return "We offer several delivery options! 🚚 Standard delivery (30-45 mins) is free over $15, Express delivery (15-20 mins) for $3.99, or you can schedule delivery for later today. What works best for your schedule?";
    }
    
    if (lowerMessage.includes("payment") || lowerMessage.includes("pay") || lowerMessage.includes("checkout")) {
      return "Perfect! I'll direct you to our secure payment portal. We accept all major cards, Apple Pay, Google Pay, and even coffee subscription credits. Your order total comes to $12.50. Ready to proceed? 💳";
    }

    // Default responses for general conversation
    const responses = [
      "That sounds interesting! How can I help you with your coffee experience today? ☕",
      "I'm here to make your coffee journey perfect. What type of flavor profile are you in the mood for?",
      "Great! I love helping coffee enthusiasts. Are you looking for something energizing or more relaxing?",
      "Tell me more! I can suggest the perfect drink or help with anything else you need."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: simulateAIResponse(input),
        timestamp: new Date(),
        type: "text"
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/10">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold">AI Barista</h1>
                <p className="text-sm text-muted-foreground">Your personal coffee assistant</p>
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              <Badge variant="secondary" className="gap-1">
                <Calendar className="h-3 w-3" />
                Book Meeting
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <ShoppingCart className="h-3 w-3" />
                Order
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Truck className="h-3 w-3" />
                Delivery
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 max-w-4xl">
        <div className="grid gap-6">
          {/* Quick Suggestions */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                Quick Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs hover:bg-primary/5 border-border/50"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className="h-[500px] border-border/50">
            <CardContent className="p-0 h-full">
              <ScrollArea ref={scrollAreaRef} className="h-full p-6">
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      
                      {message.role === "user" && (
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-accent-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="bg-secondary text-secondary-foreground rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Input Area */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about coffee, book a meeting, or just chat..."
                  className="flex-1 border-border/50 focus:ring-primary/20"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={!input.trim() || isTyping}
                  className="px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
