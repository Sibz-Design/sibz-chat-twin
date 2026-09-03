import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/enhanced-button";
import { ChatCards } from "./ChatCards";
import { MessageText } from "./MessageText";
import { SuggestionChips } from "./SuggestionChips";
import type { ChatCard } from "@/lib/chatClient";

/** Roughly how long a full reveal takes, regardless of answer length. */
const REVEAL_DURATION_MS = 700;
const FRAME_MS = 24;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Progressive text reveal.
 *
 * The edge function returns complete answers rather than a token stream, so
 * this supplies the "being written" feel on the client. It is time-boxed rather
 * than fixed-speed, so a long answer doesn't take noticeably longer to appear.
 */
function useRevealedText(content: string, animate: boolean): { shown: string; done: boolean } {
  const [charCount, setCharCount] = useState(() => (animate && !prefersReducedMotion() ? 0 : content.length));

  useEffect(() => {
    if (!animate || prefersReducedMotion()) {
      setCharCount(content.length);
      return;
    }

    setCharCount(0);
    const step = Math.max(1, Math.ceil(content.length / (REVEAL_DURATION_MS / FRAME_MS)));
    const interval = setInterval(() => {
      setCharCount((prev) => {
        const next = prev + step;
        if (next >= content.length) {
          clearInterval(interval);
          return content.length;
        }
        return next;
      });
    }, FRAME_MS);

    return () => clearInterval(interval);
  }, [content, animate]);

  return { shown: content.slice(0, charCount), done: charCount >= content.length };
}

export function AssistantMessage({
  content,
  cards,
  followUps,
  animate,
  onSelectFollowUp,
  followUpsDisabled,
}: {
  content: string;
  cards: ChatCard[];
  followUps: string[];
  animate: boolean;
  onSelectFollowUp: (question: string) => void;
  followUpsDisabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const { shown, done } = useRevealedText(content, animate);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="relative">
      {content && (
        <div className="pr-10">
          <MessageText content={shown} />
        </div>
      )}

      {content && (
        <div className="absolute top-0 right-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            aria-label={copied ? "Copied" : "Copy message"}
            onClick={handleCopy}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
      )}

      {/* Cards and follow-ups wait for the text so the answer reads in order. */}
      {done && <ChatCards cards={cards} />}
      {done && (
        <SuggestionChips
          suggestions={followUps}
          onSelect={onSelectFollowUp}
          disabled={followUpsDisabled}
        />
      )}
    </div>
  );
}
