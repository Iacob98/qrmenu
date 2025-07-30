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
  name: z.string().min(1, "Введите название ресторана"),
  city: z.string().optional(),
  phone: z.string().optional(),
  currency: z.string().default("EUR"),
  language: z.string().default("ru"),
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
      language: "ru",
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
        title: "Успешно!",
        description: "Ресторан создан",
      });
      
      // Invalidate restaurants query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      
      // Close modal and reset form
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать ресторан",
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
          <DialogTitle>Создать ресторан</DialogTitle>
          <DialogDescription>
            Добавьте новый ресторан для управления меню
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название ресторана</FormLabel>
                  <FormControl>
                    <Input placeholder="Мой ресторан" {...field} />
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
                  <FormLabel>Город (необязательно)</FormLabel>
                  <FormControl>
                    <Input placeholder="Москва" {...field} />
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
                  <FormLabel>Телефон (необязательно)</FormLabel>
                  <FormControl>
                    <Input placeholder="+7 (xxx) xxx-xx-xx" {...field} />
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
                    <FormLabel>Валюта</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите валюту" />
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
                    <FormLabel>Язык</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите язык" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ru">Русский</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ro">Română</SelectItem>
                        <SelectItem value="pl">Polski</SelectItem>
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
                  <FormLabel>AI провайдер</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите провайдера" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="openrouter">OpenRouter</SelectItem>
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
                  <FormLabel>AI токен (необязательно)</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder="sk-..." 
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500">
                    {form.watch("aiProvider") === "openrouter" 
                      ? "Токен OpenRouter для генерации меню" 
                      : "Токен OpenAI для генерации меню из фото и текста"
                    }
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
                    <FormLabel>Модель AI (необязательно)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="gpt-4o, claude-3-sonnet, etc." 
                        {...field} 
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500">
                      Укажите конкретную модель для OpenRouter
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
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={createRestaurantMutation.isPending}
              >
                {createRestaurantMutation.isPending ? "Создание..." : "Создать"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}