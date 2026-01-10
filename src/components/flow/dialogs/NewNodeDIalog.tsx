import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NewNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceNodeId: string | null;
  sourceHandleId: string | null;
  children: React.ReactNode;
}

export function NewNodeDialog({
  open,
  onOpenChange,
  sourceNodeId,
  sourceHandleId,
  children,
}: NewNodeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar novo node</DialogTitle>
          <DialogDescription>
            Adicionar um novo node conectado ao node{" "}
            <strong>{sourceNodeId}</strong>{" "}
            pelo handle{" "}
            <strong>{sourceHandleId}</strong>
          </DialogDescription>
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  );
}
