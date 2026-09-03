import { Button } from "@/components/ui/enhanced-button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, ExternalLink } from "lucide-react";
import { identity, projects } from "@profile";

const GITHUB_URL =
  identity.links.find((link) => link.label === "GitHub")?.url ?? "https://github.com/Sibz-Design";

/**
 * Project cards. The list itself lives in the shared profile data
 * (`supabase/functions/_shared/profile/projects.ts`) so the AI and this card
 * always describe the same projects — add one there and it appears here.
 */
export function Projects() {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col overflow-hidden bg-card/40">
            <img
              src={project.image}
              alt={project.title}
              loading="lazy"
              className="w-full h-36 object-cover border-b border-border/60"
            />
            <CardHeader className="pb-2">
              <CardTitle className="text-base leading-snug">{project.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-3">
              <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 text-[11px] rounded-full bg-primary/10 border border-primary/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild size="sm" variant="outline">
                <a href={project.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  View project
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button asChild variant="hero" size="sm">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <Github className="w-4 h-4" />
            View on GitHub
          </a>
        </Button>
      </div>
    </div>
  );
}
