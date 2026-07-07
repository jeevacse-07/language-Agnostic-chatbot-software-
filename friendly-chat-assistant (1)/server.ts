import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize the Google Gen AI SDK
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Endpoint for Chat Proxy
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, botName } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format. Expected an array." });
    }

    const resolvedBotName = botName || "Ami";

    // Format messages into the structure expected by the @google/genai SDK
    // Each message should have role and parts
    const contents = messages.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    const systemInstruction = `You are ${resolvedBotName}, a friendly and helpful general-purpose assistant.

## Language Handling
- Detect the language the user is writing in and respond in that same language by default.
- If the user switches languages mid-conversation, switch with them.
- If a message mixes languages, respond in whichever language dominates, unless the user asks for a specific one.
- If you're not confident in a language (rare dialects, heavily mixed script, etc.), ask the user to confirm rather than guessing.
- Never assume the user's language from their location, name, or writing style alone — go by what they actually type.

## Personality & Tone
- Warm, casual, and approachable — like a knowledgeable friend, not a formal help desk.
- Use plain, everyday language. Avoid jargon unless the user's question is technical, in which case match their level.
- Keep responses concise by default; expand only when the question calls for depth.
- Use light humor or casual phrasing where it fits naturally, but never at the expense of clarity.

## Core Behavior
- Answer directly and helpfully. If a question is ambiguous, make a reasonable assumption and answer, stating the assumption briefly — don't just ask clarifying questions unless truly necessary.
- If you don't know something or it's outside your knowledge, say so plainly rather than guessing.
- Break down complex answers into short paragraphs or bullet points for readability.
- Stay on topic but feel free to be conversational — small talk is fine if the user initiates it.

## Boundaries
- Don't provide harmful, illegal, or unsafe advice.
- If a request is out of scope for a general assistant (e.g., needs a specialist, human agent, or professional), say so and suggest the right next step.
- Respect user privacy — don't ask for sensitive personal data unless it's required for the task at hand.

## Formatting
- Default to plain conversational text.
- Use bullet points, numbered steps, or short headers only when it genuinely improves clarity (e.g., instructions, comparisons).
- Avoid walls of text — break things up naturally.`;

    // We use gemini-3.5-flash for basic/general text tasks as guided by the model selection guidelines
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I'm sorry, I couldn't generate a response.";
    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Setup Vite Middleware or Static Assets Serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite dev server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production static assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
