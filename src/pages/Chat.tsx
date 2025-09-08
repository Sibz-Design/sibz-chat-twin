import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, User, Send, Home, Loader2, Copy, Check } from "lucide-react";
import SharedImage from "@/assets/shared _image.jpg";
import { Projects } from "@/components/Projects";
import { Certificates } from "@/components/Certificates";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'projects' | 'certificates';
  data?: any;
}

export default function Chat() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);
  const [hasInitialQueryBeenHandled, setHasInitialQueryBeenHandled] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

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

    // Special-case: handle "Who is Siba" (and variants) locally with a polished bio response
    const normalized = messageText.trim().toLowerCase();
    const isWhoIsSiba =
      /^who\s+is\s+(siba|sibz|sibabalwe)\??$/.test(normalized) ||
      /^who['’]s\s+(siba|sibz)\??$/.test(normalized) ||
      normalized.startsWith('who is siba') ||
      normalized.startsWith('who is sibabalwe') ||
      normalized.startsWith('who is sibz');
    if (isWhoIsSiba && isMounted.current) {
      const assistantWhoMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: [
          'Siba (Sibabalwe Desemela) — IT Support Specialist & AI/ML Enthusiast',
          '',
          '- Strengths: Troubleshooting, automation, Python, data analysis, AI agents.',
          '- Projects: Sentiment Dashboard, YouTube Comment Analytics Dashboard.',
          '- Learning: Python, Flask, REST APIs, DevOps, MLOps.',
          '',
          'Links:',
          '- GitHub: https://github.com/Sibz-Design',
          '- LinkedIn: https://www.linkedin.com/in/sibabalwe-desemela-554789253',
        ].join('\n'),
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage, assistantWhoMsg]);
      setInput("");
      return;
    }

    // Special-case: any query containing the keyword "project" should render visual projects immediately
    if (normalized.includes('project') && isMounted.current) {
      const projectsVisual: Message = {
        id: (Date.now() + 1).toString(),
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        type: 'projects',
      };
      setMessages(prev => [...prev, userMessage, projectsVisual]);
      setInput("");
      return;
    }

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

      if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: '',
          role: 'assistant',
          timestamp: new Date(),
          type: json.type,
          data: json.data,
        };
        if (isMounted.current) {
          setMessages(prev => [...prev, assistantMessage]);
          setIsLoading(false);
        }
        return;
      }
      
      // Handle non-stream plain text responses
      if (contentType && (contentType.includes('text/plain') || contentType.includes('text/html'))) {
        const text = await response.text();
        const assistantMessagePlain: Message = {
          id: (Date.now() + 1).toString(),
          content: text,
          role: 'assistant',
          timestamp: new Date(),
        };
        if (isMounted.current) {
          setMessages(prev => [...prev, assistantMessagePlain]);
          setIsLoading(false);
        }
        return;
      }

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

      // Handle streaming response (supports SSE and plain text)
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
            } else {
              // Fallback: treat non-SSE plain text as content
              assistantMessage += trimmedLine + '\n';
              if (isMounted.current) {
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: assistantMessage } 
                    : msg
                ));
              }
            }
          }
        }
      } finally {
        // Flush any remaining buffer content after stream ends
        if (buffer && buffer.trim()) {
          assistantMessage += buffer;
          if (isMounted.current) {
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: assistantMessage } 
                : msg
            ));
          }
        }
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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };
  
  const hasVisualSection = messages.some(m => m.type === 'projects' || m.type === 'certificates');

  // Formatting helpers for assistant messages
  const escapeHtml = (unsafe: string) =>
    unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, idx) => {
      if (urlRegex.test(part)) {
        return (
          <a key={idx} href={part} target="_blank" rel="noopener noreferrer" className="underline">
            {part}
          </a>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const renderFormattedMessage = (text: string) => {
    // Handle triple backtick code blocks first
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      const [full, codeContent] = match;
      const start = match.index;
      const before = text.slice(lastIndex, start);
      if (before) {
        // For normal text, preserve line breaks and linkify
        before.split("\n").forEach((line, i, arr) => {
          const noHeadings = line.replace(/^#{1,6}\s*/, "");
          nodes.push(<span key={`t-${lastIndex}-${i}`}>{renderTextWithLinks(noHeadings)}</span>);
          if (i < arr.length - 1) nodes.push(<br key={`br-${lastIndex}-${i}`} />);
        });
      }
      nodes.push(
        <pre key={`code-${start}`} className="mt-2 mb-2 rounded bg-muted p-3 overflow-auto">
          <code>{codeContent}</code>
        </pre>
      );
      lastIndex = start + full.length;
    }
    const after = text.slice(lastIndex);
    if (after) {
      after.split("\n").forEach((line, i, arr) => {
        const noHeadings = line.replace(/^#{1,6}\s*/, "");
        nodes.push(<span key={`t-end-${lastIndex}-${i}`}>{renderTextWithLinks(noHeadings)}</span>);
        if (i < arr.length - 1) nodes.push(<br key={`br-end-${lastIndex}-${i}`} />);
      });
    }
    return nodes;
  };

  const handleCopy = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 1500);
    } catch (err) {
      console.error('Copy failed', err);
    }
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
          {hasVisualSection && (
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b pb-3 -mt-2">
              <Button variant="outline" asChild>
                <Link to="/">
                  <Home className="w-4 h-4" />
                  Home
                </Link>
              </Button>
            </div>
          )}
          {/* Quick actions */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" asChild>
              <Link to="/">
                <Home className="w-4 h-4" />
                Home
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const projectMsg: Message = {
                  id: (Date.now() + 1).toString(),
                  content: '',
                  role: 'assistant',
                  timestamp: new Date(),
                  type: 'projects'
                };
                setMessages(prev => [...prev, projectMsg]);
              }}
            >
              Projects
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const certMsg: Message = {
                  id: (Date.now() + 1).toString(),
                  content: '',
                  role: 'assistant',
                  timestamp: new Date(),
                  type: 'certificates'
                };
                setMessages(prev => [...prev, certMsg]);
              }}
            >
              Certificates
            </Button>
            <Button variant="outline" onClick={() => handleSendMessage('What are your key skills?')}>
              Skills
            </Button>
            <Button variant="outline" onClick={() => handleSendMessage('Summarize your experience')}>
              Experience
            </Button>
          </div>
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
              <Card className={`relative max-w-2xl p-4 ${message.role === 'user' ? 'bg-primary/10 border-primary/20' : 'bg-card'}`}>
                {message.type === 'projects' ? (
                  <Projects />
                ) : message.type === 'certificates' ? (
                  <Certificates />
                ) : (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap break-words pr-12">
                    {renderFormattedMessage(message.content)}
                  </div>
                )}
                {message.role === 'assistant' && message.type !== 'projects' && message.type !== 'certificates' && (
                  <div className="absolute top-2 right-2">
                    <Button variant="ghost" onClick={() => handleCopy(message.id, message.content)}>
                      {copiedMessageId === message.id ? (
                        <>
                          <Check className="w-4 h-4 mr-1" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" /> Copy
                        </>
                      )}
                    </Button>
                  </div>
                )}
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
              onKeyDown={handleKeyDown}
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
