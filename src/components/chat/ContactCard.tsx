import { ExternalLink, Mail } from "lucide-react";
import { identity } from "@profile";

/** The only place contact details are rendered — they come from the profile data. */
export function ContactCard() {
  return (
    <div className="flex flex-col gap-2">
      <a
        href={`mailto:${identity.email}`}
        className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-4 py-3 hover:border-primary/30 transition-colors group"
      >
        <Mail className="w-4 h-4 text-primary/80 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Email</p>
          <p className="text-sm truncate group-hover:text-foreground">{identity.email}</p>
        </div>
      </a>

      {identity.links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-4 py-3 hover:border-primary/30 transition-colors group"
        >
          <ExternalLink className="w-4 h-4 text-primary/80 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{link.label}</p>
            <p className="text-sm truncate group-hover:text-foreground">
              {link.url.replace(/^https?:\/\/(www\.)?/, "")}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
