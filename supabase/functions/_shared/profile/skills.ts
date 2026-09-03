import type { SkillGroup } from "./types.ts";

// `icon` values are lucide-react icon names, resolved to components by the
// frontend in src/components/chat/icon-map.ts. A group with an unknown icon
// name falls back to a neutral default rather than crashing.
export const skillGroups: SkillGroup[] = [
  {
    id: "support",
    label: "IT Support & Helpdesk",
    icon: "Headset",
    items: [
      "End-user support",
      "Hardware & software troubleshooting",
      "Jira ticketing",
      "SLA management",
      "ITIL framework",
      "Incident escalation",
    ],
  },
  {
    id: "networking",
    label: "Networking",
    icon: "Network",
    items: ["TCP/IP", "DNS", "DHCP", "VPN", "Wi-Fi configuration", "Cisco fundamentals"],
  },
  {
    id: "ai",
    label: "AI & Automation",
    icon: "Sparkles",
    items: [
      "n8n",
      "Make (Integromat)",
      "OpenAI API",
      "Cohere",
      "Hugging Face",
      "Prompt engineering",
      "RAG basics",
      "Sentiment analysis",
    ],
  },
  {
    id: "programming",
    label: "Programming & Data",
    icon: "Code2",
    items: ["Python", "Flask", "Streamlit", "Data analysis", "Data visualisation", "Power BI"],
  },
  {
    id: "cloud",
    label: "Cloud & Platforms",
    icon: "Cloud",
    items: ["AWS (fundamentals)", "Google Cloud", "Microsoft Azure", "Supabase"],
  },
  {
    id: "systems",
    label: "Operating Systems",
    icon: "MonitorCog",
    items: ["Windows 10/11", "Linux (Ubuntu)", "Basic system administration"],
  },
  {
    id: "soft",
    label: "Soft Skills",
    icon: "HeartHandshake",
    items: [
      "Active listening",
      "Conflict resolution",
      "Written & verbal communication",
      "Critical thinking",
      "Attention to detail",
      "Adaptability",
    ],
  },
];
