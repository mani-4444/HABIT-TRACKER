/**
 * api/_lib/ai.ts
 *
 * Server-side AI provider abstraction for Groq LLM integration.
 * Executes structured JSON generation with Zod validation.
 *
 * Security & Reliability Invariants:
 *  - GROQ_API_KEY is server-side only (never exposed via VITE_*).
 *  - Enforces schema validation on model output — returns typed errors on schema mismatch.
 *  - Enforces timeout safeguards (default 15s).
 *  - Never leaks raw provider stack traces or keys to client responses.
 */

import { z } from "zod";

export type AIErrorCode =
  | "PROVIDER_UNAVAILABLE"
  | "MISSING_API_KEY"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "INVALID_JSON"
  | "SCHEMA_INVALID"
  | "EMPTY_RESPONSE";

export class AIProviderError extends Error {
  constructor(
    public code: AIErrorCode,
    message: string,
    public statusCode: number = 502,
    public details?: unknown
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

export interface GenerateStructuredOptions<T extends z.ZodTypeAny> {
  systemPrompt: string;
  userPrompt: string;
  schema: T;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

const PRIMARY_MODEL = "openai/gpt-oss-20b";
const FALLBACK_MODELS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "qwen/qwen3.6-27b",
  "groq/compound-mini",
];
const DEFAULT_TIMEOUT_MS = 25000;

/**
 * Call Groq chat completions API requesting a structured JSON response,
 * and validate the output against the provided Zod schema.
 * Includes automatic model fallback and rate-limit retries.
 */
export async function generateStructuredAIResponse<T extends z.ZodTypeAny>({
  systemPrompt,
  userPrompt,
  schema,
  model = PRIMARY_MODEL,
  temperature = 0.2,
  maxTokens = 1200,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: GenerateStructuredOptions<T>): Promise<z.infer<T>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new AIProviderError(
      "MISSING_API_KEY",
      "GROQ_API_KEY is not configured on the server. Please add GROQ_API_KEY in your Vercel Project Settings > Environment Variables.",
      500
    );
  }

  const candidateModels = [model, ...FALLBACK_MODELS.filter((m) => m !== model)];
  let lastError: AIProviderError | null = null;

  for (const currentModel of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "User-Agent": "HabitTracker/1.0",
          },
          body: JSON.stringify({
            model: currentModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
            temperature,
            max_tokens: maxTokens,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 429) {
          if (attempt === 0) {
            // Wait 1.5s and retry with backoff before moving to candidate model
            await new Promise((r) => setTimeout(r, 1500));
            continue;
          }
          lastError = new AIProviderError(
            "RATE_LIMITED",
            "AI rate limit reached. Please wait a few moments before requesting more insights.",
            429
          );
          break; // Try next candidate model
        }

        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          lastError = new AIProviderError(
            "PROVIDER_UNAVAILABLE",
            `Groq API error (${response.status}) on model ${currentModel}`,
            502,
            errText
          );
          break; // Try next candidate model
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;

        if (!content || typeof content !== "string" || !content.trim()) {
          lastError = new AIProviderError("EMPTY_RESPONSE", "Received empty response from AI model", 502);
          break;
        }

        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(content);
        } catch {
          lastError = new AIProviderError("INVALID_JSON", "AI model response was not valid JSON", 502);
          break;
        }

        const validationResult = schema.safeParse(parsedJson);
        if (!validationResult.success) {
          lastError = new AIProviderError(
            "SCHEMA_INVALID",
            "AI output failed structural schema validation",
            502,
            validationResult.error.format()
          );
          break;
        }

        return validationResult.data;
      } catch (error: unknown) {
        clearTimeout(timeoutId);

        if (error instanceof AIProviderError) {
          lastError = error;
        } else if (error instanceof Error && error.name === "AbortError") {
          lastError = new AIProviderError("TIMEOUT", `AI request timed out after ${timeoutMs}ms`, 504);
        } else {
          lastError = new AIProviderError(
            "PROVIDER_UNAVAILABLE",
            error instanceof Error ? error.message : "Unknown AI provider error",
            502
          );
        }
        break; // Try next candidate model
      }
    }
  }

  throw (
    lastError ||
    new AIProviderError(
      "PROVIDER_UNAVAILABLE",
      "All AI candidate models failed. Please try again shortly.",
      502
    )
  );
}
