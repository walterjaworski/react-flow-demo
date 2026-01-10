import { InitialNodeDialog } from "@/components/flow/dialogs/InitialNodeDialog";
import { NewNodeDialog } from "@/components/flow/dialogs/NewNodeDIalog";
import { InitialNodeForm, InitialNodeFormValues } from "@/components/flow/forms/InitialNodeForm";
import { NewNodeForm, NewNodeFormValues } from "@/components/flow/forms/NewNodeForm";
import ApiNode from "@/components/flow/nodes/ApiNode";
import FinalFailedNode from "@/components/flow/nodes/FinalFailedNode";
import FinalSuccessNode from "@/components/flow/nodes/FinalSuccessNode";
import InitialNode from "@/components/flow/nodes/InitialNode";
import { zodResolver } from "@hookform/resolvers/zod/src/index.js";
import { Background, BackgroundVariant, Controls, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "../components/ui/button";

const NODE_HEIGHT_DEFAULT = 150;
const HORIZONTAL_GAP = 300;
const VERTICAL_GAP = 20;

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

  function applyTreeLayout(
    nodes: Node[],
    edges: Edge[],
    setNodes: (updater: (prev: Node[]) => Node[]) => void
  ) {
    const NODE_HEIGHTS: Record<string, number> = {
      initialNode: 200,
      apiNode: 150,
      finalNode: 120,
    };

    const startX = 50;
    const startY = 50;

    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    const childrenMap: Record<string, string[]> = {};
    edges.forEach(edge => {
      if (!childrenMap[edge.source]) childrenMap[edge.source] = [];
      childrenMap[edge.source].push(edge.target);
    });

    const allTargets = new Set(edges.map(e => e.target));
    const root = nodes.find(n => n.id === 'start-node') || nodes.find(n => !allTargets.has(n.id));
    if (!root) return;

    function getSubtreeHeight(nodeId: string): number {
      const node = nodeMap.get(nodeId);
      const nodeType = node?.type ?? 'apiNode';
      const ownHeight = (node?.height ?? NODE_HEIGHTS[nodeType]) ?? NODE_HEIGHT_DEFAULT;

      const children = childrenMap[nodeId] || [];
      if (children.length === 0) return ownHeight;

      const childrenHeights = children.map(childId => getSubtreeHeight(childId));
      const totalChildren = childrenHeights.reduce((a, b) => a + b, 0) + VERTICAL_GAP * (children.length - 1);

      return Math.max(ownHeight, totalChildren);
    }

    const positions = new Map<string, { x: number; y: number }>();

    function layoutTree(nodeId: string, x: number, y: number) {
      const node = nodeMap.get(nodeId);
      const nodeType = node?.type ?? 'apiNode';
      const nodeHeight = (node?.height ?? NODE_HEIGHTS[nodeType]) ?? NODE_HEIGHT_DEFAULT;

      const subtreeHeight = getSubtreeHeight(nodeId);

      const nodeY = y + subtreeHeight / 2 - nodeHeight / 2;
      positions.set(nodeId, { x, y: nodeY });

      const children = childrenMap[nodeId] || [];
      if (children.length === 0) return;

      const childrenHeights = children.map(child => getSubtreeHeight(child));
      const totalChildrenHeight = childrenHeights.reduce((a, b) => a + b, 0) + VERTICAL_GAP * (children.length - 1);

      let currentY = y + subtreeHeight / 2 - totalChildrenHeight / 2;
      for (let i = 0; i < children.length; i++) {
        const childId = children[i];
        const childHeight = childrenHeights[i];
        layoutTree(childId, x + HORIZONTAL_GAP, currentY);
        currentY += childHeight + VERTICAL_GAP;
      }
    }

    layoutTree(root.id, startX, startY);

    let hasChange = false;
    const updated = nodes.map(n => {
      const p = positions.get(n.id);
      if (!p) return n;
      if (n.position.x !== p.x || n.position.y !== p.y) {
        hasChange = true;
        return { ...n, position: { x: p.x, y: p.y } };
      }
      return n;
    });

    if (hasChange) {
      setNodes(() => updated);
    }
  };

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
