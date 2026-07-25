import { systems } from "./systems";
import { datastores } from "./datastores";
import { externals } from "./externals";
import { flows } from "./flows";
import { migrations } from "./migrations";
import { sequences, actors } from "./sequences";
import type { ArchNodeDef, Domain, FlowDef, SequenceDef } from "./types";

export const allNodes: ArchNodeDef[] = [...systems, ...datastores, ...externals];

export const nodeById = new Map<string, ArchNodeDef>(
  allNodes.map((node) => [node.id, node]),
);

export function flowsForNode(nodeId: string): {
  outgoing: FlowDef[];
  incoming: FlowDef[];
} {
  return {
    outgoing: flows.filter((flow) => flow.source === nodeId),
    incoming: flows.filter((flow) => flow.target === nodeId),
  };
}

export function flowsForDomain(domain: Domain): FlowDef[] {
  return flows.filter((flow) => flow.domains.includes(domain));
}

/** Node ids referenced by a set of flows, in stable order. */
export function nodeIdsForFlows(subset: FlowDef[]): string[] {
  const ids = new Set<string>();
  for (const flow of subset) {
    ids.add(flow.source);
    ids.add(flow.target);
  }
  return allNodes.filter((node) => ids.has(node.id)).map((node) => node.id);
}

export const sequenceById = new Map<string, SequenceDef>(
  sequences.map((sequence) => [sequence.id, sequence]),
);

/** True when a participant id is a real architecture node (i.e. has a fact sheet). */
export function isArchNode(id: string): boolean {
  return nodeById.has(id);
}

/** Display name for a sequence participant — a node name, an actor label, or the raw id. */
export function participantLabel(id: string): string {
  return nodeById.get(id)?.name ?? actors[id] ?? id;
}

export { systems, datastores, externals, flows, migrations, sequences, actors };
