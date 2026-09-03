import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { hobbies } from "@profile";
import { resolveIcon } from "./icon-map";
import { MediaGallery } from "./MediaGallery";

/**
 * Renders whatever is in the shared `hobbies` array — add or remove an entry
 * there and this card follows automatically. Each tile expands to reveal the
 * longer `details` so the card stays compact by default.
 */
export function HobbiesCard() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {hobbies.map((hobby) => {
        const Icon = resolveIcon(hobby.icon);
        const isOpen = expandedId === hobby.id;
        const hasDetails = hobby.details.length > 0;

        return (
          <div
            key={hobby.id}
            className="rounded-lg border border-border/60 bg-card/40 p-4 transition-colors hover:border-primary/30"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 shrink-0 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold leading-snug">{hobby.label}</h4>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{hobby.blurb}</p>

                <MediaGallery media={hobby.media} label={hobby.label} />

                {hasDetails && (
                  <>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isOpen ? null : hobby.id)}
                      aria-expanded={isOpen}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-primary/80 hover:text-primary transition-colors"
                    >
                      {isOpen ? "Less" : "More"}
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isOpen && (
                      <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground list-disc list-outside ml-4">
                        {hobby.details.map((detail, i) => (
                          <li key={i} className="leading-relaxed">
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
