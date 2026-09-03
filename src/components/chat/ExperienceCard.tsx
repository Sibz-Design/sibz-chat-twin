import { Briefcase, GraduationCap } from "lucide-react";
import { education, languages, roles } from "@profile";
import { DownloadCV } from "./DownloadCV";

/**
 * Work-history timeline. Replaces the old hardcoded <Resume /> component — the
 * same content, but read from the shared profile data so it can never drift
 * from what the AI says.
 */
export function ExperienceCard() {
  return (
    <div className="space-y-5">
      <ol className="relative border-l border-border/60 ml-1.5 space-y-5">
        {roles.map((role) => (
          <li key={`${role.org}-${role.period}`} className="pl-5">
            <span
              className={`absolute -left-[7px] mt-1.5 w-3 h-3 rounded-full border-2 border-background ${
                role.current ? "bg-primary" : "bg-muted-foreground/50"
              }`}
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-baseline gap-x-2">
              <h4 className="text-sm font-semibold">{role.title}</h4>
              {role.current && (
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wide rounded-full bg-primary/15 border border-primary/25">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {role.org} · {role.location} · {role.period}
            </p>
            <p className="text-xs text-foreground/80 mt-2 leading-relaxed">{role.summary}</p>
            <ul className="mt-2 space-y-1 list-disc list-outside ml-4">
              {role.highlights.map((highlight, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                  {highlight}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <div className="flex items-center gap-3 flex-wrap">
        <DownloadCV showMeta />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 pt-1">
        <div className="rounded-lg border border-border/60 bg-card/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-4 h-4 text-primary/80" />
            <h4 className="text-sm font-semibold">Education</h4>
          </div>
          {education.map((entry) => (
            <div key={entry.qualification}>
              <p className="text-xs text-foreground/85 leading-relaxed">{entry.qualification}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {entry.institution} · {entry.period}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border/60 bg-card/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-primary/80" />
            <h4 className="text-sm font-semibold">Languages</h4>
          </div>
          <p className="text-xs text-muted-foreground">{languages.join(" · ")}</p>
        </div>
      </div>
    </div>
  );
}
