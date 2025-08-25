import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestModal({ open, onOpenChange }: TestModalProps) {
  console.log('TestModal render - open:', open);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Test Modal</DialogTitle>
          <DialogDescription>
            This is a test modal to check if dialogs work.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4">
          <p>If you see this, the modal is working!</p>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}