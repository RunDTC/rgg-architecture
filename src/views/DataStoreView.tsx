"use client";

import { useMemo, useState } from "react";
import { datastores, flows } from "@/data/model";
import { FlowGraph } from "@/graph/FlowGraph";
import { dagreLayout } from "@/graph/layout";
import { nodeVisual } from "@/lib/theme";

interface DataStoreViewProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function DataStoreView({ selectedId, onSelect }: DataStoreViewProps) {
  const [storeId, setStoreId] = useState<string>(datastores[0]?.id ?? "");
  const store = datastores.find((candidate) => candidate.id === storeId);

  const { positions, storeFlows } = useMemo(() => {
    const storeFlows = flows.filter(
      (flow) => flow.source === storeId || flow.target === storeId,
    );
    const ids = new Set<string>([storeId]);
    for (const flow of storeFlows) {
      ids.add(flow.source);
      ids.add(flow.target);
    }
    return {
      positions: dagreLayout([...ids], storeFlows),
      storeFlows,
    };
  }, [storeId]);

  if (!store) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        No data stores defined.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 px-4 py-2.5">
        {datastores.map((candidate) => {
          const active = candidate.id === storeId;
          const accent = nodeVisual(candidate).accent;
          return (
            <button
              key={candidate.id}
              onClick={() => setStoreId(candidate.id)}
              className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
              style={{
                background: active ? `${accent}26` : "#151d2c",
                color: active ? accent : "#94a3b8",
                border: `1px solid ${active ? accent : "#26324a"}`,
              }}
            >
              {candidate.name}
            </button>
          );
        })}
      </div>
      <div className="relative min-h-0 flex-1">
        <FlowGraph
          key={storeId}
          positions={positions}
          flows={storeFlows}
          selectedId={selectedId}
          onSelect={onSelect}
        />
        <div className="pointer-events-none absolute bottom-4 left-4 max-w-sm rounded-lg border border-slate-800 bg-[#0e1626]/95 p-4">
          <div className="text-sm font-semibold text-slate-100">{store.name}</div>
          <div className="text-[11px] text-slate-500">{store.technology}</div>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            {store.description}
          </p>
          <ul className="mt-2 space-y-1">
            {store.contents.map((item) => (
              <li key={item} className="flex gap-1.5 text-xs text-slate-300">
                <span className="text-cyan-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
