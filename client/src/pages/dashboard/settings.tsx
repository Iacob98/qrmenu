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
import { Copy, Check, AlertTriangle, Upload, X, Image, Loader2 } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { useTranslation } from "react-i18next";
import type { Restaurant } from "@shared/schema";

export default function Settings() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [restaurantForm, setRestaurantForm] = useState({
    name: "",
    city: "",
    phone: "",
    currency: "EUR",
    language: "en",
    aiProvider: "openrouter",
    aiToken: "",
    aiModel: "anthropic/claude-3.5-sonnet",
    logo: "",
    banner: "",
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
  const { t } = useTranslation();

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
        language: restaurant.language || "en",
        aiProvider: "openrouter", // Fixed to OpenRouter
        aiToken: restaurant.aiToken || "",
        aiModel: restaurant.aiModel || "anthropic/claude-3.5-sonnet", // Default Claude model
        logo: restaurant.logo || "",
        banner: restaurant.banner || "",
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
        title: "Successfully updated",
        description: "Restaurant settings saved",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
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
        title: "Restaurant deleted",
        description: "Restaurant and all its data have been deleted",
      });
      setSelectedRestaurant("");
    },
    onError: (error) => {
      toast({
        title: "Error",
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
      title: "Feature in development",
      description: "Profile update will be available in the next version",
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
      title: "Link copied",
      description: "Public menu link copied to clipboard",
    });
  };



  const checkAiToken = async () => {
    setAiTokenStatus('checking');
    try {
      const response = await apiRequest("POST", "/api/ai/test-global-token", {
        model: restaurantForm.aiModel || "anthropic/claude-3.5-sonnet"
      });
      
      const result = await response.json();
      
      setAiTokenStatus('valid');
      toast({
        title: "AI работает",
        description: `OpenRouter API активен (модель: ${result.model})`,
      });
    } catch (error) {
      setAiTokenStatus('invalid');
      toast({
        title: "AI недоступен", 
        description: "Проблема с глобальными токенами",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRestaurant = () => {
    if (!confirm("Are you sure you want to delete the restaurant? This action cannot be undone.")) {
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
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 lg:ml-0 w-full">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 lg:px-6 py-4">
            <div className="pl-16 lg:pl-0"> {/* Space for mobile menu button */}
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t('settingsTitle')}</h1>
              <p className="text-gray-600">{t('restaurantSettings')}</p>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          <Tabs defaultValue="restaurant" className="space-y-6">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="restaurant" className="flex-1 sm:flex-none">{t('restaurantSettings')}</TabsTrigger>
              <TabsTrigger value="profile" className="flex-1 sm:flex-none">{t('profileSettings')}</TabsTrigger>
            </TabsList>

            <TabsContent value="restaurant" className="space-y-6">
              {!restaurant ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-600">{t('selectRestaurant')}</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Basic Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('restaurantSettings')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleRestaurantSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">🏠 {t('restaurantNameSetting')}</Label>
                            <Input
                              id="name"
                              value={restaurantForm.name}
                              onChange={(e) => setRestaurantForm(prev => ({ ...prev, name: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="city">🌍 {t('citySetting')}</Label>
                            <Input
                              id="city"
                              value={restaurantForm.city}
                              onChange={(e) => setRestaurantForm(prev => ({ ...prev, city: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="phone">📞 {t('phoneSetting')}</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={restaurantForm.phone}
                            onChange={(e) => setRestaurantForm(prev => ({ ...prev, phone: e.target.value }))}
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            {t('displayedInMenuFooter')}
                          </p>
                        </div>



                        <Button 
                          type="submit" 
                          disabled={updateRestaurantMutation.isPending}
                        >
                          {updateRestaurantMutation.isPending ? t('validating') : t('saveChanges')}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Visual Branding */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('logo')} и {t('banner')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Logo Section */}
                      <div>
                        <FileUpload
                          label={`🏷️ ${t('logo')}`}
                          value={restaurantForm.logo}
                          onChange={(url) => setRestaurantForm(prev => ({ ...prev, logo: url }))}
                          endpoint="logo"
                          width={150}
                          height={150}
                          maxSize={5}
                          hideUrlInput={true}
                        />
                      </div>

                      {/* Banner Section */}
                      <div>
                        <FileUpload
                          label={`🖼️ ${t('banner')}`}
                          value={restaurantForm.banner}
                          onChange={(url) => setRestaurantForm(prev => ({ ...prev, banner: url }))}
                          endpoint="banner"
                          width={400}
                          height={150}
                          maxSize={8}
                          hideUrlInput={true}
                        />
                      </div>
                      
                      <Button 
                        type="button"
                        onClick={() => updateRestaurantMutation.mutate(restaurantForm)}
                        disabled={updateRestaurantMutation.isPending}
                        className="w-full mt-4"
                      >
                        {updateRestaurantMutation.isPending ? t('validating') : t('saveChanges')}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* AI Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>🤖 AI {t('settings')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <span className="text-green-600 text-xl">✅</span>
                        <div>
                          <p className="text-green-700 font-medium">AI токен активен</p>
                          <p className="text-sm text-green-600">Используется глобальный токен OpenRouter/Claude 3.5 Sonnet</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="aiModel">🧠 AI Model</Label>
                        <Select
                          value={restaurantForm.aiModel}
                          onValueChange={(value) => setRestaurantForm(prev => ({ ...prev, aiModel: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Default)</SelectItem>
                            <SelectItem value="anthropic/claude-3-haiku">Claude 3 Haiku (Fast)</SelectItem>
                            <SelectItem value="openai/gpt-4">GPT-4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        type="button"
                        onClick={checkAiToken}
                        variant="outline"
                        disabled={aiTokenStatus === 'checking'}
                        className="w-full"
                      >
                        {aiTokenStatus === 'checking' ? (
                          <>
                            <Loader2 className="mr-2 animate-spin" size={16} />
                            Проверка токена...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2" size={16} />
                            Тестировать AI
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        type="button"
                        onClick={() => updateRestaurantMutation.mutate(restaurantForm)}
                        disabled={updateRestaurantMutation.isPending}
                        className="w-full"
                      >
                        {updateRestaurantMutation.isPending ? t('saving') : t('saveChanges')}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Currency and Language */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('currencySetting')} и {t('languageSetting')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="currency">💱 {t('currencySetting')}</Label>
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
                          <Label htmlFor="language">🌐 {t('languageSetting')}</Label>
                          <Select
                            value={restaurantForm.language}
                            onValueChange={(value) => setRestaurantForm(prev => ({ ...prev, language: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">🇺🇸 English</SelectItem>
                              <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {t('displayMenuParams')}
                      </p>
                      
                      <Button 
                        type="button"
                        onClick={() => updateRestaurantMutation.mutate(restaurantForm)}
                        disabled={updateRestaurantMutation.isPending}
                        className="w-full mt-4"
                      >
                        {updateRestaurantMutation.isPending ? t('saving') : t('saveChanges')}
                      </Button>
                    </CardContent>
                  </Card>




                </>
              )}
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('myProfile')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="email">👤 {t('email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        readOnly
                        className="bg-gray-50"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {t('emailCannotChange')}
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="profileName">🧑‍💼 {t('name')}</Label>
                      <Input
                        id="profileName"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={t('yourName')}
                      />
                    </div>

                    <div>
                      <Label>🔒 {t('password')}</Label>
                      <Button type="button" variant="outline" className="w-full mt-1">
                        {t('changePassword')}
                      </Button>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('emailInstructions')}
                      </p>
                    </div>

                    <Separator />

                    <div className="flex justify-between">
                      <Button type="submit" variant="outline">
                        {t('saveProfile')}
                      </Button>
                      <Button type="button" variant="outline" onClick={logout}>
                        {t('logOut')}
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
