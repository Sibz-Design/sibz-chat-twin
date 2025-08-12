import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, User, Send, Home, Loader2 } from "lucide-react";
import SharedImage from "@/assets/shared _image.jpg";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export default function Chat() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);
  const [hasInitialQueryBeenHandled, setHasInitialQueryBeenHandled] = useState(false);

  // Check environment variables on component mount
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('Environment check:');
    console.log('VITE_SUPABASE_URL:', supabaseUrl || 'MISSING');
    console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'MISSING');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables! Make sure .env file exists with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSendMessage = useCallback(async (message?: string) => {
    const messageText = message || input;
    if (!messageText.trim() || isLoading) return;

    // Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Configuration error: Missing environment variables. Please check your .env file.",
        role: 'assistant',
        timestamp: new Date(),
      };
      if (isMounted.current) {
        setMessages(prev => [...prev, errorMessage]);
      }
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      role: 'user',
      timestamp: new Date(),
    };

    if (isMounted.current) {
      setMessages(prev => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
    }

    try {
      console.log('Making request to:', `${supabaseUrl}/functions/v1/ai-chat-function`);
      
      const response = await fetch(`${supabaseUrl}/functions/v1/ai-chat-function`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ message: messageText }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      // Check if response is actually streaming
      const contentType = response.headers.get('content-type');
      console.log('Response content-type:', contentType);
      
      if (!response.body) {
        throw new Error('No response body');
      }

      let assistantMessage = '';
      const assistantMessageId = (Date.now() + 1).toString();

      // Add initial empty assistant message
      if (isMounted.current) {
        setMessages(prev => [...prev, {
          id: assistantMessageId,
          content: '',
          role: 'assistant',
          timestamp: new Date(),
        }]);
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('Stream completed');
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          console.log('Received chunk:', buffer);
          
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            console.log('Processing line:', trimmedLine);
            
            if (trimmedLine.startsWith('data: ')) {
              const data = trimmedLine.slice(6).trim();
              console.log('Data:', data);
              
              if (data === '[DONE]') {
                console.log('Stream finished');
                if (isMounted.current) {
                  setIsLoading(false);
                }
                return;
              }
              
              if (data && data !== '') {
                try {
                  const parsed = JSON.parse(data);
                  console.log('Parsed data:', parsed);
                  
                  if (parsed.content) {
                    assistantMessage += parsed.content;
                    if (isMounted.current) {
                      setMessages(prev => prev.map(msg => 
                        msg.id === assistantMessageId 
                          ? { ...msg, content: assistantMessage } 
                          : msg
                      ));
                    }
                  } else if (parsed.error) {
                    throw new Error(parsed.error);
                  }
                } catch (parseError) {
                  console.error('JSON parse error:', parseError, 'Data:', data);
                  // Don't throw here, continue processing
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error details:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I'm having trouble connecting right now. Error: ${error.message}`,
        role: 'assistant',
        timestamp: new Date(),
      };
      if (isMounted.current) {
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [input, isLoading]);

  useEffect(() => {
    const initialQuery = searchParams.get("query");
    if (initialQuery && !hasInitialQueryBeenHandled) {
      handleSendMessage(initialQuery);
      setHasInitialQueryBeenHandled(true);
    }
  }, [searchParams, handleSendMessage, hasInitialQueryBeenHandled]);

  // Prevent default form submission that might cause navigation
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };
    
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
              <img 
                src={SharedImage} 
                alt="Sibalwe Desemela" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Chat with SibzAI</h1>
              <p className="text-sm text-muted-foreground">AI Portfolio Assistant</p>
            </div>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/">
              <Home className="w-4 h-4" />
              Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-6">
        <div className="container mx-auto max-w-4xl space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
              <p className="text-muted-foreground">Ask me anything about Sibabalwe's skills, projects, or experience!</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-primary">
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <Bot className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
              <Card className={`max-w-2xl p-4 ${message.role === 'user' ? 'bg-primary/10 border-primary/20' : 'bg-card'}`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                <span className="text-xs text-muted-foreground mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </Card>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-primary">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <Card className="max-w-2xl p-4 bg-card">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-6">
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-background"
              disabled={isLoading}
            />
            <Button 
              type="submit"
              variant="hero" 
              disabled={!input.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}