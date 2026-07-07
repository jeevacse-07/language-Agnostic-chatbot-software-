export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  botName: string;
}

export interface PresetTopic {
  id: string;
  label: string;
  prompt: string;
  category: "chat" | "learning" | "creative" | "work";
  icon: string;
}
