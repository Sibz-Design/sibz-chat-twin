import { Button } from "@/components/ui/enhanced-button";
import { ExternalLink } from "lucide-react";
import { certifications, education, identity } from "@profile";

const DRIVE_URL =
  identity.links.find((link) => link.label === "Certificates")?.url ??
  "https://drive.google.com/drive/folders/1ubhYNykU6iMgzSvxeix6WpdfVniZGc5A?usp=sharing";

/**
 * Education plus certification groups. Content comes from the shared profile
 * data, so the AI's answer and this card can never disagree.
 */
export function Certificates() {
  return (
    <div className="space-y-4">
      {education.map((entry) => (
        <div key={entry.qualification} className="rounded-lg border border-border/60 bg-card/40 p-4">
          <h4 className="text-sm font-semibold">{entry.qualification}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {entry.institution} · {entry.period}
          </p>
        </div>
      ))}

      {certifications.map((group) => (
        <div key={group.label}>
          <h4 className="text-sm font-semibold mb-2">{group.label}</h4>
          <ul className="space-y-1.5">
            {group.items.map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground leading-relaxed pl-3 border-l border-border/60">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <Button asChild size="sm" variant="outline">
        <a href={DRIVE_URL} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="w-4 h-4" />
          View all certificates
        </a>
      </Button>
    </div>
  );
}
