import { CornerDownRight } from "lucide-react";

/**
 * Follow-up questions offered after an answer. The server picks them based on
 * the card it returned, so they always lead somewhere the AI can actually go.
 */
export function SuggestionChips({
  suggestions,
  onSelect,
  disabled,
}: {
  suggestions: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(suggestion)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-border/60 bg-card/40 text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CornerDownRight className="w-3 h-3 shrink-0" />
          {suggestion}
        </button>
      ))}
    </div>
  );
}
