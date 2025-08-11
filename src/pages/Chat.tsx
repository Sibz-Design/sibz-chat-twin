import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, User, Send, Home, Loader2 } from "lucide-react";
import SharedImage from "@/assets/shared _image.jpg";
import { createClient } from '@supabase/supabase-js';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Chat() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);
  const [hasInitialQueryBeenHandled, setHasInitialQueryBeenHandled] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Check environment variables on component mount
  useEffect(() => {
    console.log('Environment check:');
    console.log('VITE_SUPABASE_URL:', supabaseUrl || 'MISSING');
    console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'MISSING');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing environment variables! Make sure .env file exists with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }
  }, []);

  // Handle authentication
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
      console.log('Current session:', session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      console.log('Auth state changed:', session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in anonymously if no session
  useEffect(() => {
    if (!isAuthLoading && !session) {
      console.log('No session found, signing in anonymously...');
      supabase.auth.signInAnonymously().then(({ data, error }) => {
        if (error) {
          console.error('Anonymous sign in error:', error);
        } else {
          console.log('Anonymous sign in successful:', data);
        }
      });
    }
  }, [session, isAuthLoading]);

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

    // Check if we have a valid session
    if (!session?.access_token) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Authentication error: Please wait for authentication to complete or refresh the page.",
        role: 'assistant',
        timestamp: new Date(),
      };
      if (isMounted.current) {
        setMessages(prev => [...prev, errorMessage]);
      }
      return;
    }

    // Check environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
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
      console.log('Using access token:', session.access_token ? 'Present' : 'Missing');
      
      const response = await fetch(`${supabaseUrl}/functions/v1/ai-chat-function`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
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

      const reader = response.body?.getReader();
      if (!reader) {
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              if (isMounted.current) {
                setIsLoading(false);
              }
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
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
            } catch (e) {
              if (data.includes('error')) {
                console.error('Server error in stream:', data);
                throw new Error('Server error occurred');
              }
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
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
  }, [input, isLoading, session]);

  useEffect(() => {
    const initialQuery = searchParams.get("query");
    if (initialQuery && !hasInitialQueryBeenHandled && session) {
      handleSendMessage(initialQuery);
      setHasInitialQueryBeenHandled(true);
    }
  }, [searchParams, handleSendMessage, hasInitialQueryBeenHandled, session]);

  // Show loading state while authenticating
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }
    
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
              <p className="text-sm text-muted-foreground">
                AI Portfolio Assistant {session ? '(Authenticated)' : '(Authentication pending)'}
              </p>
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
          <div className="flex gap-3">
            <Input
              placeholder={session ? "Type your message..." : "Authenticating..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-background"
              disabled={isLoading || !session}
            />
            <Button 
              variant="hero" 
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading || !session}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}