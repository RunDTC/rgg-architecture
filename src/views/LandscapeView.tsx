"use client";

import { useMemo } from "react";
import { datastores, externals, flows, systems } from "@/data/model";
import { lanes, type LaneSpec } from "@/config/landscape";
import { FlowGraph, type LaneLabel } from "@/graph/FlowGraph";
import { NODE_HEIGHT, NODE_WIDTH, type Point } from "@/graph/layout";

/** Resolve a lane spec to its ordered list of node ids (see src/config/landscape.ts). */
function laneIds(lane: LaneSpec): string[] {
  if ("ids" in lane) return lane.ids;
  if ("tier" in lane) {
    return systems.filter((system) => system.tier === lane.tier).map((s) => s.id);
  }
  const source = lane.kind === "datastore" ? datastores : externals;
  return source.map((node) => node.id);
}

const COLUMN_GAP = 190;
const ROW_GAP = 34;
const HEADER_OFFSET = 56;

interface LandscapeViewProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function LandscapeView({ selectedId, onSelect }: LandscapeViewProps) {
  const { positions, laneLabels } = useMemo(() => {
    const positions = new Map<string, Point>();
    const laneLabels: LaneLabel[] = [];
    lanes.forEach((lane, columnIndex) => {
      const x = columnIndex * (NODE_WIDTH + COLUMN_GAP);
      laneLabels.push({ id: lane.title, text: lane.title, x, y: 0 });
      laneIds(lane).forEach((id, rowIndex) => {
        positions.set(id, {
          x,
          y: HEADER_OFFSET + rowIndex * (NODE_HEIGHT + ROW_GAP),
        });
      });
    });
    return { positions, laneLabels };
  }, []);

  return (
    <FlowGraph
      positions={positions}
      flows={flows}
      selectedId={selectedId}
      onSelect={onSelect}
      showLabels={false}
      laneLabels={laneLabels}
    />
  );
}
