import { badges } from "@profile";

/** Badge images, sourced from the shared profile data. */
export function Badges() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {badges.map((badge) => (
        <figure key={badge.label} className="flex flex-col items-center gap-2">
          <img
            src={badge.image}
            alt={`${badge.label} badge`}
            loading="lazy"
            className="w-28 h-28 sm:w-36 sm:h-36 object-contain rounded-lg transition-transform hover:scale-105"
          />
          <figcaption className="text-xs text-muted-foreground text-center">{badge.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}
