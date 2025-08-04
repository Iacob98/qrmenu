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
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/ui/language-selector";

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
  const { t } = useTranslation();

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
        title: t('success'),
        description: t('restaurantCreated'),
      });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStepOne = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t('error'),
        description: t('passwordMismatch'),
        variant: "destructive",
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: t('error'), 
        description: t('termsRequired'),
        variant: "destructive",
      });
      return;
    }

    try {
      await register(formData.email, formData.password);
      setStep(2);
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStepTwo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.restaurantName.trim()) {
      toast({
        title: t('error'),
        description: t('restaurantNameRequired'),
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
              ← {t('backToMain')}
            </Button>
          </div>

          {step === 1 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  {t('createAccountTitle')}
                </CardTitle>
                <p className="text-center text-gray-600 text-sm">
                  {t('createAccountSubtitle')}
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStepOne} className="space-y-4">
                  <div>
                    <Label htmlFor="email">📧 {t('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder={t('emailPlaceholder')}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">🔒 {t('password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder={t('passwordMinLength')}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">🔒 {t('confirmPassword')}</Label>
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
                      {t('acceptTerms')}
                    </Label>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    {t('continue')} →
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">{t('restaurantInfo')}</CardTitle>
                <p className="text-center text-gray-600 text-sm">
                  {t('restaurantInfoSubtitle')}
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStepTwo} className="space-y-4">
                  <div>
                    <Label htmlFor="restaurantName">🏠 {t('restaurantName')}</Label>
                    <Input
                      id="restaurantName"
                      value={formData.restaurantName}
                      onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
                      placeholder={t('restaurantNamePlaceholder')}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="city">🌍 {t('city')}</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder={t('cityPlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">📞 {t('phoneOptional')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder={t('phonePlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currency">💱 {t('currency')}</Label>
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
                    <Label htmlFor="aiToken">🧠 {t('aiTokenOptional')}</Label>
                    <Input
                      id="aiToken"
                      value={formData.aiToken}
                      onChange={(e) => setFormData(prev => ({ ...prev, aiToken: e.target.value }))}
                      placeholder={t('aiTokenPlaceholder')}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {t('aiTokenDescription')}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      {t('back')}
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createRestaurantMutation.isPending}
                      className="flex-1"
                    >
                      {createRestaurantMutation.isPending ? t('creating') : t('completeRegistration')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          
          {/* Language Selector at Bottom */}
          <div className="mt-8 flex justify-center">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
