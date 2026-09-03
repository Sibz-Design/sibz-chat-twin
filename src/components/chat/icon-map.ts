import {
  Award,
  BrainCircuit,
  Briefcase,
  Church,
  CircleDot,
  Clapperboard,
  Cloud,
  Code2,
  FolderGit2,
  GraduationCap,
  Heart,
  HeartHandshake,
  Headset,
  Mail,
  MonitorCog,
  Mountain,
  Network,
  Sparkles,
  TrendingUp,
  Trophy,
  Tv,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

// The profile data stores icons as plain strings so it stays importable by the
// Deno edge function, which has no React. This map is the frontend-only half of
// that arrangement. Adding an icon here is optional — an unmapped name renders
// the neutral fallback rather than crashing the card.
const ICONS: Record<string, LucideIcon> = {
  Award,
  BrainCircuit,
  Briefcase,
  Church,
  Clapperboard,
  Cloud,
  Code2,
  FolderGit2,
  GraduationCap,
  Heart,
  HeartHandshake,
  Headset,
  Mail,
  MonitorCog,
  Mountain,
  Network,
  Sparkles,
  TrendingUp,
  Trophy,
  Tv,
  UserRound,
  Users,
};

export function resolveIcon(name: string | undefined): LucideIcon {
  return (name && ICONS[name]) || CircleDot;
}
