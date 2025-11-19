/**
 * Shared compaction utilities for both frontend and backend
 */

import type { MuxFrontendMetadata, CompactionRequestData, ContinueMessage } from "@/common/types/message";

export interface PrepareCompactionMessageOptions {
  maxOutputTokens?: number;
  model?: string;
  rawCommand: string;
  continueMessage?: ContinueMessage;
}

export interface PrepareCompactionMessageResult {
  messageText: string;
  metadata: MuxFrontendMetadata;
}

/**
 * Prepare compaction message text and metadata
 * Used by both frontend (slash commands) and backend (auto-compaction)
 */
export function prepareCompactionMessage(
  options: PrepareCompactionMessageOptions
): PrepareCompactionMessageResult {
  const targetWords = options.maxOutputTokens ? Math.round(options.maxOutputTokens / 1.3) : 2000;

  // Build compaction message with optional continue context
  let messageText = `Summarize this conversation into a compact form for a new Assistant to continue helping the user. Use approximately ${targetWords} words.`;

  if (options.continueMessage) {
    messageText += `\n\nThe user wants to continue with: ${options.continueMessage.text}`;
  }

  // Create compaction metadata
  const compactData: CompactionRequestData = {
    model: options.model,
    maxOutputTokens: options.maxOutputTokens,
    continueMessage: options.continueMessage,
  };

  const metadata: MuxFrontendMetadata = {
    type: "compaction-request",
    rawCommand: options.rawCommand,
    parsed: compactData,
  };

  return { messageText, metadata };
}
