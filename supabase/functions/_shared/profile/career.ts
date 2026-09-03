import type { Role } from "./types.ts";

export const roles: Role[] = [
  {
    title: "Enterprise Support Agent",
    org: "Clickatell",
    location: "Cape Town, South Africa",
    period: "April 2026 – Present",
    current: true,
    summary:
      "Technical Support Specialist for Clickatell's enterprise and developer customers, covering SMS and API messaging services.",
    highlights: [
      "Troubleshoots delivery failures using system logs, delivery reports, and error codes.",
      "Supports customers with platform usage, API configuration, sender ID registration, short codes, and IP whitelisting.",
      "Escalates complex technical and network issues to Technical, NOC, and Vendor teams with detailed diagnostics.",
      "Translates technical issues into clear customer-facing explanations, progress updates, and resolutions.",
      "Logs and tracks incidents in Jira to maintain SLA compliance and reduce repeat contacts.",
      "Recently promoted into the Enterprise Support Agent role, taking on Clickatell's enterprise accounts.",
    ],
  },
  {
    title: "Technical Support Associate",
    org: "CAPACITI",
    location: "Cape Town, South Africa",
    period: "April 2025 – March 2026",
    current: false,
    summary:
      "Technical support work alongside an AI bootcamp, where most of his automation and ML project portfolio was built.",
    highlights: [
      "Completed industry-recognised Coursera certifications across IT support, networking, cloud, AI, and data science.",
      "Provided technical support focused on hardware, software, and networking troubleshooting.",
      "Built AI automation workflows with n8n, Make, OpenAI, Cohere, and Airtable, including an HR CV screening pipeline and a booking automation system.",
      "Developed a Sentiment Analysis Dashboard (Streamlit + Hugging Face) and a YouTube data pipeline (YouTube Data API + n8n + Flask).",
    ],
  },
  {
    title: "Sales Generator",
    org: "Footgear PTY LTD",
    location: "Port Elizabeth CBD, South Africa",
    period: "November 2024 – December 2024",
    current: false,
    summary: "Retail sales role focused on customer needs analysis and hitting targets.",
    highlights: [
      "Engaged customers to identify needs and promote relevant products, consistently meeting sales targets.",
      "Collaborated with marketing on promotional campaigns that drove in-store sales.",
    ],
  },
  {
    title: "Computer Lab Assistant",
    org: "Walter Sisulu University",
    location: "East London, South Africa",
    period: "February 2023 – December 2023",
    current: false,
    summary: "Maintained university lab systems and supported students day to day.",
    highlights: [
      "Set up and maintained lab computers, including hardware installation and cable management.",
      "Provided daily technical support to students, troubleshooting hardware and software issues.",
      "Referred major faults to senior technicians and monitored lab systems daily.",
    ],
  },
];
