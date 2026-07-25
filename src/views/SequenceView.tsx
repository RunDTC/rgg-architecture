"use client";

import { useState } from "react";
import { sequences, sequenceById } from "@/data/model";
import { domainColors } from "@/lib/theme";
import { SequenceDiagram } from "@/graph/SequenceDiagram";

interface SequenceViewProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function SequenceView({ selectedId, onSelect }: SequenceViewProps) {
  const [sequenceId, setSequenceId] = useState<string>(sequences[0]?.id ?? "");
  const active = sequenceById.get(sequenceId) ?? sequences[0];

  if (!active) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 px-4 py-2.5">
        {sequences.map((seq) => {
          const isActive = seq.id === active.id;
          const color = domainColors[seq.domain];
          return (
            <button
              key={seq.id}
              onClick={() => setSequenceId(seq.id)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"
              style={{
                background: isActive ? `${color}26` : "#151d2c",
                color: isActive ? color : "#94a3b8",
                border: `1px solid ${isActive ? color : "#26324a"}`,
              }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: color }}
              />
              {seq.title}
            </button>
          );
        })}
        <div className="ml-auto hidden items-center gap-3 text-[11px] text-slate-500 lg:flex">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-px w-4 bg-slate-400" />
            Call
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-px w-4 border-t border-dashed border-slate-400" />
            Response
          </span>
          <span>Click a participant for details</span>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <p className="max-w-3xl px-6 pt-5 text-sm text-slate-400">{active.summary}</p>
        <div className="px-3 pb-8 pt-2">
          <SequenceDiagram
            sequence={active}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        </div>
      </div>
    </div>
  );
}
