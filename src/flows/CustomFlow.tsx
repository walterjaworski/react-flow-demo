import { InitialNodeDialog } from "@/components/flow/dialogs/InitialNodeDialog";
import { NewNodeDialog } from "@/components/flow/dialogs/NewNodeDIalog";
import { InitialNodeForm, InitialNodeFormValues } from "@/components/flow/forms/InitialNodeForm";
import { NewNodeForm, NewNodeFormValues } from "@/components/flow/forms/NewNodeForm";
import { applyTreeLayout } from "@/components/flow/layout/applyTreeLayout";
import ApiNode from "@/components/flow/nodes/ApiNode";
import FinalFailedNode from "@/components/flow/nodes/FinalFailedNode";
import FinalSuccessNode from "@/components/flow/nodes/FinalSuccessNode";
import InitialNode from "@/components/flow/nodes/InitialNode";
import { zodResolver } from "@hookform/resolvers/zod/src/index.js";
import { Background, BackgroundVariant, Controls, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "../components/ui/button";

const colors = ["bg-blue-200", "bg-green-200", "bg-red-200"];

const edgeColorByCase: Record<string, string> = {
  success: "#22C55E",
  deny: "#EAB308",
  fail: "#EF4444",
};

const nodeTypesOptions = [
  { label: 'API Node', value: 'apiNode' },
  { label: 'Final Success Node', value: 'finalSuccessNode' },
  { label: 'Final Failed Node', value: 'finalFailedNode' },
];

const initialNodeFormSchema = z.object({
  label: z.string().min(2, {
    message: "Label deve conter ao menos 2 caracteres.",
  }).max(20, {
    message: "Label deve conter no máximo 20 caracteres.",
  }),
  description: z.string().min(2, {
    message: "Descrição deve conter ao menos 2 caracteres.",
  }).max(20, {
    message: "Descrição deve conter no máximo 20 caracteres.",
  }),
  bgClass: z.string(),
});

const newNodeFormSchema = z.object({
  nodeType: z.string(),
});

export default function CustomFlow() {
  const [dialogInitialNodeIsOpen, setDialogInitialNodeIsOpen] = useState(false);
  const [dialogNewIsOpen, setDialogNewIsOpen] = useState(false);
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(null);
  const [sourceHandleId, setSourceHandleId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const hasInitialNode = useMemo(() => {
    return nodes.some((node) => node.type === 'initialNode');
  }, [nodes]);

  const initialNodeForm = useForm<z.infer<typeof initialNodeFormSchema>>({
    resolver: zodResolver(initialNodeFormSchema),
    defaultValues: {
      label: "",
      description: "",
      bgClass: colors[0],
    },
  });

  const newNodeForm = useForm<z.infer<typeof newNodeFormSchema>>({
    resolver: zodResolver(newNodeFormSchema),
    defaultValues: {
      nodeType: nodeTypesOptions[0].value,
    },
  });

  function getCaseFromHandleId(handleId?: string) {
    if (!handleId) return null;
    return handleId.split("-").pop();
  }

  function handleCreateInitialNode(
    values: InitialNodeFormValues
  ) {
    const initialNode: Node = {
      id: "start-node",
      type: "initialNode",
      position: { x: 50, y: 50 },
      data: {
        label: values.label,
        description: values.description,
        bgClass: values.bgClass,
      },
    };

    setNodes([initialNode]);
  }

  function handleCreateNewNode(
    values: NewNodeFormValues
  ) {
    const id = crypto.randomUUID().slice(0, 8);

    const baseNode =
      sourceNodeId
        ? nodes.find((n) => n.id === sourceNodeId)
        : nodes[nodes.length - 1];

    if (!baseNode) return;

    const position = {
      x: baseNode.position.x + 200,
      y: baseNode.position.y,
    };

    const newNode: Node = {
      id,
      type: values.nodeType,
      position,
      data: {},
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);

    if (sourceNodeId && sourceHandleId) {
      const newEdge = createEdge({
        sourceNodeId,
        sourceHandleId,
        targetNodeId: id,
      });

      setEdges((prev) => [...prev, newEdge]);
    }

    resetNewNodeFlow();
  }

  function createEdge({
    sourceNodeId,
    sourceHandleId,
    targetNodeId,
  }: {
    sourceNodeId: string;
    sourceHandleId: string;
    targetNodeId: string;
  }): Edge {
    const caseType = getCaseFromHandleId(sourceHandleId);

    return {
      id: `${sourceHandleId}-${targetNodeId}`,
      source: sourceNodeId,
      sourceHandle: sourceHandleId,
      target: targetNodeId,
      type: "default",
      style: {
        stroke:
          (caseType && edgeColorByCase[caseType]) ?? "#64748B",
        strokeWidth: 2,
      },
    };
  }

  function resetNewNodeFlow() {
    setSourceNodeId(null);
    setSourceHandleId(null);
    setDialogNewIsOpen(false);
  }


  function CleanFlow() {
    setEdges([]);
    setNodes([]);
  }

  const handleRequestNewNodeFromSource = useCallback((sourceId: string, handleId: string) => {
    console.log('Requesting new node from source:', sourceId, handleId);
    setSourceNodeId(sourceId);
    setSourceHandleId(handleId);
    setDialogNewIsOpen(true);
  }, []);

  const nodeTypes = useMemo(() => ({
    initialNode: (nodeProps: any) => <InitialNode {...nodeProps} onRequestNewNode={handleRequestNewNodeFromSource} />,
    apiNode: (nodeProps: any) => <ApiNode {...nodeProps} onRequestNewNode={handleRequestNewNodeFromSource} />,
    finalSuccessNode: (nodeProps: any) => <FinalSuccessNode {...nodeProps} />,
    finalFailedNode: (nodeProps: any) => <FinalFailedNode {...nodeProps} />,
  }), []);

  useEffect(() => {
    setNodes((prev) => applyTreeLayout(prev, edges));
  }, [edges]);

  return (
    <>
      <div className="flex gap-2 mb-4">
        <Button onClick={() => setDialogInitialNodeIsOpen(true)}>Inserir node inicial</Button>
        <Button variant="ghost" className="ml-auto" onClick={() => CleanFlow()}>Limpar flow</Button>
      </div>
      <div style={{ width: '100%', height: '500px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          nodesConnectable={false}
          nodesDraggable
          elementsSelectable
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
        </ReactFlow>
      </div>

      <InitialNodeDialog
        open={dialogInitialNodeIsOpen}
        onOpenChange={setDialogInitialNodeIsOpen}
      >
        <InitialNodeForm
          onSubmit={(values) => {
            handleCreateInitialNode(values);
            setDialogInitialNodeIsOpen(false);
          }}
        />
      </InitialNodeDialog>

      <NewNodeDialog
        open={dialogNewIsOpen}
        onOpenChange={setDialogNewIsOpen}
        sourceNodeId={sourceNodeId}
        sourceHandleId={sourceHandleId}
      >
        <NewNodeForm
          onSubmit={(values) => {
            handleCreateNewNode(values);
            setDialogNewIsOpen(false);
          }}
        />
      </NewNodeDialog>
    </>
  );
}
