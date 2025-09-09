import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Send, Sparkles, ExternalLink, Mail } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import sharedImage from "@/assets/shared _image.jpg";
import { Projects } from "./Projects";


const suggestedQuestions = [
  "Who is Siba?",
  "Show me Siba's projects",
  "What tech stack do Siba use?",
  "Tell me about Siba's experience",
];

export function HeroSection() {
  const [query, setQuery] = useState("");
  const [showProjects, setShowProjects] = useState(false);
  const navigate = useNavigate();
  const scrollToContact = () => {
    const el = document.getElementById('contact-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartChat = (question?: string) => {
    const chatQuery = question || query;
    if (chatQuery.trim()) {
      const normalized = chatQuery.toLowerCase();
      if (normalized.includes('project')) {
        setShowProjects(true);
        return;
      }
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
                  src={sharedImage}  
                  alt="Sibabalwe Desemela" 
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
              <span className="text-sm font-medium"></span>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-foreground/80 mb-12 max-w-2xl mx-auto leading-relaxed">

            Meet Sibabalwe Desemela - IT Support & AI/ML Enthusaist.  
            Ask me anything about my skills, projects, and experience. 
            I'll respond just like the real Siba would.
          </p>

          {showProjects ? (
            <Projects />
          ) : (
            <>
              {/* Chat Input */}
              <div className="mb-8 max-w-2xl mx-auto">
                <div className="flex gap-x-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
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

              {/* CTAs */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button asChild variant="outline">
                  <a href="https://drive.google.com/drive/folders/1ubhYNykU6iMgzSvxeix6WpdfVniZGc5A?usp=sharing" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    Certificates
                  </a>
                </Button>
                <Button variant="hero" onClick={scrollToContact}>
                  <Mail className="w-4 h-4" />
                  Contact Me
                </Button>
              </div>

              {/* Features */}
              <div className="mt-12 grid md:grid-cols-2 gap-4 text-left max-w-4xl mx-auto">
                <div className="p-6 rounded-lg bg-card/30 backdrop-blur-sm border border-border/30">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Interactive</h3>
                  <p className="text-sm text-muted-foreground">
                    Ask about projects, skills, experience - get personalized responses
                  </p>
                </div>
                
                <div className="p-6 rounded-lg bg-card/30 backdrop-blur-sm border border-border/30">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                    <Send className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Real-time</h3>
                  <p className="text-sm text-muted-foreground">
                    Instant streaming responses with natural typing animation
                  </p>
                </div>
              </div>

              {/* Contact Section */}
              <div id="contact-section" className="mt-16 max-w-2xl mx-auto text-left">
                <h2 className="text-2xl font-semibold mb-4">Contact Me</h2>
                <p className="text-sm text-muted-foreground mb-6">Send me a message or connect on LinkedIn.</p>
                <form action="" method="post" onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget as HTMLFormElement;
                  const formData = new FormData(form);
                  const name = String(formData.get('name') || '').trim();
                  const email = String(formData.get('email') || '').trim();
                  const message = String(formData.get('message') || '').trim();

                  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                  if (!supabaseUrl) {
                    alert('Supabase is not configured.');
                    return;
                  }

                  try {
                    (form.querySelector('button[type="submit"]') as HTMLButtonElement).disabled = true;
                    const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name, email, message })
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      throw new Error(data?.error || 'Failed to send');
                    }
                    alert('Message sent successfully!');
                    form.reset();
                  } catch (err:any) {
                    alert(`Failed to send message: ${err.message || err}`);
                  } finally {
                    (form.querySelector('button[type="submit"]') as HTMLButtonElement).disabled = false;
                  }
                }} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input name="name" placeholder="Your name" required className="bg-card/50" />
                    <Input name="email" type="email" placeholder="Your email" required className="bg-card/50" />
                  </div>
                  <textarea name="message" placeholder="Your message" required className="w-full min-h-[120px] rounded-md border border-border bg-card/50 p-3 text-sm" />
                  <div className="flex items-center gap-3">
                    <Button type="submit" variant="hero">
                      <Send className="w-4 h-4" />
                      Send Message
                    </Button>
                    <Button asChild variant="outline">
                      <a href="https://www.linkedin.com/in/sibabalwe-desemela-554789253" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                        Connect on LinkedIn
                      </a>
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
