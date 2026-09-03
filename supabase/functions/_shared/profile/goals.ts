// Professional direction. Used when someone asks what Siba is working towards,
// what he is looking for, or where he wants to take his career.
export const goals: string[] = [
  "Grow into a role that sits between technical support and AI engineering, where automation removes repetitive support work.",
  "Deepen practical machine learning skills beyond coursework — moving from following tutorials to shipping and maintaining models.",
  "Build more end-to-end automation systems that real teams use day to day, rather than demo projects.",
  "Work somewhere curiosity, ownership, and continuous learning are genuinely valued rather than just listed as values.",
];

export const languages: string[] = ["English (C2)", "IsiXhosa (Native)"];

// Beyond the general "only answer questions about Siba" rule, these are topics
// SibzAI should decline even when a question is technically about him.
export const offLimits: string[] = [
  "Salary, compensation, or rate expectations",
  "Home address, phone number, or ID details",
  "Opinions about named former colleagues or employers",
  "Relationship, family, or health details",
  // Church attendance is part of the hobbies section, so the AI can state it.
  // What it must not do is go beyond that into beliefs, doctrine, or politics.
  "Religious or political opinions beyond what the profile already states",
];
