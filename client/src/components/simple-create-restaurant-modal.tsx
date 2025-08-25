import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SimpleCreateRestaurantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SimpleCreateRestaurantModal({ open, onOpenChange }: SimpleCreateRestaurantModalProps) {
  console.log('SimpleCreateRestaurantModal render - open:', open);
  const [name, setName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createRestaurantMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      console.log('Submitting restaurant:', data);
      const response = await fetch("/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: data.name,
          currency: "EUR",
          language: "en"
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Restaurant creation failed");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Restaurant created successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      onOpenChange(false);
      setName("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create restaurant",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter restaurant name",
        variant: "destructive",
      });
      return;
    }
    createRestaurantMutation.mutate({ name: name.trim() });
  };

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
        <h2 className="text-xl font-bold mb-4">Create Restaurant</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="restaurant-name" className="block text-sm font-medium mb-1">
              Restaurant Name *
            </label>
            <Input
              id="restaurant-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter restaurant name"
              disabled={createRestaurantMutation.isPending}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createRestaurantMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createRestaurantMutation.isPending || !name.trim()}
            >
              {createRestaurantMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}