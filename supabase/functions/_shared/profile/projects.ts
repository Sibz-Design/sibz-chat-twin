import type { Project } from "./types.ts";

export const projects: Project[] = [
  {
    id: "yt-analytics",
    title: "YouTube Comment Analytics Dashboard",
    description:
      "A Python web application for analysing YouTube comments with interactive charts, sentiment analysis, and video data visualisation.",
    tech: ["Python", "Flask", "n8n", "YouTube Data API"],
    image: "/projects/yt_dashboard.png",
    link: "https://car-sense-t14j.onrender.com/",
    featured: true,
  },
  {
    id: "sentify",
    title: "Sentiment Analysis Dashboard",
    description:
      "An interactive dashboard for real-time sentiment analysis, built on Hugging Face's natural language processing models.",
    tech: ["Python", "Streamlit", "Hugging Face"],
    image: "/projects/Sentify.png",
    link: "https://sentiment-dashboard-evzvmpqgutwht5bubgbh4u.streamlit.app/",
    featured: true,
  },
  {
    id: "resume-ai-craft",
    title: "Resume AI Craft",
    description:
      "An open-source resume builder that helps you create professional, ATS-friendly resumes with the help of AI.",
    tech: ["TypeScript", "React", "OpenAI API"],
    image: "/placeholder.svg",
    link: "https://github.com/Sibz-Design/resume-ai-craft-92",
    repo: "https://github.com/Sibz-Design/resume-ai-craft-92",
    featured: true,
  },
  {
    id: "hr-cv-screening",
    title: "HR CV Screening Pipeline",
    description:
      "An AI agent that screens incoming CVs against a role brief, scores candidates, and writes the results back to the hiring team's workspace.",
    tech: ["n8n", "OpenAI API", "Airtable"],
    image: "/placeholder.svg",
    link: "https://github.com/Sibz-Design",
    featured: false,
  },
  {
    id: "booking-automation",
    title: "Booking Automation System",
    description:
      "A full-cycle booking workflow that handles enquiry intake, confirmation, calendar scheduling, and follow-up reminders without manual steps.",
    tech: ["Make (Integromat)", "OpenAI API", "Airtable"],
    image: "/placeholder.svg",
    link: "https://github.com/Sibz-Design",
    featured: false,
  },
];
