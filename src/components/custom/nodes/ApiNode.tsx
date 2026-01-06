import { Handle, Position } from "@xyflow/react";
import { BanIcon, CheckCircle2Icon, CircleAlertIcon, CircleArrowRightIcon, CirclePlusIcon } from "lucide-react";
import type { JSX } from "react";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import NodeContainer from "./NodeContainer";

interface ApiNodeProps {
  id: string;
  data: {
    label: string;
    description: string;
    bgClass: string;
  };
  onRequestNewNode: (sourceId: string, handleId: string) => void;
}

const initialOutputs = [
  { case: "success", label: "Sucesso" },
  { case: "deny", label: "Negação" },
  { case: "fail", label: "Falha" },
];

export default function ApiNode({ id, onRequestNewNode }: ApiNodeProps) {
  const icons: Record<string, JSX.Element> = {
    success: <CheckCircle2Icon size={14} className="text-green-500" />,
    deny: <BanIcon size={14} className="text-yellow-500" />,
    fail: <CircleAlertIcon size={14} className="text-red-500" />,
  };

  return (
    <NodeContainer id={id}>
      <div className="p-2 border-2 border-blue-600 rounded bg-blue-100 relative">
        API Node
        <Handle
          type="target"
          position={Position.Left}
          id={`${id}-in`}
          className="absolute"
        />
      </div>
      <div className="flex-1 text-sm flex flex-col justify-around">
        {initialOutputs.map((output) => (
          <div
            key={output.case}
            className="flex items-center gap-2 pl-2 pr-6 py-2 relative border-b-2 last:border-b-0"
          >
            {icons[output.case] ?? (
              <CircleArrowRightIcon size={14} className="text-blue-500" />
            )}
            <span>{output.label}</span>
            <Handle
              type="source"
              position={Position.Right}
              id={`${id}-out-${output.case}`}
            />
            <Tooltip>
              <TooltipContent>
                Adicionar novo nó
              </TooltipContent>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="absolute top-[50%] right-[-12%] translate-y-[-50%]"
                  onClick={() =>
                    onRequestNewNode(id, `${id}-out-${output.case}`)
                  }
                >
                  <CirclePlusIcon className="bg-white" />
                </Button>
              </TooltipTrigger>
            </Tooltip>
          </div>
        ))}
      </div>
    </NodeContainer>
  );
}
