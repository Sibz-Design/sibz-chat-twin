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

  summary: [
    "Siba is a Cape Town-based IT Support and AI Automation professional with hands-on experience in",
    "technical customer support, helpdesk operations, and building AI-powered automation workflows.",
    "He graduated from the CAPACITI programme and now works as a Customer Support Agent at Clickatell,",
    "supporting enterprise and developer customers with SMS and API messaging services in a fast-paced,",
    "SLA-driven environment. Outside of his day job he builds AI and automation projects, and he holds a",
    "Diploma in ICT Support Services alongside certificates from Google, Cisco, IBM, Microsoft, AWS,",
    "Stanford, Duke, and Johns Hopkins.",
  ].join(" "),

  elevatorPitch:
    "IT support and AI automation professional at Clickatell, building AI workflow projects and studying machine learning on the side.",

  email: "sibabalwedes@gmail.com",

  links: [
    { label: "GitHub", url: "https://github.com/Sibz-Design" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/sibabalwe-desemela-554789253/" },
    {
      label: "Certificates",
      url: "https://drive.google.com/drive/folders/1ubhYNykU6iMgzSvxeix6WpdfVniZGc5A?usp=sharing",
    },
  ],
};
