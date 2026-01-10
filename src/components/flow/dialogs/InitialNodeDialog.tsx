import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InitialNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export function InitialNodeDialog({
  open,
  onOpenChange,
  children,
}: InitialNodeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inserir Node Inicial</DialogTitle>
          <DialogDescription>
            Customize o node inicial do seu flow aqui.
          </DialogDescription>
        </DialogHeader>

        {children}

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}
