import { useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { MediaItem } from "@profile";

/**
 * Controlled full-size viewer for images, video, and embeds.
 *
 * Shared by MediaGallery (hobby thumbnail strips) and ProfileCard (the avatar),
 * so there is one implementation of the keyboard handling, the paging, and the
 * rule that video never autoplays.
 */
export function MediaLightbox({
  items,
  openIndex,
  onOpenIndexChange,
  label,
  onFailed,
}: {
  items: MediaItem[];
  /** null when closed. */
  openIndex: number | null;
  onOpenIndexChange: (index: number | null) => void;
  /** Prefixed to the accessible dialog title, e.g. the hobby name. */
  label: string;
  /** Called when an item fails to load, so the caller can drop it. */
  onFailed?: (src: string) => void;
}) {
  const count = items.length;

  const showPrev = useCallback(
    () => onOpenIndexChange(openIndex === null ? null : (openIndex - 1 + count) % count),
    [openIndex, count, onOpenIndexChange],
  );
  const showNext = useCallback(
    () => onOpenIndexChange(openIndex === null ? null : (openIndex + 1) % count),
    [openIndex, count, onOpenIndexChange],
  );

  useEffect(() => {
    if (openIndex === null || count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, count, showPrev, showNext]);

  const active = openIndex === null ? null : items[openIndex];

  return (
    <Dialog open={openIndex !== null} onOpenChange={(open) => !open && onOpenIndexChange(null)}>
      <DialogContent className="max-w-3xl p-4">
        <DialogTitle className="sr-only">{`${label}: ${active?.alt ?? ""}`}</DialogTitle>

        {active && (
          <div className="space-y-3">
            <div className="relative flex items-center justify-center bg-black/40 rounded-md overflow-hidden">
              {active.kind === "image" && (
                <img
                  src={active.src}
                  alt={active.alt}
                  className="max-h-[70vh] w-auto max-w-full object-contain"
                />
              )}

              {active.kind === "video" && (
                // Not autoplayed: a clip that starts on its own in a chat thread
                // is an ambush. `key` forces a fresh element when paging, so the
                // previous clip stops.
                <video
                  key={active.src}
                  src={active.src}
                  poster={active.poster}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={active.alt}
                  onError={() => onFailed?.(active.src)}
                  className="max-h-[70vh] w-auto max-w-full"
                />
              )}

              {active.kind === "embed" && (
                <iframe
                  key={active.src}
                  src={active.src}
                  title={active.alt}
                  allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="w-full aspect-video"
                />
              )}

              {count > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPrev}
                    aria-label="Previous"
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border border-border/60 flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    aria-label="Next"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border border-border/60 flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">{active.caption ?? active.alt}</p>
              {count > 1 && (
                <p className="text-xs text-muted-foreground shrink-0">
                  {(openIndex ?? 0) + 1} / {count}
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
