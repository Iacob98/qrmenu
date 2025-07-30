import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "@/components/layout/sidebar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Copy, Check, AlertTriangle } from "lucide-react";
import type { Restaurant } from "@shared/schema";

export default function Settings() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [restaurantForm, setRestaurantForm] = useState({
    name: "",
    city: "",
    phone: "",
    currency: "EUR",
    language: "ru",
    aiToken: "",
  });
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });
  const [copied, setCopied] = useState(false);
  const [aiTokenStatus, setAiTokenStatus] = useState<'checking' | 'valid' | 'invalid' | null>(null);
  
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  // Get user restaurants
  const { data: restaurants, isLoading: restaurantsLoading } = useQuery({
    queryKey: ["/api/restaurants"],
  });

  // Get selected restaurant
  const { data: restaurant, isLoading: restaurantLoading } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", selectedRestaurant],
    enabled: !!selectedRestaurant,
  });

  // Update form when restaurant data changes
  useEffect(() => {
    if (restaurant) {
      setRestaurantForm({
        name: restaurant.name || "",
        city: restaurant.city || "",
        phone: restaurant.phone || "",
        currency: restaurant.currency || "EUR",
        language: restaurant.language || "ru",
        aiToken: restaurant.aiToken || "",
      });
    }
  }, [restaurant]);

  // Auto-select first restaurant and populate profile form
  useEffect(() => {
    if (restaurants && Array.isArray(restaurants) && restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurant]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email,
      });
    }
  }, [user]);

  const updateRestaurantMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/restaurants/${selectedRestaurant}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", selectedRestaurant] });
      toast({
        title: "Успешно обновлено",
        description: "Настройки ресторана сохранены",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRestaurantMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/restaurants/${selectedRestaurant}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      toast({
        title: "Ресторан удалён",
        description: "Ресторан и все его данные удалены",
      });
      setSelectedRestaurant("");
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRestaurantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;
    updateRestaurantMutation.mutate(restaurantForm);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update API
    toast({
      title: "Функция в разработке",
      description: "Обновление профиля будет доступно в следующей версии",
    });
  };

  const copyPublicLink = () => {
    if (!restaurant) return;
    const baseUrl = window.location.origin;
    const publicUrl = `${baseUrl}/menu/${restaurant.slug}`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Ссылка скопирована",
      description: "Публичная ссылка на меню скопирована в буфер обмена",
    });
  };

  const checkAiToken = async () => {
    if (!restaurantForm.aiToken.trim()) return;
    
    setAiTokenStatus('checking');
    try {
      // Simple test request to validate token
      await apiRequest("POST", "/api/ai/analyze-text", {
        restaurantId: selectedRestaurant,
        text: "Test menu item"
      });
      setAiTokenStatus('valid');
      toast({
        title: "Токен действителен",
        description: "ИИ-токен работает корректно",
      });
    } catch (error) {
      setAiTokenStatus('invalid');
      toast({
        title: "Токен недействителен",
        description: "Проверьте правильность введённого токена",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRestaurant = () => {
    if (!confirm("Вы уверены, что хотите удалить ресторан? Это действие нельзя отменить.")) {
      return;
    }
    deleteRestaurantMutation.mutate();
  };

  if (restaurantsLoading || restaurantLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
            <p className="text-gray-600">Управление настройками ресторана и профиля</p>
          </div>
        </header>

        <div className="p-6">
          <Tabs defaultValue="restaurant" className="space-y-6">
            <TabsList>
              <TabsTrigger value="restaurant">Ресторан</TabsTrigger>
              <TabsTrigger value="profile">Профиль</TabsTrigger>
            </TabsList>

            <TabsContent value="restaurant" className="space-y-6">
              {!restaurant ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-600">Выберите ресторан для настройки</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Basic Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Основная информация</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleRestaurantSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">🏠 Название ресторана</Label>
                            <Input
                              id="name"
                              value={restaurantForm.name}
                              onChange={(e) => setRestaurantForm(prev => ({ ...prev, name: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="city">🌍 Город</Label>
                            <Input
                              id="city"
                              value={restaurantForm.city}
                              onChange={(e) => setRestaurantForm(prev => ({ ...prev, city: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="phone">📞 Контактный телефон</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={restaurantForm.phone}
                            onChange={(e) => setRestaurantForm(prev => ({ ...prev, phone: e.target.value }))}
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Отображается в футере меню
                          </p>
                        </div>

                        <div>
                          <Label>🔗 Публичная ссылка</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Input
                              value={`${window.location.origin}/menu/${restaurant.slug}`}
                              readOnly
                              className="bg-gray-50"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={copyPublicLink}
                              className="whitespace-nowrap"
                            >
                              {copied ? <Check size={16} /> : <Copy size={16} />}
                              {copied ? "Скопировано" : "Скопировать"}
                            </Button>
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          disabled={updateRestaurantMutation.isPending}
                        >
                          {updateRestaurantMutation.isPending ? "Сохранение..." : "Сохранить изменения"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Currency and Language */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Валюта и язык</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="currency">💱 Валюта</Label>
                          <Select
                            value={restaurantForm.currency}
                            onValueChange={(value) => setRestaurantForm(prev => ({ ...prev, currency: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EUR">💶 EUR</SelectItem>
                              <SelectItem value="USD">💵 USD</SelectItem>
                              <SelectItem value="PLN">🇵🇱 PLN</SelectItem>
                              <SelectItem value="MDL">🇲🇩 MDL</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="language">🌐 Язык меню</Label>
                          <Select
                            value={restaurantForm.language}
                            onValueChange={(value) => setRestaurantForm(prev => ({ ...prev, language: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Эти параметры влияют на отображение меню
                      </p>
                    </CardContent>
                  </Card>

                  {/* AI Token */}
                  <Card>
                    <CardHeader>
                      <CardTitle>ИИ-токен</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="aiToken">🔐 API Token</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            id="aiToken"
                            type="password"
                            value={restaurantForm.aiToken}
                            onChange={(e) => setRestaurantForm(prev => ({ ...prev, aiToken: e.target.value }))}
                            placeholder="sk-..."
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={checkAiToken}
                            disabled={!restaurantForm.aiToken.trim() || aiTokenStatus === 'checking'}
                          >
                            {aiTokenStatus === 'checking' ? "Проверка..." : "Проверить токен"}
                          </Button>
                        </div>
                        {aiTokenStatus === 'valid' && (
                          <p className="text-sm text-green-600 mt-1 flex items-center">
                            <Check size={16} className="mr-1" />
                            Активен
                          </p>
                        )}
                        {aiTokenStatus === 'invalid' && (
                          <p className="text-sm text-red-600 mt-1 flex items-center">
                            <AlertTriangle size={16} className="mr-1" />
                            Ошибка
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Токен нужен для генерации фото, составов, БЖУ. Поддерживаются OpenRouter, OpenAI и др.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Danger Zone */}
                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="text-red-600">Опасная зона</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Удалить ресторан</p>
                          <p className="text-sm text-gray-500">
                            Это действие нельзя отменить. Будут удалены все данные ресторана.
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteRestaurant}
                          disabled={deleteRestaurantMutation.isPending}
                        >
                          {deleteRestaurantMutation.isPending ? "Удаление..." : "Удалить ресторан"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Мой профиль</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="email">👤 Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        readOnly
                        className="bg-gray-50"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Email нельзя изменить
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="profileName">🧑‍💼 Имя</Label>
                      <Input
                        id="profileName"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ваше имя"
                      />
                    </div>

                    <div>
                      <Label>🔒 Пароль</Label>
                      <Button type="button" variant="outline" className="w-full mt-1">
                        Изменить пароль
                      </Button>
                      <p className="text-sm text-gray-500 mt-1">
                        Мы отправим инструкции на ваш email
                      </p>
                    </div>

                    <Separator />

                    <div className="flex justify-between">
                      <Button type="submit" variant="outline">
                        Сохранить профиль
                      </Button>
                      <Button type="button" variant="outline" onClick={logout}>
                        Выйти из аккаунта
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
