import { Handle, Position } from "@xyflow/react";

interface FinalFailedNodeProps {
  id: string;
}

export default function FinalFailedNode({ id }: FinalFailedNodeProps) {
  return (
    <div className="p-2 border-2 border-red-600 rounded bg-red-100">
      Final Failed Node
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-in`}
        className="absolute"
      />
    </div>
  );
}
