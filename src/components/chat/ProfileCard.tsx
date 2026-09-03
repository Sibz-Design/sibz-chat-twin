import { useState } from "react";
import { MapPin } from "lucide-react";
import { identity } from "@profile";
import fallbackPortrait from "@/assets/shared _image.jpg";

/**
 * Shown when the server returns a `profile` card — i.e. someone asked who Siba
 * is. The photo path comes from the shared profile data; if that file has not
 * been added to `public/` yet, this falls back to the existing hero portrait so
 * the card never renders broken.
 */
export function ProfileCard() {
  const [imageFailed, setImageFailed] = useState(false);
  const src = !identity.avatar || imageFailed ? fallbackPortrait : identity.avatar;

  return (
    <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
      <img
        src={src}
        alt={identity.avatarAlt}
        onError={() => setImageFailed(true)}
        loading="lazy"
        className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl object-cover border border-border/60 shadow-elegant"
      />
      <div className="text-center sm:text-left">
        <h3 className="text-lg font-semibold leading-tight">{identity.name}</h3>
        <p className="text-sm text-primary/90 mt-0.5">{identity.headline}</p>

        <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center sm:justify-start gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          {identity.location}
        </p>

        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{identity.elevatorPitch}</p>

        <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
          {identity.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 text-xs rounded-full border border-border/60 bg-card/60 hover:border-primary/40 hover:text-foreground text-muted-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
