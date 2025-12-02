/**
 * Tests for workspace title generator
 *
 * Uses real API calls (TEST_INTEGRATION=1) to verify:
 * - Small prompts work correctly
 * - Reasoning/thinking models don't break JSON parsing
 */

import { generateWorkspaceName, generatePlaceholderName } from "./workspaceTitleGenerator";
import { createModelForTest } from "./testUtils";

// Unit tests - always run
describe("generatePlaceholderName", () => {
  it("should generate git-safe placeholder from message", () => {
    expect(generatePlaceholderName("Fix the login bug")).toBe("fix-the-login-bug");
  });

  it("should handle empty message", () => {
    expect(generatePlaceholderName("")).toBe("new-workspace");
  });

  it("should truncate long messages", () => {
    const longMessage =
      "This is a very long message that should be truncated to fit within the limit";
    const result = generatePlaceholderName(longMessage);
    expect(result.length).toBeLessThanOrEqual(30);
  });

  it("should sanitize special characters", () => {
    expect(generatePlaceholderName("Fix: the @login #bug!")).toBe("fix-the-login-bug");
  });
});

// Integration tests - require TEST_INTEGRATION=1
const describeIntegration = process.env.TEST_INTEGRATION === "1" ? describe : describe.skip;

describeIntegration("generateWorkspaceName - integration", () => {
  // Minimal AIService-like object that only provides createModel
  const aiService = { createModel: createModelForTest };

  // Test with a small prompt that triggered the bug
  it("should handle small prompts with opus-4-5 (reasoning model)", async () => {
    const message = "Solve https://github.com/coder/registry/issues/42";
    const model = "anthropic:claude-opus-4-5";

    const result = await generateWorkspaceName(message, model, aiService);

    // The result should be successful, not fail with "Invalid JSON response"
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatch(/^[a-z0-9-]+$/);
      expect(result.data.length).toBeGreaterThanOrEqual(3);
      expect(result.data.length).toBeLessThanOrEqual(50);
    }
  }, 30000);

  // Test with very short prompt
  it("should handle very short prompts", async () => {
    const message = "fix bug";
    const model = "anthropic:claude-opus-4-5";

    const result = await generateWorkspaceName(message, model, aiService);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatch(/^[a-z0-9-]+$/);
    }
  }, 30000);

  // Test with claude-sonnet-4-5 (thinking model but different config)
  it("should handle sonnet-4-5 with small prompts", async () => {
    const message = "update README";
    const model = "anthropic:claude-sonnet-4-5";

    const result = await generateWorkspaceName(message, model, aiService);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatch(/^[a-z0-9-]+$/);
    }
  }, 30000);
});
