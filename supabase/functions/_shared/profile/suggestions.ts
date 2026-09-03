// Conversation starters and follow-up chips. Pure content — edit freely.

/** Categories shown in the chat empty state ("Ask me about..."). */
export const starters: Array<{ id: string; icon: string; label: string; question: string }> = [
  { id: "who", icon: "UserRound", label: "Who is Siba?", question: "Who is Siba?" },
  { id: "hobbies", icon: "Heart", label: "Hobbies & interests", question: "What are Siba's hobbies?" },
  { id: "projects", icon: "FolderGit2", label: "Projects", question: "What projects has Siba worked on?" },
  { id: "skills", icon: "Code2", label: "Skills & tech", question: "What technologies does Siba use?" },
  { id: "experience", icon: "Briefcase", label: "Experience", question: "Tell me about Siba's experience" },
  { id: "contact", icon: "Mail", label: "Get in touch", question: "How can I contact Siba?" },
];

/** Follow-up chips shown under an answer, keyed by the intent that produced it. */
export const followUps: Record<string, string[]> = {
  who: ["What does Siba do day to day?", "What are his hobbies?", "What is he working towards?"],
  hobbies: [
    "Which football team does Siba support?",
    "Tell me about the short film he acted in",
    "What got Siba into AI?",
  ],
  projects: ["What technologies did he use?", "Which project is he proudest of?", "Where is his GitHub?"],
  skills: ["How did he learn all this?", "What certifications does he have?", "Show me his projects"],
  experience: ["What does he do at Clickatell?", "What did he do at CAPACITI?", "Show me his skills"],
  education: ["What certifications does he have?", "Show me his badges", "What is he learning now?"],
  certificates: ["Show me his badges", "What are his AI skills?", "Tell me about his education"],
  badges: ["What certifications does he have?", "Show me his projects", "Who is Siba?"],
  contact: ["Who is Siba?", "Show me his projects", "What is he looking for?"],
  goals: ["What is he learning now?", "Show me his projects", "How can I contact him?"],
  default: ["Who is Siba?", "What are his hobbies?", "Show me his projects"],
};
