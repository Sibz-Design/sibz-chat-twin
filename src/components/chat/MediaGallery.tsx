import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { MediaItem } from "@profile";

/**
 * Thumbnail strip that opens a lightbox.
 *
 * Media files are referenced by path in the profile data and may not exist yet,
 * so anything that fails to load is dropped from the gallery rather than left as
 * a broken tile. If every item fails, the strip renders nothing at all.
 */
export function MediaGallery({ media, label }: { media: MediaItem[]; label: string }) {
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const markFailed = useCallback((src: string) => {
    setFailed((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));
  }, []);

  // Embeds load in an iframe, which gives no reliable error signal — always keep them.
  const visible = useMemo(
    () => media.filter((item) => item.kind === "embed" || !failed.has(item.src)),
    [media, failed],
  );

  // Close the lightbox if the item it was showing turned out to be missing.
  useEffect(() => {
    if (openIndex !== null && openIndex >= visible.length) setOpenIndex(null);
  }, [openIndex, visible.length]);

  // Preload images so broken paths are filtered out before the strip is drawn,
  // rather than flashing a broken tile and then disappearing.
  useEffect(() => {
    for (const item of media) {
      const src = item.kind === "video" ? item.poster : item.kind === "image" ? item.src : undefined;
      if (!src) continue;
      const probe = new Image();
      probe.onerror = () => markFailed(item.src);
      probe.src = src;
    }
  }, [media, markFailed]);

  const showPrev = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i - 1 + visible.length) % visible.length)),
    [visible.length],
  );
  const showNext = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % visible.length)),
    [visible.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, showPrev, showNext]);

  if (visible.length === 0) return null;

  const active = openIndex === null ? null : visible[openIndex];

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-3">
        {visible.map((item, index) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={`Open: ${item.alt}`}
            className="relative w-16 h-16 rounded-md overflow-hidden border border-border/60 transition-all hover:border-primary/40 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {item.kind === "image" ? (
              <img
                src={item.src}
                alt=""
                loading="lazy"
                onError={() => markFailed(item.src)}
                className="w-full h-full object-cover"
              />
            ) : item.kind === "video" && item.poster ? (
              <img
                src={item.poster}
                alt=""
                loading="lazy"
                onError={() => markFailed(item.src)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="w-full h-full bg-muted block" />
            )}

            {item.kind !== "image" && (
              <span className="absolute inset-0 flex items-center justify-center bg-background/40">
                <Play className="w-4 h-4 text-foreground" fill="currentColor" />
              </span>
            )}
          </button>
        ))}
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
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
                  // Not autoplayed: a clip that starts on its own in a chat
                  // thread is an ambush. `key` forces a fresh element when
                  // navigating, so the previous clip stops.
                  <video
                    key={active.src}
                    src={active.src}
                    poster={active.poster}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={active.alt}
                    onError={() => markFailed(active.src)}
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

                {visible.length > 1 && (
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
                {visible.length > 1 && (
                  <p className="text-xs text-muted-foreground shrink-0">
                    {(openIndex ?? 0) + 1} / {visible.length}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
