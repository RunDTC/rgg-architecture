"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Background,
  MarkerType,
  ReactFlow,
  useNodesState,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Domain, FlowDef } from "@/data/types";
import { nodeById } from "@/data/model";
import { domainColors } from "@/lib/theme";
import { ArchNode, type ArchFlowNode } from "./ArchNode";
import type { Point } from "./layout";

function LaneLabelNode({ data }: { data: { text: string } }) {
  return (
    <div className="pointer-events-none select-none text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
      {data.text}
    </div>
  );
}

const nodeTypes = { arch: ArchNode, laneLabel: LaneLabelNode };

export interface LaneLabel {
  id: string;
  text: string;
  x: number;
  y: number;
}

interface FlowGraphProps {
  positions: Map<string, Point>;
  flows: FlowDef[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Show edge labels (off for dense views). */
  showLabels?: boolean;
  /** Color edges by this domain and animate/number the traced journey steps. */
  traceDomain?: Domain | null;
  /** Static swimlane headers rendered inside the canvas. */
  laneLabels?: LaneLabel[];
}

const NEUTRAL_EDGE = "#3f4b5e";

export function FlowGraph({
  positions,
  flows,
  selectedId,
  onSelect,
  showLabels = true,
  traceDomain = null,
  laneLabels = [],
}: FlowGraphProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const focusId = hoverId ?? selectedId;
  const neighborhood = useMemo(() => {
    if (!focusId) return null;
    const ids = new Set<string>([focusId]);
    for (const flow of flows) {
      if (flow.source === focusId) ids.add(flow.target);
      if (flow.target === focusId) ids.add(flow.source);
    }
    return ids;
  }, [focusId, flows]);

  // Initial nodes only (useNodesState ignores later values); hover/selection
  // styling is applied via setNodes below, and views remount FlowGraph (via
  // key) when positions change.
  const initialNodes = useMemo(() => {
    const result: (ArchFlowNode | Node)[] = [];
    for (const [id, position] of positions) {
      const def = nodeById.get(id);
      if (!def) continue;
      result.push({
        id,
        type: "arch",
        position,
        data: { def, dimmed: false },
      } satisfies ArchFlowNode);
    }
    for (const label of laneLabels) {
      result.push({
        id: `lane-${label.id}`,
        type: "laneLabel",
        position: { x: label.x, y: label.y },
        data: { text: label.text },
        draggable: false,
        selectable: false,
      });
    }
    return result;
  }, [positions, laneLabels]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);

  // Apply hover dimming and selection by mutating node state in place. If we
  // instead rebuilt the node objects each render, React Flow would drop their
  // measured dimensions, momentarily hide every node and edge, and the
  // resulting mouseleave under the cursor would restart the cycle — a rapid
  // flicker loop while hovering.
  useEffect(() => {
    setNodes((current) =>
      current.map((node) => {
        if (node.type !== "arch") return node;
        const dimmed = neighborhood ? !neighborhood.has(node.id) : false;
        const selected = node.id === selectedId;
        const data = node.data as ArchFlowNode["data"];
        if (data.dimmed === dimmed && (node.selected ?? false) === selected) {
          return node;
        }
        return { ...node, data: { ...data, dimmed }, selected };
      }),
    );
  }, [neighborhood, selectedId, setNodes]);

  const edges: Edge[] = useMemo(
    () =>
      flows
        .filter((flow) => positions.has(flow.source) && positions.has(flow.target))
        .map((flow) => {
          const inFocus =
            !focusId || flow.source === focusId || flow.target === focusId;
          // A step belongs to exactly one trace — `stepDomain`, or the first domain tag.
          // Matching on `domains.includes` instead would leak step numbers into every
          // other domain a multi-domain flow is tagged with.
          const traced =
            traceDomain !== null &&
            flow.step !== undefined &&
            (flow.stepDomain ?? flow.domains[0]) === traceDomain;
          const color = traceDomain
            ? domainColors[traceDomain]
            : inFocus && focusId
              ? "#7d8ea8"
              : NEUTRAL_EDGE;
          const label = showLabels
            ? traced
              ? `${flow.step}. ${flow.label}`
              : flow.label
            : undefined;
          return {
            id: flow.id,
            source: flow.source,
            target: flow.target,
            label,
            animated: traced,
            style: {
              stroke: color,
              strokeWidth: traced || (inFocus && focusId) ? 2 : 1.25,
              strokeDasharray: flow.planned ? "6 4" : undefined,
              opacity: inFocus ? 1 : 0.1,
            },
            labelStyle: {
              fill: inFocus ? "#cbd5e1" : "#475569",
              fontSize: 10,
            },
            labelBgStyle: { fill: "#0b1220", fillOpacity: 0.85 },
            labelBgPadding: [4, 2] as [number, number],
            labelBgBorderRadius: 4,
            markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
          };
        }),
    [flows, positions, focusId, showLabels, traceDomain],
  );

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => onSelect(node.id),
    [onSelect],
  );

  return (
    <ReactFlow
      nodes={nodes}
      onNodesChange={onNodesChange}
      edges={edges}
      nodeTypes={nodeTypes}
      colorMode="dark"
      fitView
      fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
      minZoom={0.15}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
      nodesDraggable
      nodesConnectable={false}
      edgesFocusable={false}
      onNodeClick={handleNodeClick}
      onNodeMouseEnter={(_event, node) => setHoverId(node.id)}
      onNodeMouseLeave={() => setHoverId(null)}
      onPaneClick={() => onSelect(null)}
      className="!bg-transparent"
    >
      <Background color="#1c2637" gap={24} size={1.5} />
    </ReactFlow>
  );
}
