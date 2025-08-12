// Replace the existing src/components/ChatInterface.tsx with this updated version

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Coffee, Bot, User, Calendar, ShoppingCart, Truck, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { WebSocketManager, ChatMessage } from "@/services/websocket";
import { useProjectKnowledge } from "@/hooks/useProjectKnowledge";
import { toast } from "@/hooks/use-toast";

interface ChatInterfaceProps {
  onBack: () => void;
}

export const ChatInterface = ({ onBack }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
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
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const { search: searchProjectKnowledge, isLoading: isSearching } = useProjectKnowledge();

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

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        setConnectionStatus('connecting');
        const wsManager = new WebSocketManager(sessionId);
        wsManagerRef.current = wsManager;

        // Set up message handler
        wsManager.onMessage((message: ChatMessage) => {
          setMessages(prev => [...prev, message]);
          setIsTyping(false);
        });

        // Set up status handler
        wsManager.onStatus((status) => {
          switch (status.type) {
            case 'connected':
              setConnectionStatus('connected');
              toast({
                title: "Connected",
                description: "Chat connection established successfully!",
              });
              break;
            case 'disconnected':
              setConnectionStatus('disconnected');
              toast({
                title: "Disconnected",
                description: "Connection lost. Attempting to reconnect...",
                variant: "destructive",
              });
              break;
            case 'typing':
              setIsTyping(status.data.typing || false);
              break;
            case 'queue_update':
              // Handle queue updates
              toast({
                title: "Queue Update",
                description: `Your position: ${status.data.position}`,
              });
              break;
            case 'order_update':
              // Handle order updates
              toast({
                title: "Order Update",
                description: `Order status: ${status.data.status}`,
              });
              break;
          }
        });

        // Set up error handler
        wsManager.onError((error) => {
          setConnectionStatus('error');
          console.error('WebSocket error:', error);
          toast({
            title: "Connection Error",
            description: error,
            variant: "destructive",
          });
        });

        // Connect to WebSocket
        await wsManager.connect();
        
      } catch (error) {
        setConnectionStatus('error');
        console.error('Failed to initialize WebSocket:', error);
        toast({
          title: "Connection Failed",
          description: "Unable to connect to chat service. Please try again.",
          variant: "destructive",
        });
      }
    };

    initializeWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsManagerRef.current) {
        wsManagerRef.current.disconnect();
      }
    };
  }, [sessionId]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !wsManagerRef.current?.isConnected()) {
      if (!wsManagerRef.current?.isConnected()) {
        toast({
          title: "Not Connected",
          description: "Please wait for connection to be established.",
          variant: "destructive",
        });
      }
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      type: "text"
    };

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    const messageContent = input.trim();
    setInput("");
    setIsTyping(true);

    try {
      // Send message through WebSocket
      wsManagerRef.current.sendMessage(messageContent);
      
      // Also try project knowledge search for enhanced responses
      if (messageContent.includes('knowledge') || messageContent.includes('help') || messageContent.includes('info')) {
        try {
          const knowledgeResponse = await searchProjectKnowledge(messageContent);
          // The WebSocket will handle the AI response, but we could use knowledge for context
          console.log('Knowledge search result:', knowledgeResponse);
        } catch (error) {
          console.warn('Knowledge search failed:', error);
        }
      }

    } catch (error) {
      setIsTyping(false);
      console.error('Failed to send message:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  }, [input, searchProjectKnowledge]);

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Wifi className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-orange-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Reconnecting...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Disconnected';
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
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Your personal coffee assistant</p>
                  <div className="flex items-center gap-1">
                    {getConnectionIcon()}
                    <span className="text-xs text-muted-foreground">{getConnectionText()}</span>
                  </div>
                </div>
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
                    disabled={connectionStatus !== 'connected'}
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
                        
                        {/* Show metadata for special message types */}
                        {message.metadata && (
                          <div className="mt-2 space-y-1">
                            {message.metadata.emotion && (
                              <Badge variant="outline" className="text-xs">
                                Emotion: {message.metadata.emotion}
                              </Badge>
                            )}
                            {message.metadata.queue_position && (
                              <Badge variant="outline" className="text-xs">
                                Queue Position: {message.metadata.queue_position}
                              </Badge>
                            )}
                          </div>
                        )}
                        
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
                  
                  {(isTyping || isSearching) && (
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
                  placeholder={
                    connectionStatus === 'connected' 
                      ? "Ask about coffee, book a meeting, or just chat..."
                      : "Connecting to chat service..."
                  }
                  className="flex-1 border-border/50 focus:ring-primary/20"
                  disabled={connectionStatus !== 'connected'}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={!input.trim() || connectionStatus !== 'connected'}
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