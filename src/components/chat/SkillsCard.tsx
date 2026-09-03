import { skillGroups } from "@profile";
import { resolveIcon } from "./icon-map";

/** Skill badges grouped by discipline, driven entirely by the shared profile data. */
export function SkillsCard() {
  return (
    <div className="space-y-4">
      {skillGroups.map((group) => {
        const Icon = resolveIcon(group.icon);

        return (
          <div key={group.id}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-primary/80" />
              <h4 className="text-sm font-semibold">{group.label}</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 text-xs rounded-full bg-primary/10 border border-primary/20 text-foreground/85"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
