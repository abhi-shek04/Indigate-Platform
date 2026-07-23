import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { groq } from "@ai-sdk/groq";
import { LanguageModel } from "ai";

export function getAIModel(): LanguageModel {
  // 1. Try Groq (Llama 3 is fast and API key has quota)
  const groqKeys: string[] = [];
  if (process.env.GROQ_API_KEY) groqKeys.push(process.env.GROQ_API_KEY);
  if (process.env.GROQ_API_KEY_2) groqKeys.push(process.env.GROQ_API_KEY_2);

  if (groqKeys.length > 0) {
    const randomKey = groqKeys[Math.floor(Math.random() * groqKeys.length)];
    const customGroq = require('@ai-sdk/groq').createGroq({
      apiKey: randomKey,
    });
    return customGroq("llama-3.1-8b-instant");
  }

  // 2. Try OpenAI (Currently out of quota)
  if (process.env.OPENAI_API_KEY) {
    return openai("gpt-4o-mini");
  }

  // 3. Try Gemini (Google) - use flash as the primary fallback because it avoids the v1beta pro restrictions
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY) {
    return google("gemini-1.5-flash");
  }

  // If absolutely no keys are set, fallback to the default which might error but gives the expected structure
  return google("gemini-1.5-flash");
}
