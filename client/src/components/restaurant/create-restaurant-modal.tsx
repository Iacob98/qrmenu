import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const createRestaurantSchema = z.object({
  name: z.string().min(1, "Enter restaurant name"),
  city: z.string().optional(),
  phone: z.string().optional(),
  currency: z.string().default("EUR"),
  language: z.string().default("en"),
  aiProvider: z.string().default("openai"),
  aiToken: z.string().optional(),
  aiModel: z.string().optional(),
});

type CreateRestaurantForm = z.infer<typeof createRestaurantSchema>;

interface CreateRestaurantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRestaurantModal({ open, onOpenChange }: CreateRestaurantModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateRestaurantForm>({
    resolver: zodResolver(createRestaurantSchema),
    defaultValues: {
      name: "",
      city: "",
      phone: "",
      currency: "EUR",
      language: "en",
      aiProvider: "openai",
      aiToken: "",
      aiModel: "",
    },
  });

  const createRestaurantMutation = useMutation({
    mutationFn: async (data: CreateRestaurantForm) => {
      const response = await fetch("/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
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
        description: "Restaurant created",
      });
      
      // Invalidate restaurants query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      
      // Close modal and reset form
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create restaurant",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateRestaurantForm) => {
    createRestaurantMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Restaurant</DialogTitle>
          <DialogDescription>
            Add a new restaurant to manage menus
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restaurant Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Restaurant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="New York" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (xxx) xxx-xxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="PLN">PLN (zł)</SelectItem>
                        <SelectItem value="MDL">MDL (L)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="aiProvider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Provider</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="openrouter">OpenRouter</SelectItem>
                      <SelectItem value="replicate">Replicate (Imagen-4)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="aiToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Token (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder="sk-..." 
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500">
                    {form.watch("aiProvider") === "openrouter" 
                      ? "OpenRouter token for menu generation" 
                      : form.watch("aiProvider") === "replicate"
                      ? "Replicate token for all AI functions"
                      : "OpenAI token for menu generation from photo and text"
                    }
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    💡 Image generation always uses Replicate Imagen-4
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("aiProvider") === "openrouter" && (
              <FormField
                control={form.control}
                name="aiModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Model (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="gpt-4o, claude-3-sonnet, etc." 
                        {...field} 
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500">
                      Specify a specific model for OpenRouter
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createRestaurantMutation.isPending}
              >
                {createRestaurantMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}