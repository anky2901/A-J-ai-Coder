import React from "react";
import { RUNTIME_MODE, type RuntimeMode } from "@/common/types/runtime";
import { TooltipWrapper, Tooltip } from "../Tooltip";
import { Select } from "../Select";
import { DEFAULT_TRUNK_BRANCH, TRUNK_SELECTION, type TrunkSelection } from "@/common/constants/workspace";

interface CreationControlsProps {
  branches: string[];
  trunkSelection: TrunkSelection;
  customTrunkBranch: string;
  onTrunkSelectionChange: (selection: TrunkSelection) => void;
  onCustomTrunkBranchChange: (branch: string) => void;
  runtimeMode: RuntimeMode;
  sshHost: string;
  onRuntimeChange: (mode: RuntimeMode, host: string) => void;
  disabled: boolean;
}

/**
 * Additional controls shown only during workspace creation
 * - Trunk branch selector (which branch to fork from)
 * - Runtime mode (local vs SSH)
 */
export function CreationControls(props: CreationControlsProps) {
  const defaultUnavailable =
    props.branches.length > 0 && !props.branches.includes(DEFAULT_TRUNK_BRANCH);
  const showCustomPicker = props.trunkSelection === TRUNK_SELECTION.CUSTOM;

  const handleTrunkSelectionChange = (value: string) => {
    const selection = value as TrunkSelection;
    if (selection === TRUNK_SELECTION.DEFAULT && defaultUnavailable) {
      return;
    }
    props.onTrunkSelectionChange(selection);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      {/* Trunk Branch Selector */}
      <div className="flex items-center gap-1" data-component="TrunkBranchGroup">
        <label htmlFor="trunk-branch-mode" className="text-muted text-xs">
          From:
        </label>
        <Select
          id="trunk-branch-mode"
          value={props.trunkSelection}
          options={[
            { value: TRUNK_SELECTION.DEFAULT, label: "Main" },
            { value: TRUNK_SELECTION.CUSTOM, label: "Custom" },
          ]}
          onChange={handleTrunkSelectionChange}
          disabled={props.disabled}
          className="max-w-[110px]"
          aria-label="Trunk branch selection"
        />
        {defaultUnavailable && (
          <span className="text-muted text-[11px]">Main branch not found</span>
        )}
        {showCustomPicker && props.branches.length > 0 && (
          <Select
            id="trunk-branch"
            value={props.customTrunkBranch}
            options={props.branches}
            onChange={props.onCustomTrunkBranchChange}
            disabled={props.disabled}
            className="max-w-[130px]"
            aria-label="Custom trunk branch"
          />
        )}
      </div>

      {/* Runtime Selector */}
      <div className="flex items-center gap-1" data-component="RuntimeSelectorGroup">
        <label className="text-muted text-xs">Runtime:</label>
        <Select
          value={props.runtimeMode}
          options={[
            { value: RUNTIME_MODE.LOCAL, label: "Local" },
            { value: RUNTIME_MODE.SSH, label: "SSH" },
          ]}
          onChange={(newMode) => {
            const mode = newMode as RuntimeMode;
            props.onRuntimeChange(mode, mode === RUNTIME_MODE.LOCAL ? "" : props.sshHost);
          }}
          disabled={props.disabled}
          aria-label="Runtime mode"
        />
        {props.runtimeMode === RUNTIME_MODE.SSH && (
          <input
            type="text"
            value={props.sshHost}
            onChange={(e) => props.onRuntimeChange(RUNTIME_MODE.SSH, e.target.value)}
            placeholder="user@host"
            disabled={props.disabled}
            className="bg-separator text-foreground border-border-medium focus:border-accent w-32 rounded border px-1 py-0.5 text-xs focus:outline-none disabled:opacity-50"
          />
        )}
        <TooltipWrapper inline>
          <span className="text-muted cursor-help text-xs">?</span>
          <Tooltip className="tooltip" align="center" width="wide">
            <strong>Runtime:</strong>
            <br />
            • Local: git worktree in ~/.mux/src
            <br />• SSH: remote clone in ~/mux on SSH host
          </Tooltip>
        </TooltipWrapper>
      </div>
    </div>
  );
}
