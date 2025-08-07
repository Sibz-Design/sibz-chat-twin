import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, User, Send, Home, Loader2 } from "lucide-react";
import tamashiAvatar from "@/assets/tamashi-avatar.jpg";

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initialQuery = searchParams.get("query");
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [searchParams]);

  const handleSendMessage = async (message?: string) => {
    const messageText = message || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (in real implementation, this would call Cohere API)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateMockResponse(messageText),
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateMockResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('who are you') || lowerQuery.includes('about')) {
      return "Hi! I'm Tamashi Sibabalwe Desemela, an AI and backend developer passionate about building impactful projects. I specialize in Python, Flask, Node.js, and AI technologies like Cohere and Hugging Face. I love creating clean, efficient code and exploring the intersection of AI and web development. Check out my work at github.com/Sibz-Design!";
    }
    
    if (lowerQuery.includes('project') || lowerQuery.includes('work')) {
      return "I've built several exciting projects! Some highlights include AI-powered web applications, backend APIs with Flask and Node.js, and machine learning integrations. My portfolio showcases projects ranging from chat applications to data processing systems. You can explore all my repositories at github.com/Sibz-Design where I share my latest innovations.";
    }
    
    if (lowerQuery.includes('tech') || lowerQuery.includes('skill') || lowerQuery.includes('stack')) {
      return "My tech stack includes: Backend - Python, Flask, Node.js, Express; AI/ML - Cohere API, Hugging Face, TensorFlow; Frontend - React, Next.js, TypeScript, Tailwind CSS; Databases - PostgreSQL, MongoDB, Redis; Cloud - Vercel, AWS, Docker. I'm always learning new technologies to stay at the cutting edge!";
    }
    
    if (lowerQuery.includes('experience') || lowerQuery.includes('background')) {
      return "I have several years of experience in full-stack development with a focus on backend systems and AI integration. I've worked on projects ranging from small startups to enterprise solutions, always focusing on scalable architecture and clean code. My passion lies in creating intelligent applications that solve real-world problems.";
    }
    
    return "That's a great question! I'm here to help you learn more about my skills, projects, and experience in AI and backend development. Feel free to ask me about my tech stack, specific projects, or anything else you'd like to know about my work. You can also check out my repositories at github.com/Sibz-Design for a deeper dive into my code!";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
              <img 
                src={tamashiAvatar} 
                alt="Tamashi" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Chat with Tamashi</h1>
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
              <p className="text-muted-foreground">Ask me anything about Tamashi's skills, projects, or experience!</p>
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
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-background"
              disabled={isLoading}
            />
            <Button 
              variant="hero" 
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}