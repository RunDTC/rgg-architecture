"use client";

import type { AppliedToolCall } from "@/lib/chat/deriveOps";

interface ProposedChangesPanelProps {
  calls: AppliedToolCall[];
  onDiscard: () => void;
}

/**
 * Diff-card summary of everything the AI has proposed so far this session, derived
 * straight from the chat's own tool-call history — see `deriveAppliedToolCalls()`. Save
 * is deliberately absent here until Phase 2 wires up real persistence.
 */
export function ProposedChangesPanel({ calls, onDiscard }: ProposedChangesPanelProps) {
  if (calls.length === 0) return null;

  return (
    <div className="border-t border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Proposed changes ({calls.length})
        </h4>
        <button
          onClick={onDiscard}
          className="rounded-md px-2 py-1 text-[11px] font-medium text-rose-300 transition-colors hover:bg-rose-500/10"
        >
          Discard
        </button>
      </div>
      <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
        {calls.map((call, i) => (
          <li
            key={i}
            className="rounded-md border border-slate-800 bg-[#111a2b] px-2.5 py-1.5 text-[12px] leading-snug text-slate-300"
          >
            {call.message}
          </li>
        ))}
      </ul>
      <button
        disabled
        title="Saving isn't wired up yet"
        className="mt-2 w-full cursor-not-allowed rounded-md bg-slate-700/50 px-3 py-1.5 text-[13px] font-medium text-slate-400"
      >
        Save (coming soon)
      </button>
    </div>
  );
}
