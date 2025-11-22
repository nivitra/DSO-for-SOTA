import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PipelineConfig } from "../types";

const REQUEST_TIMEOUT_MS = 60000; // 60 seconds hard timeout

export class GeminiService {
  private client: GoogleGenAI | null = null;
  private currentKey: string = "";

  constructor(apiKey: string) {
    if (apiKey) {
      this.initialize(apiKey);
    }
  }

  initialize(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
    this.currentKey = apiKey;
  }

  async validateConnection(model: string): Promise<boolean> {
    if (!this.client) return false;
    try {
      // Lightweight call to test connectivity
      await this.client.models.generateContent({
        model: model,
        contents: "ping",
        config: { maxOutputTokens: 1 }
      });
      return true;
    } catch (e: any) {
      console.error("Connection Validation Failed:", e);
      return false;
    }
  }

  async processItem(
    originalText: string,
    config: PipelineConfig
  ): Promise<{ rewritten: string; reasoning: string }> {
    if (!this.client) {
      throw new Error("Provider not initialized. Please check API Key.");
    }

    const modelId = config.model || "gemini-2.5-flash";
    
    // Setup thinking config if native thinking is requested
    const thinkingConfig = config.useNativeThinking 
      ? { thinkingBudget: config.thinkingBudget || 1024 } 
      : undefined;

    // Construct prompt from template
    const template = config.promptTemplate || "Original Conversation:\n{{text}}";
    const prompt = template.replace("{{text}}", originalText);

    try {
      const apiCall = this.client.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          temperature: config.temperature,
          systemInstruction: config.systemInstruction,
          thinkingConfig: thinkingConfig,
        },
      });

      // Wrap in timeout promise for robustness
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms`)), REQUEST_TIMEOUT_MS);
      });

      const response: GenerateContentResponse = await Promise.race([apiCall, timeoutPromise]);
      const text = response.text || "";

      // If we are using our manual parsing strategy (defined in constants.ts)
      // We try to extract the parts.
      if (text.includes("---REASONING---") && text.includes("---REWRITTEN---")) {
        const parts = text.split("---REWRITTEN---");
        const reasoningPart = parts[0].replace("---REASONING---", "").trim();
        const rewrittenPart = parts[1].trim();
        return {
          reasoning: reasoningPart,
          rewritten: rewrittenPart
        };
      } 
      
      // Fallback if format isn't followed or using native thinking
      return {
        reasoning: config.useNativeThinking ? "(Native Thinking utilized by model - internal trace)" : "No explicit reasoning block provided by model.",
        rewritten: text
      };

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      const msg = error.message || "";

      // Enhanced error classification
      if (msg.includes("429") || msg.includes("Too Many Requests")) {
        throw new Error("Rate Limit (429): Quota exceeded. Increase delay or reduce concurrency.");
      }
      if (msg.includes("403") || msg.includes("PERMISSION_DENIED")) {
        throw new Error("Auth Error (403): API Key invalid or unauthorized for this model.");
      }
      if (msg.includes("400") || msg.includes("INVALID_ARGUMENT")) {
        throw new Error("Bad Request (400): Invalid input or model configuration.");
      }
      if (msg.includes("500") || msg.includes("INTERNAL")) {
        throw new Error("Server Error (500): Google Gemini service is experiencing issues.");
      }
      
      throw new Error(msg || "Unknown Provider Error");
    }
  }
}