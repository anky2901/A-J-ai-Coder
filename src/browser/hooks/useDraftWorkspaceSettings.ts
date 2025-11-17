import { useEffect } from "react";
import { usePersistedState } from "./usePersistedState";
import { use1MContext } from "./use1MContext";
import { useThinkingLevel } from "./useThinkingLevel";
import { useMode } from "@/browser/contexts/ModeContext";
import { useModelLRU } from "./useModelLRU";
import {
  type RuntimeMode,
  parseRuntimeModeAndHost,
  buildRuntimeString,
} from "@/common/types/runtime";
import {
  getModelKey,
  getRuntimeKey,
  getTrunkBranchKey,
  getTrunkSelectionKey,
  getProjectScopeId,
} from "@/common/constants/storage";
import { DEFAULT_TRUNK_BRANCH, TRUNK_SELECTION, type TrunkSelection } from "@/common/constants/workspace";
import type { UIMode } from "@/common/types/mode";
import type { ThinkingLevel } from "@/common/types/thinking";

/**
 * Centralized draft workspace settings for project-level persistence
 * All settings persist across navigation and are restored when returning to the same project
 */
export interface DraftWorkspaceSettings {
  // Model & AI settings (synced with global state)
  model: string;
  thinkingLevel: ThinkingLevel;
  mode: UIMode;
  use1M: boolean;

  // Workspace creation settings (project-specific)
  runtimeMode: RuntimeMode;
  sshHost: string;
  trunkBranch: string;
  trunkSelection: TrunkSelection;
  customTrunkBranch: string;
}

/**
 * Hook to manage all draft workspace settings with centralized persistence
 * Loads saved preferences when projectPath changes, persists all changes automatically
 *
 * @param projectPath - Path to the project (used as key prefix for localStorage)
 * @param branches - Available branches (used to set default trunk branch)
 * @param recommendedTrunk - Backend-recommended trunk branch
 * @returns Settings object and setters
 */
export function useDraftWorkspaceSettings(
  projectPath: string,
  branches: string[],
  recommendedTrunk: string | null
): {
  settings: DraftWorkspaceSettings;
  setRuntimeOptions: (mode: RuntimeMode, host: string) => void;
  setTrunkBranch: (branch: string) => void;
  setTrunkSelection: (selection: TrunkSelection) => void;
  getRuntimeString: () => string | undefined;
} {
  // Global AI settings (read-only from global state)
  const [use1M] = use1MContext();
  const [thinkingLevel] = useThinkingLevel();
  const [mode] = useMode();
  const { recentModels } = useModelLRU();

  // Project-scoped model preference (persisted per project)
  const [model] = usePersistedState<string>(
    getModelKey(getProjectScopeId(projectPath)),
    recentModels[0],
    { listener: true }
  );

  // Project-scoped runtime preference (persisted per project)
  const [runtimeString, setRuntimeString] = usePersistedState<string | undefined>(
    getRuntimeKey(projectPath),
    undefined,
    { listener: true }
  );

  // Project-scoped trunk branch preference (persisted per project)
  const [customTrunkBranch, setCustomTrunkBranch] = usePersistedState<string>(
    getTrunkBranchKey(projectPath),
    "",
    { listener: true }
  );

  const [trunkSelection, setTrunkSelection] = usePersistedState<TrunkSelection>(
    getTrunkSelectionKey(projectPath),
    TRUNK_SELECTION.DEFAULT,
    { listener: true }
  );

  // Parse runtime string into mode and host
  const { mode: runtimeMode, host: sshHost } = parseRuntimeModeAndHost(runtimeString);

  // Initialize custom trunk branch from backend recommendation or first branch
  useEffect(() => {
    if (branches.length === 0) {
      return;
    }

    const recommendedInList = recommendedTrunk && branches.includes(recommendedTrunk);
    const currentIsValid = customTrunkBranch && branches.includes(customTrunkBranch);

    if (currentIsValid) {
      return;
    }

    const fallback = (recommendedInList ? recommendedTrunk : undefined) ?? branches[0];
    setCustomTrunkBranch(fallback);
  }, [branches, recommendedTrunk, customTrunkBranch, setCustomTrunkBranch]);

  // Fall back to custom mode when default "main" is unavailable in the repo
  useEffect(() => {
    if (
      branches.length === 0 ||
      trunkSelection === TRUNK_SELECTION.CUSTOM ||
      branches.includes(DEFAULT_TRUNK_BRANCH)
    ) {
      return;
    }

    setTrunkSelection(TRUNK_SELECTION.CUSTOM);
  }, [branches, trunkSelection, setTrunkSelection]);

  // Setter for runtime options (updates persisted runtime string)
  const setRuntimeOptions = (newMode: RuntimeMode, newHost: string) => {
    const newRuntimeString = buildRuntimeString(newMode, newHost);
    setRuntimeString(newRuntimeString);
  };

  // Helper to get runtime string for IPC calls
  const getRuntimeString = (): string | undefined => {
    return buildRuntimeString(runtimeMode, sshHost);
  };

  const resolvedCustomBranch =
    customTrunkBranch ||
    (recommendedTrunk ?? branches[0]) ||
    DEFAULT_TRUNK_BRANCH;

  const defaultAvailable = branches.length === 0 || branches.includes(DEFAULT_TRUNK_BRANCH);
  const effectiveTrunkBranch =
    trunkSelection === TRUNK_SELECTION.DEFAULT && defaultAvailable
      ? DEFAULT_TRUNK_BRANCH
      : resolvedCustomBranch;

  return {
    settings: {
      model,
      thinkingLevel,
      mode,
      use1M,
      runtimeMode,
      sshHost,
      trunkBranch: effectiveTrunkBranch,
      trunkSelection,
      customTrunkBranch: resolvedCustomBranch,
    },
    setRuntimeOptions,
    setTrunkBranch: setCustomTrunkBranch,
    setTrunkSelection,
    getRuntimeString,
  };
}
