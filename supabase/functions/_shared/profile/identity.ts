import type { Identity } from "./types.ts";

export const identity: Identity = {
  name: "Sibabalwe Desemela",
  shortName: "Siba",
  aliases: ["siba", "sibz", "sibabalwe", "sibzai", "desemela"],
  headline: "IT Support Specialist & AI/ML Enthusiast",
  location: "Cape Town, Western Cape, South Africa",

  // If this file is missing the ProfileCard falls back to the hero portrait,
  // so changing it is safe even before the new image is in place.
  avatar: "/profile/Siba_Des_pp.jpeg",
  avatarAlt: "Sibabalwe Desemela",

  tagline: "Curiosity drives him. Solving problems sharpens his skills. Building solutions keeps him busy.",

  // The full answer to "Who is Siba?" — paragraphs, joined with blank lines.
  // The rebuild had collapsed this to a single paragraph and lost the detail on
  // projects, certifications, and career direction; this restores it.
  summary: [
    "Siba is a Cape Town-based IT Support and AI Automation professional with hands-on experience in technical support, helpdesk operations, and building AI-powered automation workflows.",
    "He graduated from the CAPACITI programme and is now an Enterprise Support Agent at Clickatell, working as a Technical Support Specialist for enterprise and developer customers using SMS and API messaging services, in a fast-paced, SLA-driven environment.",
    "Outside of his day job he builds AI and automation projects, including an HR CV screening pipeline, a booking automation system, and a sentiment analysis dashboard, using tools such as n8n, Make, OpenAI, Hugging Face, and Python.",
    "He holds a Diploma in ICT Support Services and has completed a wide range of certificates and learning programmes from institutions including Google, Cisco, IBM, Microsoft, AWS, Stanford, Duke, and Johns Hopkins, covering IT support, networking, cloud platforms, AI, machine learning, and data science.",
    "He is building a career at the intersection of technical support, automation, and AI, with a strong interest in environments where curiosity, ownership, and continuous learning are genuinely valued.",
  ].join("\n\n"),

  // Headline keeps "IT Support Specialist" — it's what he studied for. The role
  // title lives in career.ts and is surfaced here so the two never disagree.
  elevatorPitch:
    "Enterprise Support Agent and Technical Support Specialist at Clickatell, building AI automation projects and learning machine learning on the side.",

  email: "sibabalwedes@gmail.com",

  cv: {
    path: "/Sibabalwe_Desemela_CV.pdf",
    filename: "Sibabalwe_Desemela_CV.pdf",
    meta: "PDF · 132 KB",
  },

  links: [
    { label: "GitHub", url: "https://github.com/Sibz-Design" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/sibabalwe-desemela-554789253/" },
    {
      label: "Certificates",
      url: "https://drive.google.com/drive/folders/1ubhYNykU6iMgzSvxeix6WpdfVniZGc5A?usp=sharing",
    },
  ],
};
