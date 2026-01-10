import { INodeProps } from "@/types/nodes";
import { Handle, Position } from "@xyflow/react";
import { Button } from "../../ui/button";
import NodeContainer from "./NodeContainer";

export default function InitialNode({ id, data, onRequestNewNode }: INodeProps) {
  return (
    <NodeContainer id={id}>
      {data && <div className="text-lg font-bold p-2">{data.label}</div>}
      {data && <div className="text-xs p-2">{data.description}</div>}

      <Button
        type="button"
        size="sm"
        onClick={() => onRequestNewNode && onRequestNewNode(id, "start-node-out")}
        className="mt-2 rounded-none rounded-b-xs"
      >
        + Adicionar node
      </Button>

      <Handle
        type="source"
        position={Position.Bottom}
        id="start-node-out"
        className="tw-absolute -tw-bottom-0 tw-left-2/4 tw-z-20 tw-w-2 tw-h-2"
      />
    </NodeContainer>
  );
}
