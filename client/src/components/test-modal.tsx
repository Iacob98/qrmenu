import { Button } from "@/components/ui/button";

interface TestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestModal({ open, onOpenChange }: TestModalProps) {
  console.log('TestModal render - open:', open);
  
  if (!open) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Test Modal</h2>
        <p className="mb-4">If you see this, the modal system is working!</p>
        <div className="flex justify-end space-x-2">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </div>
    </div>
  );
}