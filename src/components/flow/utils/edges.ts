import { EDGE_COLOR_BY_CASE, type EdgeCase } from "../constants/edges";

export function getCaseFromHandleId(
  handleId?: string
): EdgeCase | null {
  if (!handleId) return null;

  const caseType = handleId.split("-").pop();

  if (
    caseType === "success" ||
    caseType === "deny" ||
    caseType === "fail"
  ) {
    return caseType;
  }

  return null;
}

export function createEdge({
  sourceNodeId,
  sourceHandleId,
  targetNodeId,
}: {
  sourceNodeId: string;
  sourceHandleId: string;
  targetNodeId: string;
}) {
  const caseType = getCaseFromHandleId(sourceHandleId);

  return {
    id: `${sourceHandleId}-${targetNodeId}`,
    source: sourceNodeId,
    sourceHandle: sourceHandleId,
    target: targetNodeId,
    type: "default",
    style: {
      stroke:
        (caseType && EDGE_COLOR_BY_CASE[caseType]) ?? "#64748B",
      strokeWidth: 2,
    },
  };
}
