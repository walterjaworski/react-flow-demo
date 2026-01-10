import { INodeProps } from "@/types/nodes";
import { Handle, Position } from "@xyflow/react";

export default function FinalSuccessNode({ id }: INodeProps) {
  return (
    <div className="p-2 border-2 border-green-600 rounded bg-green-100">
      Final Success Node
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-in`}
        className="absolute"
      />
    </div>
  );
}
