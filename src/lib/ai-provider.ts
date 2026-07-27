import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";
import { LanguageModel } from "ai";

export function getAIModel(): LanguageModel {
  // 1. Try Gemini (Google) - highly stable and generous quota (only if key is valid format)
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
  if (googleKey && googleKey.trim().startsWith("AIzaSy")) {
    return google("gemini-1.5-flash");
  }

  // 2. Try Groq (Llama 3 is fast and works perfectly)
  const groqKeys: string[] = [];
  if (process.env.GROQ_API_KEY) groqKeys.push(process.env.GROQ_API_KEY);
  if (process.env.GROQ_API_KEY_2) groqKeys.push(process.env.GROQ_API_KEY_2);

  if (groqKeys.length > 0) {
    const randomKey = groqKeys[Math.floor(Math.random() * groqKeys.length)];
    const customGroq = createGroq({
      apiKey: randomKey,
    });
    return customGroq("llama-3.1-8b-instant");
  }

  // 3. Try OpenAI
  if (process.env.OPENAI_API_KEY) {
    return openai("gpt-4o-mini");
  }

  // If absolutely no keys are set, fallback
  return google("gemini-1.5-flash");
}
