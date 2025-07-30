import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Account
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    // Step 2: Restaurant
    restaurantName: "",
    city: "",
    phone: "",
    currency: "EUR",
    language: "ru",
    aiToken: "",
  });

  const { register } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const createRestaurantMutation = useMutation({
    mutationFn: async (data: any) => {
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
        title: "Готово! 🎉",
        description: "Ваш ресторан зарегистрирован. Вы можете приступить к созданию категорий и добавлению блюд.",
      });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStepOne = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Пароли не совпадают",
        variant: "destructive",
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: "Ошибка", 
        description: "Необходимо принять условия использования",
        variant: "destructive",
      });
      return;
    }

    try {
      await register(formData.email, formData.password);
      setStep(2);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStepTwo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.restaurantName.trim()) {
      toast({
        title: "Ошибка",
        description: "Укажите название ресторана",
        variant: "destructive",
      });
      return;
    }

    createRestaurantMutation.mutate({
      name: formData.restaurantName.trim(),
      city: formData.city.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      currency: formData.currency,
      language: formData.language,
      aiToken: formData.aiToken.trim() || undefined,
    });
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Utensils className="text-primary-600 text-2xl mr-3" />
              <span className="font-bold text-xl">QRMenu</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/")}
              className="text-sm"
            >
              ← Вернуться на главную
            </Button>
          </div>

          {step === 1 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  Создайте аккаунт и начните работать с меню
                </CardTitle>
                <p className="text-center text-gray-600 text-sm">
                  Укажите только самое необходимое — всё остальное можно добавить позже.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStepOne} className="space-y-4">
                  <div>
                    <Label htmlFor="email">📧 Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="restaurant@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">🔒 Пароль</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Минимум 8 символов"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">🔒 Повторите пароль</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptTerms: checked === true }))}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      Я принимаю условия использования и политику конфиденциальности
                    </Label>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Продолжить →
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Информация о ресторане</CardTitle>
                <p className="text-center text-gray-600 text-sm">
                  Расскажите о вашем заведении
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStepTwo} className="space-y-4">
                  <div>
                    <Label htmlFor="restaurantName">🏠 Название ресторана</Label>
                    <Input
                      id="restaurantName"
                      value={formData.restaurantName}
                      onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
                      placeholder="Итальянский ресторан"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="city">🌍 Город</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Берлин"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">📞 Контактный телефон (опционально)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+49 123 456 789"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currency">💱 Валюта</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="PLN">PLN</SelectItem>
                        <SelectItem value="MDL">MDL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="aiToken">🧠 ИИ-токен (опционально)</Label>
                    <Input
                      id="aiToken"
                      value={formData.aiToken}
                      onChange={(e) => setFormData(prev => ({ ...prev, aiToken: e.target.value }))}
                      placeholder="sk-..."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Добавьте токен своего ИИ-провайдера (например, OpenRouter или OpenAI), чтобы мы могли автоматически генерировать фото, состав и БЖУ.
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Назад
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createRestaurantMutation.isPending}
                      className="flex-1"
                    >
                      {createRestaurantMutation.isPending ? "Создание..." : "Завершить регистрацию"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
