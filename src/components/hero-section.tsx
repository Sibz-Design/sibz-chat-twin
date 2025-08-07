import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Send, Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import tamashiAvatar from "@/assets/tamashi-avatar.jpg";

const suggestedQuestions = [
  "Who are you?",
  "Show me your projects",
  "What tech stack do you use?",
  "Tell me about your experience",
];

export function HeroSection() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleStartChat = (question?: string) => {
    const chatQuery = question || query;
    if (chatQuery.trim()) {
      navigate(`/chat?query=${encodeURIComponent(chatQuery)}`);
    }
  };

  return (
    <section className="min-h-screen relative overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0">
        <img 
          src={heroBg} 
          alt="AI Tech Background" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Avatar */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-glow">
                <img 
                  src={tamashiAvatar} 
                  alt="Tamashi Sibabalwe Desemela" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
              Sibz AI Portfolio
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-2">
              Chat with My Digital Twin
            </p>
            <div className="flex items-center justify-center gap-2 text-primary">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Powered by Cohere AI</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-foreground/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Meet Tamashi Sibabalwe Desemela - AI & Backend Developer. 
            Ask me anything about my skills, projects, and experience. 
            I'll respond just like the real me would.
          </p>

          {/* Chat Input */}
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="flex gap-3">
              <Input
                placeholder="Ask me anything... or choose a suggestion below"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStartChat()}
                className="flex-1 h-14 text-lg bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50"
              />
              <Button 
                variant="hero" 
                size="xl"
                onClick={() => handleStartChat()}
                disabled={!query.trim()}
              >
                <Send className="w-5 h-5" />
                Start Chat
              </Button>
            </div>
          </div>

          {/* Suggested Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="suggestion"
                onClick={() => handleStartChat(question)}
                className="h-auto py-4 px-6 text-left justify-start"
              >
                <Bot className="w-4 h-4 text-primary shrink-0" />
                {question}
              </Button>
            ))}
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-lg bg-card/30 backdrop-blur-sm border border-border/30">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">
                Real-time responses powered by Cohere AI that mirror Tamashi's personality
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-card/30 backdrop-blur-sm border border-border/30">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Interactive</h3>
              <p className="text-sm text-muted-foreground">
                Ask about projects, skills, experience - get personalized responses
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-card/30 backdrop-blur-sm border border-border/30">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Send className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time</h3>
              <p className="text-sm text-muted-foreground">
                Instant streaming responses with natural typing animation
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}