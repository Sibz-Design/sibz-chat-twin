import { identity, starters } from "@profile";
import { resolveIcon } from "./icon-map";

/**
 * The chat's opening screen. Replaces the previous bare bot icon with an
 * explicit "Ask me about..." grid, so a first-time visitor immediately knows
 * what this thing can answer instead of guessing at an empty input.
 */
export function EmptyState({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <div className="py-8 sm:py-12">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold">Ask me about {identity.shortName}</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          I'm SibzAI, {identity.name}'s digital twin. I know his work, his projects, the tech he uses,
          and what he gets up to outside of it. Pick a starting point or just ask.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8 max-w-3xl mx-auto">
        {starters.map((starter) => {
          const Icon = resolveIcon(starter.icon);
          return (
            <button
              key={starter.id}
              type="button"
              onClick={() => onAsk(starter.question)}
              className="group flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-4 py-3 text-left transition-all hover:border-primary/30 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="w-8 h-8 shrink-0 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary-foreground" />
              </span>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {starter.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
