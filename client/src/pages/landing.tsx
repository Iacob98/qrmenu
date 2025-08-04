import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Utensils, Brain, Smartphone, Globe } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/ui/language-selector";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const handleShowRegister = () => {
    setLocation("/register");
  };

  const handleShowLogin = () => {
    setLocation("/login");
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen">
        <Header onShowRegister={handleShowRegister} onShowLogin={handleShowLogin} />
        
        {/* Hero Section */}
        <section className="hero-gradient py-20 fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                {t('heroTitle')}
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                {t('heroSubtitle')}
              </p>
              <Button 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={handleShowRegister}
              >
                {t('createMenu')}
              </Button>
            </div>
            
            <div className="mt-16 flex justify-center">
              {/* Modern smartphone mockup showing menu interface */}
              <div className="relative w-80 h-96 bg-gray-900 rounded-3xl p-2 shadow-2xl">
                <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                  <div className="bg-primary-600 text-white p-4 text-center">
                    <h3 className="font-semibold">Итальянский Ресторан</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex space-x-2">
                      <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">Супы</span>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">Горячее</span>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">Десерты</span>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-sm">Борщ украинский</h4>
                          <p className="text-gray-600 text-xs">Свекла, мясо, сметана</p>
                        </div>
                        <span className="text-primary-600 font-semibold text-sm">€5.90</span>
                      </div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-sm">Солянка мясная</h4>
                          <p className="text-gray-600 text-xs">Копчености, огурцы, лимон</p>
                        </div>
                        <span className="text-primary-600 font-semibold text-sm">€6.50</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center card-hover p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="text-primary-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('aiFeatureTitle')}</h3>
                <p className="text-gray-600">{t('aiFeatureDesc')}</p>
              </div>
              
              <div className="text-center card-hover p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="text-primary-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('convenientTitle')}</h3>
                <p className="text-gray-600">{t('convenientDesc')}</p>
              </div>
              
              <div className="text-center card-hover p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="text-primary-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('multilingualTitle')}</h3>
                <p className="text-gray-600">{t('multilingualDesc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('howItWorksTitle')}</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="bg-white rounded-xl p-8 card-hover">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">1</div>
                  <h3 className="text-xl font-semibold mb-3">{t('step1Title')}</h3>
                  <p className="text-gray-600">{t('step1Desc')}</p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-1 bg-primary-200"></div>
              </div>
              
              <div className="relative">
                <div className="bg-white rounded-xl p-8 card-hover">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">2</div>
                  <h3 className="text-xl font-semibold mb-3">{t('step2Title')}</h3>
                  <p className="text-gray-600">{t('step2Desc')}</p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-1 bg-primary-200"></div>
              </div>
              
              <div>
                <div className="bg-white rounded-xl p-8 card-hover">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">3</div>
                  <h3 className="text-xl font-semibold mb-3">{t('step3Title')}</h3>
                  <p className="text-gray-600">{t('step3Desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Examples Section */}
        <section id="examples" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('menuExamplesTitle')}</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Menu category examples */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4 text-primary-600">Горячее</h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Стейк Веллингтон</h4>
                      <span className="text-primary-600 font-semibold">€24.90</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Говядина, грибы, слоёное тесто</p>
                    <div className="flex space-x-1">
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">🌶️ Острое</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4 text-primary-600">Десерты</h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Тирамису</h4>
                      <span className="text-primary-600 font-semibold">€7.50</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Маскарпоне, кофе, какао</p>
                    <div className="flex space-x-1">
                      <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded">🥦 Вегетарианское</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4 text-primary-600">Напитки</h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Эспрессо</h4>
                      <span className="text-primary-600 font-semibold">€2.50</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Арабика, двойная экстракция</p>
                    <div className="flex space-x-1">
                      <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded">🥦 Вегетарианское</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-50">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('ctaTitle')}</h2>
            <p className="text-xl text-gray-600 mb-8">
              {t('ctaSubtitle')}
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={handleShowRegister}
            >
              {t('startNow')}
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <Utensils className="text-primary-500 text-xl mr-3" />
                  <span className="font-bold text-xl">QRMenu</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">{t('links')}</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">{t('support')}</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t('privacyPolicy')}</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">{t('language')}</h3>
                <LanguageSelector />
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">{t('currency')}</h3>
                <select className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-700">
                  <option>💶 EUR</option>
                  <option>💵 USD</option>
                  <option>🇵🇱 PLN</option>
                  <option>🇲🇩 MDL</option>
                </select>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
