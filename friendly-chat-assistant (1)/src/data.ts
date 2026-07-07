import { PresetTopic } from "./types";

export const PRESET_TOPICS: PresetTopic[] = [
  {
    id: "warm-poem",
    label: "Write an encouraging poem",
    prompt: "Write a short, encouraging poem for a friend who is having a tough week. Keep it light, hopeful, and heartwarming.",
    category: "creative",
    icon: "Sparkles",
  },
  {
    id: "quantum-kids",
    label: "Explain quantum physics to a 5yo",
    prompt: "Can you explain quantum computing or quantum physics to me in a way a five-year-old would understand? Use a fun analogy like toys or cats!",
    category: "learning",
    icon: "GraduationCap",
  },
  {
    id: "warm-email",
    label: "Draft a friendly request email",
    prompt: "Help me draft a warm and polite email to my team lead requesting a one-day extension on our current project deliverable.",
    category: "work",
    icon: "Mail",
  },
  {
    id: "fun-riddle",
    label: "Tell me a clever riddle",
    prompt: "Give me a clever riddle to solve, but don't tell me the answer right away! Let me try to guess it first.",
    category: "creative",
    icon: "Brain",
  },
  {
    id: "learn-cook",
    label: "Suggest a 15-min comfort meal",
    prompt: "What is a delicious, cozy, and comforting meal that I can cook in under 15 minutes with common kitchen ingredients?",
    category: "learning",
    icon: "Utensils",
  },
  {
    id: "career-chat",
    label: "Mock interview practice",
    prompt: "Let's do a quick, friendly mock interview for a general software engineer position. Start by asking me just one warm icebreaker question!",
    category: "work",
    icon: "Briefcase",
  },
  {
    id: "casual-chat",
    label: "Tell me a light joke",
    prompt: "Tell me a light, family-friendly joke or a pun that is sure to make me smile!",
    category: "chat",
    icon: "Smile",
  },
];
