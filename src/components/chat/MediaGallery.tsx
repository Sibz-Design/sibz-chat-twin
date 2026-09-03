import { useCallback, useEffect, useMemo, useState } from "react";
import { Play } from "lucide-react";
import { MediaLightbox } from "./MediaLightbox";
import type { MediaItem } from "@profile";

/**
 * Thumbnail strip that opens the shared lightbox.
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

  if (visible.length === 0) return null;

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

      <MediaLightbox
        items={visible}
        openIndex={openIndex}
        onOpenIndexChange={setOpenIndex}
        label={label}
        onFailed={markFailed}
      />
    </>
  );
}
