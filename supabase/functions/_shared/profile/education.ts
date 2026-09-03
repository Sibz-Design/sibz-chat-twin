import type { CertificationGroup, EducationEntry } from "./types.ts";

export const education: EducationEntry[] = [
  {
    qualification: "Diploma in ICT Support Services",
    institution: "Walter Sisulu University",
    location: "East London, South Africa",
    period: "March 2021 – May 2025",
  },
];

export const certifications: CertificationGroup[] = [
  {
    label: "IT Support & Networking",
    items: [
      "Google IT Support Professional Certificate (Technical Support Fundamentals, Computer Networking, Operating Systems, System Administration, IT Security, Detection and Response)",
      "Cisco Networking Academy: Networking Devices and Initial Configuration, Introduction to Modern AI",
      "IBM: Introduction to Hardware and Operating Systems, Technical Support Case Studies and Capstone",
    ],
  },
  {
    label: "AI, Machine Learning & Data Science",
    items: [
      "DeepLearning.AI / Stanford: Supervised Machine Learning, Advanced Learning Algorithms, Unsupervised Learning & Reinforcement Learning, AI For Everyone",
      "AWS: Generative AI with Large Language Models",
      "Google Cloud: Introduction to Generative AI, Introduction to Responsible AI",
      "Microsoft: Artificial Intelligence on Microsoft Azure",
      "IBM: Introduction to Artificial Intelligence, Building AI-Powered Chatbots Without Programming, Python for Data Science",
      "Duke University: Human Factors in AI, Machine Learning Foundations for Product Managers, Managing Machine Learning Projects",
      "Johns Hopkins University: Trustworthy AI — Managing Bias, Ethics, and Accountability",
      "Arizona State University: AI Foundations — Prompt Engineering with ChatGPT",
      "Intel: AI Essentials",
    ],
  },
  {
    label: "Cloud & Data",
    items: [
      "AWS Cloud Fundamentals (Coursera)",
      "Microsoft Power BI (Career Boost)",
      "IBM: Python for Data Science, AI and Development",
    ],
  },
  {
    label: "Professional Development",
    items: [
      "University of Pennsylvania: Positive Psychology — Resilience Skills",
      "University of Maryland: Managing Conflicts with Cultural and Emotional Intelligence",
      "Macquarie University: Negotiation Skills",
      "Arizona State University: Emotional Intelligence, Grit and Growth Mindset",
      "IBM: Developing Interpersonal Skills, Creative and Critical Thinking",
      "UCI: Time Management for Personal and Professional Productivity",
      "Vanderbilt University: ChatGPT + Zapier for Inbox Intelligence",
      "CAPACITI: Professional Development",
    ],
  },
];

export const badges = [
  { label: "AI Bootcamp", image: "/badges/ai-bootcamp.avif" },
  { label: "Professional Development", image: "/badges/professional-development.avif" },
  { label: "Technical Support", image: "/badges/technical-support.avif" },
];
