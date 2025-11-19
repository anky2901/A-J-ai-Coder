import React from "react";

export const CompactionWarning: React.FC = () => {
  return (
    <div className="text-plan-mode bg-plan-mode/10 mx-4 my-4 rounded-sm px-4 py-3 text-center text-xs font-medium">
      ⚠️ Approaching context limit. Next message will trigger auto-compaction.
    </div>
  );
};
