import { zodResolver } from "@hookform/resolvers/zod/src/index.js";
import { RadioGroup } from "@radix-ui/react-radio-group";
import { Background, BackgroundVariant, Controls, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import ApiNode from "../components/custom/nodes/ApiNode";
import BalanceNode from "../components/custom/nodes/BalanceNode";
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

const initialNode = {
  id: 'start-node',
  position: { x: 25, y: 25 },
  type: 'initialNode',
  data: { label: '', bgClass: '' },
};

const colors = ["bg-blue-200", "bg-green-200", "bg-red-200"];

const nodeTypesOptions = [
  { label: 'API Node', value: 'apiNode' },
  { label: 'Balance Node', value: 'balanceNode' },
  { label: 'Final Success Node', value: 'finalSuccessNode' },
  { label: 'Final Failed Node', value: 'finalFailedNode' },
];

const OriginalNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Start' } },
  { id: '2', position: { x: 200, y: 100 }, data: { label: 'End' } },
];

const OriginalEdges = [{ id: 'e1-2', source: '1', target: '2' }];

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

    if (sourceNodeId) {
      const handleType = sourceHandleId?.split('-').pop() ?? '';
      const newEdge: Edge = {
        id: `${sourceHandleId}-${id}`,
        source: sourceNodeId,
        sourceHandle: sourceHandleId ?? undefined,
        target: id,
        type: 'bezier',
        style: { stroke: handleType === 'out' ? 'green' : 'red', strokeWidth: 2 },
      }
      const newEdges = [...edges, newEdge];
      setEdges(newEdges);
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

  const handleRequestNewNodeFromSource = useCallback((sourceId: string, handleId: string) => {
    setSourceNodeId(sourceId);
    setSourceHandleId(handleId);
    setDialogNewIsOpen(true);
  }, []);

  const nodeTypes = useMemo(() => ({
    initialNode: (nodeProps: any) => <InitialNode {...nodeProps} onRequestNewNode={handleRequestNewNodeFromSource} />,
    apiNode: (nodeProps: any) => <ApiNode {...nodeProps} />,
    balanceNode: (nodeProps: any) => <BalanceNode {...nodeProps} />,
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
                <DialogFooter>
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
          // nodes={OriginalNodes}
          nodes={nodes}
          // edges={OriginalEdges}
          edges={edges}
          nodeTypes={nodeTypes}
        // fitView
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
              <DialogFooter>
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
