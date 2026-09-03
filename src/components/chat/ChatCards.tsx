import { Badges } from "@/components/Badges";
import { Certificates } from "@/components/Certificates";
import { Projects } from "@/components/Projects";
import { ContactCard } from "./ContactCard";
import { ExperienceCard } from "./ExperienceCard";
import { HobbiesCard } from "./HobbiesCard";
import { ProfileCard } from "./ProfileCard";
import { SkillsCard } from "./SkillsCard";
import type { ChatCard } from "@/lib/chatClient";

const RENDERERS: Record<string, () => JSX.Element> = {
  profile: ProfileCard,
  hobbies: HobbiesCard,
  skills: SkillsCard,
  contact: ContactCard,
  experience: ExperienceCard,
  projects: Projects,
  certificates: Certificates,
  badges: Badges,
};

/**
 * Renders the cards the server asked for. The server decides *what* to show;
 * this decides *how*. An unrecognised card type is skipped silently so a future
 * server-side addition can never break an older client.
 */
export function ChatCards({ cards }: { cards: ChatCard[] }) {
  const renderable = cards.filter((card) => card.type in RENDERERS);
  if (renderable.length === 0) return null;

  return (
    <div className="mt-4 space-y-4">
      {renderable.map((card, index) => {
        const Renderer = RENDERERS[card.type];
        return (
          <div key={`${card.type}-${index}`} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Renderer />
          </div>
        );
      })}
    </div>
  );
}
