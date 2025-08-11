<<<<<<< HEAD
import { useState, useEffect, useRef, useCallback } from "react";
=======
import { useState, useEffect, useRef } from "react";
>>>>>>> 6786302a3ffef785fed2618c5669c1eb6fd3ca11
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, User, Send, Home, Loader2 } from "lucide-react";
<<<<<<< HEAD
import SharedImage from "@/assets/shared _image.jpg";
import { createClient } from '@supabase/supabase-js';
=======
import tamashiAvatar from "@/assets/tamashi-avatar.jpg";
>>>>>>> 6786302a3ffef785fed2618c5669c1eb6fd3ca11

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

<<<<<<< HEAD
// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

=======
>>>>>>> 6786302a3ffef785fed2618c5669c1eb6fd3ca11
export default function Chat() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
<<<<<<< HEAD
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
=======
>>>>>>> 6786302a3ffef785fed2618c5669c1eb6fd3ca11

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
<<<<<<< HEAD
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

=======
    const initialQuery = searchParams.get("query");
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [searchParams]);

  const handleSendMessage = async (message?: string) => {
    const messageText = message || input;
    if (!messageText.trim() || isLoading) return;

>>>>>>> 6786302a3ffef785fed2618c5669c1eb6fd3ca11
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      role: 'user',
      timestamp: new Date(),
    };

<<<<<<< HEAD
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
=======
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
>>>>>>> 6786302a3ffef785fed2618c5669c1eb6fd3ca11
        },
        body: JSON.stringify({ message: messageText }),
      });

<<<<<<< HEAD
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
=======
      if (!response.ok) {
        throw new Error('Failed to get response');
>>>>>>> 6786302a3ffef785fed2618c5669c1eb6fd3ca11
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let assistantMessage = '';
      const assistantMessageId = (Date.now() + 1).toString();

      // Add initial empty assistant message
<<<<<<< HEAD
      if (isMounted.current) {
        setMessages(prev => [...prev, {
          id: assistantMessageId,
          content: '',
          role: 'assistant',
          timestamp: new Date(),
        }]);
      }
=======
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
      }]);
>>>>>>> 6786302a3ffef785fed2618c5669c1eb6fd3ca11

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
<<<<<<< HEAD
              if (isMounted.current) {
                setIsLoading(false);
              }
=======
              setIsLoading(false);
>>>>>>> 6786302a3ffef785fed2618c5669c1eb6fd3ca11
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantMessage += parsed.content;
<<<<<<< HEAD
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
=======
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: assistantMessage }
                    : msg
                ));
              }
            } catch (e) {
>>>>>>> 6786302a3ffef785fed2618c5669c1eb6fd3ca11
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
<<<<<<< HEAD
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
    
=======
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment!",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


>>>>>>> 6786302a3ffef785fed2618c5669c1eb6fd3ca11
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
              <img 
<<<<<<< HEAD
                src={SharedImage} 
                alt="Sibalwe Desemela" 
=======
                src={tamashiAvatar} 
                alt="Tamashi" 
>>>>>>> 6786302a3ffef785fed2618c5669c1eb6fd3ca11
                className="w-full h-full object-cover"
              />
            </div>
            <div>
<<<<<<< HEAD
              <h1 className="text-lg font-semibold">Chat with SibzAI</h1>
              <p className="text-sm text-muted-foreground">
                AI Portfolio Assistant {session ? '(Authenticated)' : '(Authentication pending)'}
              </p>
=======
              <h1 className="text-lg font-semibold">Chat with Tamashi</h1>
              <p className="text-sm text-muted-foreground">AI Portfolio Assistant</p>
>>>>>>> 6786302a3ffef785fed2618c5669c1eb6fd3ca11
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
<<<<<<< HEAD
              <p className="text-muted-foreground">Ask me anything about Sibabalwe's skills, projects, or experience!</p>
=======
              <p className="text-muted-foreground">Ask me anything about Tamashi's skills, projects, or experience!</p>
>>>>>>> 6786302a3ffef785fed2618c5669c1eb6fd3ca11
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
<<<<<<< HEAD
              placeholder={session ? "Type your message..." : "Authenticating..."}
=======
              placeholder="Type your message..."
>>>>>>> 6786302a3ffef785fed2618c5669c1eb6fd3ca11
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-background"
<<<<<<< HEAD
              disabled={isLoading || !session}
=======
              disabled={isLoading}
>>>>>>> 6786302a3ffef785fed2618c5669c1eb6fd3ca11
            />
            <Button 
              variant="hero" 
              onClick={() => handleSendMessage()}
<<<<<<< HEAD
              disabled={!input.trim() || isLoading || !session}
=======
              disabled={!input.trim() || isLoading}
>>>>>>> 6786302a3ffef785fed2618c5669c1eb6fd3ca11
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}