"use client";

import { useMemo, useState } from "react";
import type { Domain } from "@/data/types";
import { flowsForDomain, nodeIdsForFlows } from "@/data/model";
import { domainColors, domainLabels, domainOrder } from "@/lib/theme";
import { site } from "@/config/site";
import { FlowGraph } from "@/graph/FlowGraph";
import { dagreLayout } from "@/graph/layout";

interface DataFlowViewProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function DataFlowView({ selectedId, onSelect }: DataFlowViewProps) {
  const [domain, setDomain] = useState<Domain>(site.defaultDomain);

  const { positions, domainFlows } = useMemo(() => {
    const domainFlows = flowsForDomain(domain);
    const nodeIds = nodeIdsForFlows(domainFlows);
    return { positions: dagreLayout(nodeIds, domainFlows), domainFlows };
  }, [domain]);

  const hasTrace = domainFlows.some((flow) => flow.step !== undefined);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 px-4 py-2.5">
        {domainOrder.map((candidate) => {
          const active = candidate === domain;
          return (
            <button
              key={candidate}
              onClick={() => setDomain(candidate)}
              className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
              style={{
                background: active ? `${domainColors[candidate]}26` : "#151d2c",
                color: active ? domainColors[candidate] : "#94a3b8",
                border: `1px solid ${active ? domainColors[candidate] : "#26324a"}`,
              }}
            >
              {domainLabels[candidate]}
            </button>
          );
        })}
        {hasTrace && (
          <span className="ml-auto hidden text-[11px] text-slate-500 sm:block">
            Numbered edges trace this domain&rsquo;s sequence
          </span>
        )}
      </div>
      <div className="min-h-0 flex-1">
        <FlowGraph
          key={domain}
          positions={positions}
          flows={domainFlows}
          selectedId={selectedId}
          onSelect={onSelect}
          traceDomain={domain}
        />
      </div>
    </div>
  );
}
