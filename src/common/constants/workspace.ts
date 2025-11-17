import type { RuntimeConfig } from "@/common/types/runtime";

/**
 * Default runtime configuration for local workspaces
 * Used when no runtime config is specified
 */
export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  type: "local",
  srcBaseDir: "~/.mux/src",
} as const;

/**
 * Default trunk branch to fork from when creating workspaces
 */
export const DEFAULT_TRUNK_BRANCH = "main" as const;

export const TRUNK_SELECTION = {
  DEFAULT: "default",
  CUSTOM: "custom",
} as const;

export type TrunkSelection = (typeof TRUNK_SELECTION)[keyof typeof TRUNK_SELECTION];
