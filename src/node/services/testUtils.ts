/**
 * Test utilities for AI service tests
 *
 * Provides minimal implementations for testing without full service infrastructure.
 */

import type { LanguageModel } from "ai";
import type { Result } from "@/common/types/result";
import { Ok, Err } from "@/common/types/result";
import type { SendMessageError } from "@/common/types/errors";

/**
 * Create a model for testing - minimal implementation that uses the AI SDK directly.
 * Supports Anthropic models only (add more providers as needed).
 */
export async function createModelForTest(
  modelString: string
): Promise<Result<LanguageModel, SendMessageError>> {
  const [provider, modelId] = modelString.split(":");

  if (!provider || !modelId) {
    return Err({
      type: "invalid_model_string",
      message: `Invalid model string: ${modelString}`,
    });
  }

  if (provider === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_AUTH_TOKEN;
    if (!apiKey) {
      return Err({ type: "api_key_not_found", provider: "anthropic" });
    }

    // Dynamic import is acceptable here - test utility only, not production code
    // eslint-disable-next-line no-restricted-syntax
    const { createAnthropic } = await import("@ai-sdk/anthropic");
    const anthropic = createAnthropic({ apiKey });
    return Ok(anthropic(modelId));
  }

  return Err({ type: "provider_not_supported", provider });
}
