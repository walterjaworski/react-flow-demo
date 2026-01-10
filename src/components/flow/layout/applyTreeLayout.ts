import type { Edge, Node } from "@xyflow/react";
import { HORIZONTAL_GAP, VERTICAL_GAP } from "../constants/layout";
import { NODE_HEIGHT_BY_TYPE } from "../constants/nodeHeights";

export function applyTreeLayout(
  nodes: Node[],
  edges: Edge[]
): Node[] {
  if (nodes.length === 0) return nodes;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const childrenMap: Record<string, string[]> = {};
  edges.forEach((edge) => {
    if (!childrenMap[edge.source]) {
      childrenMap[edge.source] = [];
    }
    childrenMap[edge.source].push(edge.target);
  });

  const allTargets = new Set(edges.map((e) => e.target));
  const root =
    nodes.find((n) => n.id === "start-node") ??
    nodes.find((n) => !allTargets.has(n.id));

  if (!root) return nodes;

  function getNodeHeight(node: Node) {
    return NODE_HEIGHT_BY_TYPE[node.type ?? "apiNode"] ?? 150;
  }

  function getSubtreeHeight(nodeId: string): number {
    const node = nodeMap.get(nodeId);
    if (!node) return 0;

    const ownHeight = getNodeHeight(node);
    const children = childrenMap[nodeId] ?? [];

    if (children.length === 0) {
      return ownHeight;
    }

    const childrenHeights = children.map(getSubtreeHeight);
    const total =
      childrenHeights.reduce((a, b) => a + b, 0) +
      VERTICAL_GAP * (children.length - 1);

    return Math.max(ownHeight, total);
  }

  const positions = new Map<string, { x: number; y: number }>();

  function layout(nodeId: string, x: number, y: number) {
    const node = nodeMap.get(nodeId);
    if (!node) return;

    const nodeHeight = getNodeHeight(node);
    const subtreeHeight = getSubtreeHeight(nodeId);

    const nodeY = y + subtreeHeight / 2 - nodeHeight / 2;
    positions.set(nodeId, { x, y: nodeY });

    const children = childrenMap[nodeId] ?? [];
    if (children.length === 0) return;

    const childrenHeights = children.map(getSubtreeHeight);
    const totalChildrenHeight =
      childrenHeights.reduce((a, b) => a + b, 0) +
      VERTICAL_GAP * (children.length - 1);

    let currentY =
      y + subtreeHeight / 2 - totalChildrenHeight / 2;

    children.forEach((childId, index) => {
      layout(childId, x + HORIZONTAL_GAP, currentY);
      currentY += childrenHeights[index] + VERTICAL_GAP;
    });
  }

  layout(root.id, 50, 50);

  return nodes.map((node) => {
    const pos = positions.get(node.id);
    if (!pos) return node;

    if (
      node.position.x !== pos.x ||
      node.position.y !== pos.y
    ) {
      return {
        ...node,
        position: pos,
      };
    }

    return node;
  });
}
