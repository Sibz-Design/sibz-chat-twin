import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Bot, Home, Loader2, Send, User } from "lucide-react";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AssistantMessage } from "@/components/chat/AssistantMessage";
import { EmptyState } from "@/components/chat/EmptyState";
import { MessageText } from "@/components/chat/MessageText";
import { getOrCreateClientId } from "@/lib/clientId";
import { sendChatMessage, toHistory, type ChatCard } from "@/lib/chatClient";
import { identity } from "@profile";
import SharedImage from "@/assets/shared _image.jpg";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  cards: ChatCard[];
  followUps: string[];
  timestamp: Date;
}

let messageCounter = 0;
function nextId(): string {
  messageCounter += 1;
  return `m${Date.now()}-${messageCounter}`;
}

export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
  const [rateLimitSecondsLeft, setRateLimitSecondsLeft] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);
  const hasHandledInitialQuery = useRef(false);
  const clientIdRef = useRef<string>("");
  // Read inside the send handler so the callback identity doesn't change on
  // every message, which would restart the initial-query effect.
  const messagesRef = useRef<Message[]>([]);

  if (!clientIdRef.current) {
    clientIdRef.current = getOrCreateClientId();
  }

  messagesRef.current = messages;

  useEffect(() => {
    document.title = `Chat with SibzAI | ${identity.shortName} AI Portfolio`;
  }, []);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Live countdown while rate-limited; clears itself once the window elapses.
  useEffect(() => {
    if (!rateLimitedUntil) return;
    const tick = () => {
      const secondsLeft = Math.max(0, Math.ceil((rateLimitedUntil - Date.now()) / 1000));
      setRateLimitSecondsLeft(secondsLeft);
      if (secondsLeft <= 0) setRateLimitedUntil(null);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [rateLimitedUntil]);

  const isRateLimited = !!rateLimitedUntil && rateLimitSecondsLeft > 0;

  /**
   * Sends a message. All intent detection, knowledge, and card selection happen
   * server-side — this only moves text in and renders what comes back.
   */
  const handleSendMessage = useCallback(
    async (message?: string) => {
      const text = (message ?? input).trim();
      if (!text || isLoading) return;
      if (rateLimitedUntil && Date.now() < rateLimitedUntil) return;

      const history = toHistory(
        messagesRef.current.map((m) => ({ role: m.role, content: m.content })),
      );

      const userMessage: Message = {
        id: nextId(),
        role: "user",
        content: text,
        cards: [],
        followUps: [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      const result = await sendChatMessage(text, history, clientIdRef.current);
      if (!isMounted.current) return;

      if (result.kind === "ok") {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "assistant",
            content: result.reply.text,
            cards: result.reply.cards,
            followUps: result.reply.followUps,
            timestamp: new Date(),
          },
        ]);
      } else {
        if (result.kind === "rate-limited") {
          setRateLimitedUntil(Date.now() + result.retryAfter * 1000);
        }
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "assistant",
            content: result.message,
            cards: [],
            followUps: [],
            timestamp: new Date(),
          },
        ]);
      }

      setIsLoading(false);
    },
    [input, isLoading, rateLimitedUntil],
  );

  // Deep links from the hero: /chat?query=... and the legacy /chat?show_badges=true.
  useEffect(() => {
    if (hasHandledInitialQuery.current) return;

    const initialQuery = searchParams.get("query");
    const showBadges = searchParams.get("show_badges") === "true";
    if (!initialQuery && !showBadges) return;

    hasHandledInitialQuery.current = true;
    handleSendMessage(initialQuery || `Show me ${identity.shortName}'s badges`);

    if (showBadges) {
      searchParams.delete("show_badges");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, handleSendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  return (
    // A fixed-height column, not min-h-screen: the messages area owns the only
    // scrollbar, so the composer stays pinned to the bottom of the viewport.
    <div className="h-dvh bg-background flex flex-col overflow-hidden">
      <header className="shrink-0 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-full overflow-hidden border-2 border-primary/20">
              <img src={SharedImage} alt={identity.avatarAlt} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold truncate">Chat with SibzAI</h1>
              <p className="text-xs text-muted-foreground truncate">
                {identity.shortName}'s digital twin
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="container mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && !isLoading && <EmptyState onAsk={handleSendMessage} />}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 sm:gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-gradient-primary">
                {message.role === "user" ? (
                  <User className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <Bot className="w-4 h-4 text-primary-foreground" />
                )}
              </div>

              <Card
                className={`p-4 min-w-0 ${
                  message.role === "user"
                    ? "max-w-[85%] sm:max-w-xl bg-primary/10 border-primary/20"
                    : "flex-1 bg-card/60"
                }`}
              >
                {message.role === "user" ? (
                  <MessageText content={message.content} />
                ) : (
                  <AssistantMessage
                    content={message.content}
                    cards={message.cards}
                    followUps={message.followUps}
                    animate={message.id === lastAssistantId}
                    onSelectFollowUp={handleSendMessage}
                    followUpsDisabled={isLoading || isRateLimited}
                  />
                )}
                <span className="text-[11px] text-muted-foreground mt-3 block">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </Card>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 sm:gap-4">
              <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-gradient-primary">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <Card className="p-4 bg-card/60">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary/80" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-card/50 backdrop-blur-sm px-4 sm:px-6 py-4">
        <div className="container mx-auto max-w-3xl">
          {isRateLimited && (
            <div className="mb-3 text-sm text-center text-muted-foreground bg-muted/50 rounded-md py-2">
              Rate limit reached — you can send another message in {rateLimitSecondsLeft}s
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              placeholder={
                isRateLimited
                  ? `Please wait ${rateLimitSecondsLeft}s...`
                  : `Ask about ${identity.shortName}'s work, projects, or interests...`
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-background"
              disabled={isLoading || isRateLimited}
              aria-label="Message"
            />
            <Button
              type="submit"
              variant="hero"
              disabled={!input.trim() || isLoading || isRateLimited}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
