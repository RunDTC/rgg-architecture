import dagre from "@dagrejs/dagre";

export const NODE_WIDTH = 224;
export const NODE_HEIGHT = 78;

export interface Point {
  x: number;
  y: number;
}

/** Auto-layout a subgraph left-to-right with dagre. */
export function dagreLayout(
  nodeIds: string[],
  edges: { source: string; target: string }[],
): Map<string, Point> {
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({ rankdir: "LR", ranksep: 120, nodesep: 36, edgesep: 24 });
  graph.setDefaultEdgeLabel(() => ({}));

  for (const id of nodeIds) {
    graph.setNode(id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  const idSet = new Set(nodeIds);
  for (const edge of edges) {
    if (idSet.has(edge.source) && idSet.has(edge.target)) {
      graph.setEdge(edge.source, edge.target);
    }
  }

  dagre.layout(graph);

  const positions = new Map<string, Point>();
  for (const id of nodeIds) {
    const node = graph.node(id);
    positions.set(id, {
      x: node.x - NODE_WIDTH / 2,
      y: node.y - NODE_HEIGHT / 2,
    });
  }
  return positions;
}
