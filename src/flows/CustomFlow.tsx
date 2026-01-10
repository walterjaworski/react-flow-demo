import { InitialNodeDialog, NewNodeDialog } from "@/components/flow/dialogs";
import { InitialNodeForm, InitialNodeFormValues, NewNodeForm, NewNodeFormValues } from "@/components/flow/forms";
import { applyTreeLayout } from "@/components/flow/layout/applyTreeLayout";
import { ApiNode, FinalFailedNode, FinalSuccessNode, InitialNode } from "@/components/flow/nodes";
import { createEdge } from "@/components/flow/utils/edges";
import { Background, BackgroundVariant, Controls, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";

export default function CustomFlow() {
  const [dialogInitialNodeIsOpen, setDialogInitialNodeIsOpen] = useState(false);
  const [dialogNewIsOpen, setDialogNewIsOpen] = useState(false);
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(null);
  const [sourceHandleId, setSourceHandleId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

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

    resetNewNodeCreationState();
  }

  function resetNewNodeCreationState() {
    setSourceNodeId(null);
    setSourceHandleId(null);
    setDialogNewIsOpen(false);
  }

  function cleanFlow() {
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
    setNodes((nodes) => applyTreeLayout(nodes, edges));
  }, [edges]);

  return (
    <>
      <div className="flex gap-2 mb-4">
        <Button onClick={() => setDialogInitialNodeIsOpen(true)}>Inserir node inicial</Button>
        <Button variant="ghost" className="ml-auto" onClick={() => cleanFlow()}>Limpar flow</Button>
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
