import { zodResolver } from "@hookform/resolvers/zod/src/index.js";
import { RadioGroup } from "@radix-ui/react-radio-group";
import { Background, BackgroundVariant, Controls, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import ApiNode from "../components/custom/nodes/ApiNode";
import FinalFailedNode from "../components/custom/nodes/FinalFailedNode";
import FinalSuccessNode from "../components/custom/nodes/FinalSuccessNode";
import InitialNode from "../components/custom/nodes/InitialNode";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroupItem } from "../components/ui/radio-group";
import { Textarea } from "../components/ui/textarea";
import { cn } from "../lib/utils";

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

  function onSubmitInitialNode(values: z.infer<typeof initialNodeFormSchema>) {
    const newInitialNode: Node = {
      id: 'start-node',
      position: { x: 25, y: 25 },
      type: 'initialNode',
      data: {
        label: values.label,
        description: values.description,
        bgClass: values.bgClass,
      },
    };
    setNodes([newInitialNode]);
    setDialogInitialNodeIsOpen(false);
    initialNodeForm.reset();
  }

  function onSubmitNewNode(values: z.infer<typeof newNodeFormSchema>) {
    const id = crypto.randomUUID().slice(0, 8);
    const baseNode = sourceNodeId ? nodes.find(n => n.id === sourceNodeId) : nodes[nodes.length - 1];
    const baseX = baseNode?.position.x ?? 100;
    const baseY = baseNode?.position.y ?? 100;

    const newNode: Node = {
      id,
      position: { x: baseX + 200, y: baseY },
      type: values.nodeType,
      data: {},
    };

    const newNodes = [...nodes, newNode];
    setNodes(newNodes);

    if (sourceNodeId && sourceHandleId) {
      const caseType = getCaseFromHandleId(sourceHandleId);

      const edgeColor =
        (caseType && edgeColorByCase[caseType]) ?? "#64748B";

      const newEdge: Edge = {
        id: `${sourceHandleId}-${id}`,
        source: sourceNodeId,
        sourceHandle: sourceHandleId,
        target: id,
        type: "default",
        style: {
          stroke: edgeColor,
          strokeWidth: 2,
        },
      };

      const newEdges = [...edges, newEdge];
      setEdges(newEdges);

      applyTreeLayout(newNodes, newEdges, setNodes);
    } else {
      applyTreeLayout(newNodes, edges, setNodes);
    }

    setSourceNodeId(null);
    setSourceHandleId(null);
    setDialogNewIsOpen(false);
    newNodeForm.reset();
  };

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
        <Dialog
          open={dialogInitialNodeIsOpen}
          onOpenChange={(isOpen) => {
            setDialogInitialNodeIsOpen(isOpen);
            if (!isOpen) {
              initialNodeForm.reset();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button disabled={hasInitialNode}>Inserir node inicial</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Inserir Node Inicial</DialogTitle>
              <DialogDescription>
                Customize o node inicial do seu flow aqui.
              </DialogDescription>
            </DialogHeader>
            <Form {...initialNodeForm}>
              <form onSubmit={initialNodeForm.handleSubmit(onSubmitInitialNode)} className="space-y-8">
                <FormField
                  control={initialNodeForm.control}
                  name="bgClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor de fundo</FormLabel>
                      <FormControl>
                        <RadioGroup defaultValue={colors[0]} onValueChange={field.onChange} className="flex gap-4" {...field}>
                          {colors.map((color) => (
                            <div key={color}>
                              <RadioGroupItem value={color} id={color} className="sr-only" />

                              <Label
                                htmlFor={color}
                                className={cn(
                                  "w-6 h-6 rounded-full cursor-pointer ring-2 transition",
                                  color,
                                  field.value === color ? "ring-black" : "ring-transparent"
                                )}
                              />
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={initialNodeForm.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite seu Label aqui." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={initialNodeForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Digite sua descrição aqui." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="mt-4">
                  <Button type="submit">Adicionar</Button>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancelar
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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

      <Dialog open={dialogNewIsOpen} onOpenChange={() => setDialogNewIsOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar novo node</DialogTitle>
            <DialogDescription>
              Adicionar um novo node conectado ao node <strong>{sourceNodeId}</strong> pelo handle <strong>{sourceHandleId}</strong>
            </DialogDescription>
          </DialogHeader>
          <Form {...newNodeForm}>
            <form onSubmit={newNodeForm.handleSubmit(onSubmitNewNode)}>
              <FormField
                control={newNodeForm.control}
                name="nodeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <RadioGroup defaultValue="" onValueChange={field.onChange} className="flex flex-wrap gap-2" {...field}>
                        {nodeTypesOptions.map((option) => (
                          <Badge key={option.value} className={cn("flex items-center gap-2", newNodeForm.getValues("nodeType") === option.value ? "bg-black text-white" : "bg-gray-200 text-gray-800")}>
                            <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                            <Label
                              htmlFor={option.value}
                              className="p-2"
                            >
                              {option.label}
                            </Label>
                          </Badge>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-4">
                <Button type="submit">Adicionar</Button>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancelar
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
