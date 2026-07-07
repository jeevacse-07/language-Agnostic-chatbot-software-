import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  GraduationCap,
  Mail,
  Brain,
  Utensils,
  Briefcase,
  Smile,
  Plus,
  Trash2,
  Send,
  MessageSquare,
  Edit2,
  Settings,
  User,
  Bot,
  X,
  Menu,
  RotateCcw,
  Check,
  ChevronRight,
  Info
} from "lucide-react";
import { Message, ChatThread, PresetTopic } from "./types";
import { PRESET_TOPICS } from "./data";
import MarkdownRenderer from "./components/MarkdownRenderer";

const DEFAULT_BOT_NAME = "Ami";

export default function App() {
  // Local storage keys
  const THREADS_STORAGE_KEY = "friendly_assistant_threads_v1";
  const BOT_NAME_STORAGE_KEY = "friendly_assistant_bot_name_v1";

  // State
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [botName, setBotName] = useState<string>(DEFAULT_BOT_NAME);
  
  // UI states
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isEditingThreadId, setIsEditingThreadId] = useState<string | null>(null);
  const [threadRenameVal, setThreadRenameVal] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize from Local Storage
  useEffect(() => {
    const savedBotName = localStorage.getItem(BOT_NAME_STORAGE_KEY);
    if (savedBotName) {
      setBotName(savedBotName);
    }

    const savedThreads = localStorage.getItem(THREADS_STORAGE_KEY);
    if (savedThreads) {
      try {
        const parsed = JSON.parse(savedThreads) as ChatThread[];
        if (parsed && parsed.length > 0) {
          setThreads(parsed);
          setActiveThreadId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error("Error loading chat history:", e);
      }
    }

    // Default thread if none exists
    const defaultThread: ChatThread = {
      id: "thread-default",
      title: `Welcome to Chat!`,
      messages: [
        {
          id: "welcome-msg",
          role: "model",
          content: `Hi there! I'm your friendly assistant, ${savedBotName || DEFAULT_BOT_NAME}. 🌸\n\nI'm here to chat, help you brainstorm, draft emails, learn something new, or just enjoy a cozy conversation. I'll automatically adapt to whichever language you choose to write in.\n\nWhat's on your mind today? Feel free to pick one of the ideas below, or type your own!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ],
      createdAt: new Date().toISOString(),
      botName: savedBotName || DEFAULT_BOT_NAME,
    };
    setThreads([defaultThread]);
    setActiveThreadId(defaultThread.id);
  }, []);

  // Save to Local Storage whenever state changes
  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
    }
  }, [threads]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threads, activeThreadId, isLoading]);

  // Find active thread
  const activeThread = threads.find((t) => t.id === activeThreadId);

  // Handle Naming Update
  const handleUpdateBotName = (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setBotName(trimmed);
    localStorage.setItem(BOT_NAME_STORAGE_KEY, trimmed);

    // Also update current thread's welcome message if it was untouched
    setThreads((prev) =>
      prev.map((t) => {
        const updatedMessages = t.messages.map((m) => {
          if (m.id === "welcome-msg") {
            return {
              ...m,
              content: `Hi there! I'm your friendly assistant, ${trimmed}. 🌸\n\nI'm here to chat, help you brainstorm, draft emails, learn something new, or just enjoy a cozy conversation. I'll automatically adapt to whichever language you choose to write in.\n\nWhat's on your mind today? Feel free to pick one of the ideas below, or type your own!`,
            };
          }
          return m;
        });
        return { ...t, botName: trimmed, messages: updatedMessages };
      })
    );
  };

  // Create new thread
  const handleCreateThread = () => {
    const newId = `thread-${Date.now()}`;
    const newThread: ChatThread = {
      id: newId,
      title: `Conversation ${threads.length + 1}`,
      messages: [
        {
          id: `welcome-${Date.now()}`,
          role: "model",
          content: `Hi! I'm ${botName}. I'm ready for our next conversation. What would you like to explore or discuss together? 🌿`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ],
      createdAt: new Date().toISOString(),
      botName: botName,
    };

    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newId);
    setApiError(null);
    // On mobile, close sidebar on chat selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Delete Thread
  const handleDeleteThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (threads.length <= 1) {
      // Just clear current thread instead of leaving 0 threads
      setThreads([
        {
          id: "thread-default",
          title: `New Conversation`,
          messages: [
            {
              id: `welcome-${Date.now()}`,
              role: "model",
              content: `Hi there! I'm ${botName}. Let's start fresh! What can I help you with? ✨`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ],
          createdAt: new Date().toISOString(),
          botName: botName,
        }
      ]);
      setActiveThreadId("thread-default");
      return;
    }

    const index = threads.findIndex((t) => t.id === id);
    const newThreads = threads.filter((t) => t.id !== id);
    setThreads(newThreads);

    if (activeThreadId === id) {
      // Switch active thread to adjacent one
      const fallbackIdx = index === 0 ? 0 : index - 1;
      setActiveThreadId(newThreads[fallbackIdx].id);
    }
  };

  // Trigger thread rename
  const startRenameThread = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingThreadId(id);
    setThreadRenameVal(currentTitle);
  };

  // Save thread rename
  const saveRenameThread = (id: string) => {
    if (threadRenameVal.trim()) {
      setThreads((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title: threadRenameVal.trim() } : t))
      );
    }
    setIsEditingThreadId(null);
  };

  // Clear current conversation
  const handleClearCurrentThread = () => {
    if (!activeThreadId) return;
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            messages: [
              {
                id: `welcome-${Date.now()}`,
                role: "model",
                content: `Fresh start! I'm ${botName}, your casual assistant. What shall we talk about? 🍀`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
            ],
          };
        }
        return t;
      })
    );
    setApiError(null);
  };

  // Send Message logic
  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend !== undefined ? textToSend : input;
    const messageText = rawText.trim();
    if (!messageText || isLoading) return;

    if (textToSend === undefined) {
      setInput(""); // Clear text field if sending from input box
    }

    setApiError(null);

    // Create user message
    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Append user message immediately
    let currentThread = threads.find((t) => t.id === activeThreadId);
    if (!currentThread) return;

    // Update state with user message
    const updatedMessages = [...currentThread.messages, userMsg];
    
    // Auto rename conversation from first custom user input if title is generic
    let newTitle = currentThread.title;
    const customMsgsCount = currentThread.messages.filter(m => m.id !== "welcome-msg" && !m.id.startsWith("welcome")).length;
    if (customMsgsCount === 0 && currentThread.title.startsWith("Conversation")) {
      newTitle = messageText.length > 25 ? messageText.substring(0, 22) + "..." : messageText;
    }

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? { ...t, title: newTitle, messages: updatedMessages }
          : t
      )
    );

    setIsLoading(true);

    try {
      // Map entire conversation message list to clean payload for backend proxy
      // Keep only user and assistant messages to prevent system instructions leakage or bloat
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          botName: botName,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to reach assistant server.");
      }

      const data = await response.json();
      
      const assistantMsg: Message = {
        id: `msg-bot-${Date.now()}`,
        role: "model",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? { ...t, messages: [...updatedMessages, assistantMsg] }
            : t
        )
      );
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Something went wrong. Please check your connection or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get icon for Preset Categories
  const renderTopicIcon = (iconName: string) => {
    switch (iconName) {
      case "Sparkles":
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case "GraduationCap":
        return <GraduationCap className="w-4 h-4 text-emerald-500" />;
      case "Mail":
        return <Mail className="w-4 h-4 text-sky-500" />;
      case "Brain":
        return <Brain className="w-4 h-4 text-pink-500" />;
      case "Utensils":
        return <Utensils className="w-4 h-4 text-amber-500" />;
      case "Briefcase":
        return <Briefcase className="w-4 h-4 text-indigo-500" />;
      case "Smile":
        return <Smile className="w-4 h-4 text-orange-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  const filteredPresets = PRESET_TOPICS.filter(
    (topic) => categoryFilter === "all" || topic.category === categoryFilter
  );

  return (
    <div className="flex h-screen w-full bg-natural-bg text-natural-dark font-sans overflow-hidden antialiased selection:bg-natural-accent/20 selection:text-natural-accent">
      
      {/* SIDEBAR */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-shrink-0 h-full bg-natural-card border-r border-stone-300 flex flex-col z-20 overflow-hidden relative"
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-stone-200 flex flex-col items-start space-y-1">
              <div className="flex w-full items-center justify-between">
                <div className="w-12 h-12 bg-natural-accent rounded-2xl flex items-center justify-center mb-1 shadow-sm">
                  <Bot className="w-6 h-6 text-natural-card" />
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-stone-200/60 text-natural-muted transition-colors md:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h1 className="text-2xl font-semibold text-natural-dark font-serif italic">
                {botName}
              </h1>
              <p className="text-xs text-natural-muted uppercase tracking-widest font-medium">
                Companion Assistant
              </p>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              <button
                onClick={handleCreateThread}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-left text-xs font-semibold text-white bg-natural-accent hover:bg-natural-accent-hover transition-all hover:scale-[1.01] active:scale-95 shadow-sm mb-6"
              >
                <Plus className="w-4 h-4" />
                New Conversation
              </button>

              <div className="text-[10px] text-natural-muted font-bold tracking-widest uppercase px-1 mb-2">
                Recent Chats
              </div>

              <div className="space-y-1.5">
                {threads.map((thread) => {
                  const isActive = thread.id === activeThreadId;
                  const isEditing = thread.id === isEditingThreadId;

                  return (
                    <div
                      key={thread.id}
                      onClick={() => {
                        setActiveThreadId(thread.id);
                        if (window.innerWidth < 768) {
                          setIsSidebarOpen(false);
                        }
                      }}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all ${
                        isActive
                          ? "bg-stone-200/60 text-natural-dark shadow-xs"
                          : "text-natural-muted hover:bg-stone-200/30 hover:text-natural-dark"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                        <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? "text-natural-accent" : "text-stone-400"}`} />
                        {isEditing ? (
                          <input
                            type="text"
                            value={threadRenameVal}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setThreadRenameVal(e.target.value)}
                            onBlur={() => saveRenameThread(thread.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveRenameThread(thread.id);
                              if (e.key === "Escape") setIsEditingThreadId(null);
                            }}
                            className="bg-white text-natural-dark px-1.5 py-0.5 rounded border border-natural-accent focus:outline-none w-full text-xs"
                            autoFocus
                          />
                        ) : (
                          <span className="truncate pr-1">{thread.title}</span>
                        )}
                      </div>

                      {!isEditing && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => startRenameThread(thread.id, thread.title, e)}
                            className="p-1 rounded hover:bg-stone-300/50 text-natural-muted hover:text-natural-dark"
                            title="Rename"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteThread(thread.id, e)}
                            className="p-1 rounded hover:bg-red-50 text-stone-400 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-100/30 flex flex-col gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-natural-muted hover:bg-stone-200/40 hover:text-natural-dark text-xs font-semibold transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-natural-accent" />
                Customize Assistant
              </button>
              <div className="text-[10px] text-natural-muted font-medium flex items-center justify-center gap-1 py-1">
                <Info className="w-3 h-3" />
                <span>Responsive & Adaptive</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER */}
      <div className="flex-1 h-full flex flex-col relative overflow-hidden bg-natural-bg">
        
        {/* HEADER */}
        <header className="h-20 border-b border-stone-200 bg-white/50 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-xl hover:bg-stone-200/50 text-natural-dark transition-colors mr-1"
                aria-label="Open Sidebar"
                id="toggle-sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-stone-800 tracking-tight">
                  {botName} is online and ready to help
                </span>
              </div>
              <p className="text-[11px] text-natural-muted hidden md:block pl-5">
                Adapts instantly to English, Español, Deutsch, Tamil, or any language you type.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearCurrentThread}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-stone-300 rounded-full hover:bg-stone-50 transition-colors"
              title="Reset conversation"
              id="clear-chat-btn"
            >
              <span className="hidden sm:inline">Clear History</span>
              <RotateCcw className="w-3.5 h-3.5 sm:hidden" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-full border border-stone-300 hover:bg-stone-50 text-stone-600 transition-colors"
              title="Bot settings"
              id="settings-btn"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* CHAT VIEWPORT */}
        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-10 space-y-8 relative max-w-4xl mx-auto w-full">
          {activeThread && activeThread.messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center max-w-xl mx-auto py-12">
              <div className="w-16 h-16 rounded-2xl bg-natural-card border border-stone-200 flex items-center justify-center text-natural-accent shadow-sm mb-4 animate-bounce">
                <Bot className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-semibold text-natural-dark tracking-tight mb-2 font-serif italic">
                Start a dialog with {botName}
              </h2>
              <p className="text-sm text-natural-muted leading-relaxed">
                Ask a general question, write code, draft a greeting, or request quick guidance. Type in any language!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeThread?.messages.map((msg) => {
                const isModel = msg.role === "model";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isModel ? "items-start" : "items-end"} space-y-1.5`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[75%] px-6 py-4 rounded-[2rem] shadow-xs text-sm leading-relaxed ${
                        isModel
                          ? "bg-white border border-stone-100 text-natural-dark rounded-tl-sm shadow-sm"
                          : "bg-natural-accent text-white rounded-tr-sm shadow-sm text-right"
                      }`}
                    >
                      <MarkdownRenderer content={msg.content} />
                    </div>

                    <div className="text-[10px] text-stone-400 font-semibold px-4 uppercase tracking-wider flex items-center gap-1.5">
                      <span>{isModel ? botName : "User"}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>
                  </motion.div>
                );
              })}

              {/* API ERROR BANNER */}
              {apiError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 font-medium max-w-xl mx-auto flex items-center gap-3 justify-between shadow-sm">
                  <span className="flex items-center gap-2">⚠️ {apiError}</span>
                  <button
                    onClick={() => handleSendMessage()}
                    className="px-3.5 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* LOADER */}
              {isLoading && (
                <div className="flex flex-col items-start space-y-1.5">
                  <div className="bg-white border border-stone-100 px-6 py-3.5 rounded-[2rem] rounded-tl-sm shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-natural-accent animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 rounded-full bg-natural-accent/80 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 rounded-full bg-natural-accent/50 animate-bounce"></span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-semibold px-4 uppercase tracking-wider">
                    {botName} is typing...
                  </span>
                </div>
              )}
            </div>
          )}

          {/* EMPTY STATE CONVERSATION SUGGESTIONS / PRESETS */}
          {activeThread && activeThread.messages.length === 1 && (
            <div className="border-t border-stone-300 pt-8 mt-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                <div>
                  <h3 className="font-semibold text-natural-dark text-base tracking-tight flex items-center gap-1.5 font-serif italic">
                    <Sparkles className="w-4 h-4 text-natural-accent" />
                    Conversation Starters
                  </h3>
                  <p className="text-xs text-natural-muted">
                    Pick a preset to explore how {botName} formats and structures answers.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-1 bg-stone-200/40 p-1 rounded-xl border border-stone-200">
                  {["all", "chat", "creative", "learning", "work"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                        categoryFilter === cat
                          ? "bg-natural-accent text-white shadow-xs"
                          : "text-natural-muted hover:text-natural-dark hover:bg-stone-200/20"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredPresets.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setInput(topic.prompt);
                      handleSendMessage(topic.prompt);
                    }}
                    className="p-4 rounded-2xl border border-stone-200/80 bg-natural-card hover:border-natural-accent/40 hover:shadow-md transition-all text-left flex gap-3.5 group cursor-pointer"
                  >
                    <div className="p-2.5 rounded-xl bg-stone-100 group-hover:bg-amber-50/50 border border-stone-200/20 shrink-0 self-start transition-colors">
                      {renderTopicIcon(topic.icon)}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-semibold text-xs text-stone-800 tracking-tight truncate group-hover:text-natural-accent transition-colors">
                        {topic.label}
                      </span>
                      <span className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                        {topic.prompt}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-natural-accent transition-all self-center shrink-0 ml-auto group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className="p-8 bg-gradient-to-t from-natural-bg via-natural-bg to-transparent shrink-0">
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Ask ${botName} anything...`}
                rows={1}
                className="w-full bg-white border border-stone-200 rounded-full py-5 pl-8 pr-24 shadow-xl focus:outline-none focus:ring-2 focus:ring-natural-accent/20 text-stone-800 placeholder-stone-400 max-h-32 text-sm leading-relaxed resize-none"
                style={{ height: "auto" }}
                id="message-input-area"
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-lg ${
                    input.trim() && !isLoading
                      ? "bg-natural-accent hover:bg-natural-accent-hover shadow-natural-accent/20 cursor-pointer hover:scale-[1.03] active:scale-95"
                      : "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                  }`}
                  aria-label="Send Message"
                  id="send-message-btn"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>

            <div className="flex items-center justify-between px-6 text-[10px] text-stone-400 tracking-wide mt-2">
              <span className="font-semibold flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-natural-accent" />
                Companion Bot running Gemini 3.5 Flash
              </span>
              <span>Press Enter to send • Shift+Enter for multiple lines</span>
            </div>
          </div>
        </div>

        {/* SETTINGS MODAL OVERLAY */}
        <AnimatePresence>
          {isSettingsOpen && (
            <div className="fixed inset-0 bg-natural-dark/30 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="bg-natural-card border border-stone-300 rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/40">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-natural-accent/10 text-natural-accent">
                      <Settings className="w-5 h-5" />
                    </div>
                    <h2 className="font-bold text-natural-dark text-lg tracking-tight font-serif italic">
                      Assistant Customization
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-stone-200/50 text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-natural-muted uppercase tracking-widest block">
                      Assistant Name (e.g. Sage, Ami, Companion)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={botName}
                        onChange={(e) => handleUpdateBotName(e.target.value)}
                        placeholder="Type assistant name..."
                        maxLength={15}
                        className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-natural-accent text-sm text-stone-800 bg-white"
                        id="assistant-name-input"
                      />
                      <button
                        onClick={() => handleUpdateBotName(DEFAULT_BOT_NAME)}
                        className="px-4 py-2.5 text-natural-muted hover:text-natural-dark text-xs font-semibold bg-stone-100 hover:bg-stone-200/60 rounded-xl transition-colors border border-stone-200/40"
                      >
                        Reset
                      </button>
                    </div>
                    <p className="text-[11px] text-natural-muted leading-relaxed">
                      Changes propagate instantly in system instructions and active greeting cards.
                    </p>
                  </div>

                  <div className="space-y-3 border-t border-stone-200 pt-5">
                    <h4 className="text-xs font-bold text-natural-muted uppercase tracking-widest">
                      Guiding Principles
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-[11px] text-stone-600 leading-relaxed font-medium">
                      <div className="bg-white p-3.5 rounded-xl border border-stone-100 flex flex-col gap-1 shadow-xs">
                        <span className="text-stone-800 font-semibold flex items-center gap-1 text-xs">
                          🌱 Natural & Cozy
                        </span>
                        Like a warm, helpful, approachable, knowledgeable teammate.
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-stone-100 flex flex-col gap-1 shadow-xs">
                        <span className="text-stone-800 font-semibold flex items-center gap-1 text-xs">
                          🌐 Multi-lingual
                        </span>
                        Detects and mirrors your input language on the fly.
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-stone-100 flex flex-col gap-1 shadow-xs">
                        <span className="text-stone-800 font-semibold flex items-center gap-1 text-xs">
                          📝 Plain Format
                        </span>
                        Clear bullet lists and paragraphs over cluttered text.
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-stone-100 flex flex-col gap-1 shadow-xs">
                        <span className="text-stone-800 font-semibold flex items-center gap-1 text-xs">
                          🔒 Secure & Polite
                        </span>
                        No unsafe advice, highly focused on your privacy.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-stone-50/80 border-t border-stone-200 flex justify-end gap-2">
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-5 py-2.5 bg-natural-accent hover:bg-natural-accent-hover text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

}
