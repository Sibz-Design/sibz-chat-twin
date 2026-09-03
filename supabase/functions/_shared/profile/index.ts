import type { Profile } from "./types.ts";
import { identity } from "./identity.ts";
import { roles } from "./career.ts";
import { skillGroups } from "./skills.ts";
import { projects } from "./projects.ts";
import { hobbies } from "./hobbies.ts";
import { badges, certifications, education } from "./education.ts";
import { goals, languages, offLimits } from "./goals.ts";
import { followUps, starters } from "./suggestions.ts";

export const profile: Profile = {
  identity,
  roles,
  skillGroups,
  projects,
  hobbies,
  education,
  certifications,
  goals,
  languages,
  offLimits,
};

export const currentRole = roles.find((r) => r.current) ?? roles[0];

/**
 * Content fingerprint of the whole profile, computed at module load with a
 * synchronous FNV-1a hash.
 *
 * The chat function mixes this into its prompt-cache key, so editing any
 * profile file automatically invalidates every cached answer. Without it, a
 * cached response would keep serving stale content for the full cache TTL
 * after you update, say, a hobby.
 */
export const PROFILE_VERSION: string = (() => {
  const serialized = JSON.stringify(profile);
  let hash = 0x811c9dc5;
  for (let i = 0; i < serialized.length; i++) {
    hash ^= serialized.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
})();

export { badges, certifications, education, followUps, goals, hobbies, identity, languages, offLimits, projects, roles, skillGroups, starters };
export type * from "./types.ts";
