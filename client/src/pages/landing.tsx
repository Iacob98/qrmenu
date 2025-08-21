import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Utensils, Brain, Smartphone, Globe, Star, Users, Clock, TrendingUp, QrCode, Zap, CheckCircle, BarChart3, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/ui/language-selector";
import { Card, CardContent } from "@/components/ui/card";

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
        <section className="hero-gradient py-20 fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 z-0"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <Zap className="w-4 h-4 mr-2" />
                Открытая бета-версия - Присоединяйтесь первыми!
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                {t('heroTitle')}
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                {t('heroSubtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-4"
                  onClick={handleShowRegister}
                >
                  {t('createMenu')} - Бесплатно
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-4"
                  onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Посмотреть демо
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex justify-center items-center space-x-8 text-sm text-gray-600 mb-12">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Создание за 5 минут
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Бесплатный план
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Без обязательств
                </div>
              </div>
            </div>
            
            <div className="mt-16 flex justify-center" id="demo">
              {/* Modern smartphone mockup showing menu interface */}
              <div className="relative w-80 h-96 bg-gray-900 rounded-3xl p-2 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 text-center">
                    <h3 className="font-semibold">Итальянский Ресторан</h3>
                    <p className="text-xs opacity-90">Просканируйте QR код для меню</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex space-x-2">
                      <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">Супы</span>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">Горячее</span>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">Десерты</span>
                    </div>
                    <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-sm">Борщ украинский</h4>
                          <p className="text-gray-600 text-xs">Свекла, мясо, сметана</p>
                          <div className="flex mt-1">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                        <span className="text-primary-600 font-semibold text-sm">€5.90</span>
                      </div>
                    </div>
                    <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-sm">Солянка мясная</h4>
                          <p className="text-gray-600 text-xs">Копчености, огурцы, лимон</p>
                          <div className="flex mt-1">
                            {[1,2,3,4].map(i => (
                              <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                            ))}
                            <Star className="w-3 h-3 text-gray-300" />
                          </div>
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

        {/* Beta Features Section */}
        <section className="py-16 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Инновационная платформа в открытой бета-версии
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Будьте среди первых, кто попробует революционный подход к созданию цифровых меню с помощью ИИ
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">∞</div>
                <div className="text-gray-600">Неограниченные возможности</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-green-600">AI</div>
                <div className="text-gray-600">Мощь искусственного интеллекта</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-purple-600">24/7</div>
                <div className="text-gray-600">Поддержка разработчиков</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">FREE</div>
                <div className="text-gray-600">Бесплатно в бета-версии</div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Почему стоит попробовать QRMenu уже сегодня?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Первая в своем роде платформа с полным циклом ИИ для ресторанного бизнеса
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center card-hover p-8 border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Brain className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{t('aiFeatureTitle')}</h3>
                  <p className="text-gray-600 mb-4">{t('aiFeatureDesc')}</p>
                  <ul className="text-sm text-gray-600 text-left space-y-2">
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />Анализ PDF и фотографий меню</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />Автоматическое создание описаний</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />Профессиональные фото блюд</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="text-center card-hover p-8 border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Smartphone className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{t('convenientTitle')}</h3>
                  <p className="text-gray-600 mb-4">{t('convenientDesc')}</p>
                  <ul className="text-sm text-gray-600 text-left space-y-2">
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />Адаптивный дизайн</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />Быстрая загрузка</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />Удобная навигация</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="text-center card-hover p-8 border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Globe className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{t('multilingualTitle')}</h3>
                  <p className="text-gray-600 mb-4">{t('multilingualDesc')}</p>
                  <ul className="text-sm text-gray-600 text-left space-y-2">
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />Русский, английский, немецкий</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />Автоматическое определение</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />Легкое переключение</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Полный набор инструментов для современного ресторана
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex items-start p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <QrCode className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">QR-коды и ссылки</h3>
                  <p className="text-gray-600 text-sm">Создавайте стильные QR-коды и публичные ссылки для мгновенного доступа к меню</p>
                </div>
              </div>
              
              <div className="flex items-start p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Zap className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Мгновенные обновления</h3>
                  <p className="text-gray-600 text-sm">Изменения в меню отображаются у гостей в реальном времени без перепечатки</p>
                </div>
              </div>
              
              <div className="flex items-start p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <BarChart3 className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Аналитика и отчеты</h3>
                  <p className="text-gray-600 text-sm">Отслеживайте популярные блюда, время просмотра и другие важные метрики</p>
                </div>
              </div>
              
              <div className="flex items-start p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <Users className="text-orange-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Командная работа</h3>
                  <p className="text-gray-600 text-sm">Приглашайте сотрудников для совместного управления меню и заказами</p>
                </div>
              </div>
              
              <div className="flex items-start p-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <Shield className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Безопасность данных</h3>
                  <p className="text-gray-600 text-sm">Все данные защищены шифрованием и регулярно резервируются</p>
                </div>
              </div>
              
              <div className="flex items-start p-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                  <Clock className="text-indigo-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">24/7 Поддержка</h3>
                  <p className="text-gray-600 text-sm">Наша команда всегда готова помочь вам в настройке и использовании</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Early Access Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ранний доступ к инновациям
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Присоединяйтесь к открытой бета-версии и помогите нам создать лучшую платформу
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-center">Сообщество бета-тестеров</h3>
                  <p className="text-gray-600 text-center mb-4">
                    Станьте частью эксклюзивного сообщества рестораторов, тестирующих новые возможности первыми
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />Прямая связь с разработчиками</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />Влияние на развитие продукта</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />Ранний доступ к новинкам</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="p-8 border-0 shadow-lg border-2 border-blue-500 relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Бета-программа
                  </span>
                </div>
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Brain className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-center">Передовые ИИ-технологии</h3>
                  <p className="text-gray-600 text-center mb-4">
                    Попробуйте самые современные алгоритмы анализа меню и генерации контента
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />GPT-4 для анализа текста</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />DALL-E для генерации изображений</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />Мультиязычный ИИ-переводчик</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="p-8 border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-center">Развитие вместе с вами</h3>
                  <p className="text-gray-600 text-center mb-4">
                    Ваши отзывы и предложения напрямую влияют на roadmap разработки платформы
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />Персональная поддержка</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />Быстрая реализация идей</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />Привилегии для beta-пользователей</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Открытая бета-версия - Бесплатно для всех!
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Пользуйтесь всеми возможностями бесплатно во время бета-тестирования
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              {/* Beta Plan - Single centered card */}
              <Card className="border-2 border-gradient-to-r from-blue-500 to-purple-600 shadow-2xl relative p-12 bg-gradient-to-b from-blue-50 via-white to-purple-50">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                    🚀 Открытая Бета-версия
                  </span>
                </div>
                <CardContent className="pt-8">
                  <div className="text-center">
                    <h3 className="text-3xl font-bold mb-4">Полный доступ ко всем возможностям</h3>
                    <div className="mb-8">
                      <span className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">БЕСПЛАТНО</span>
                      <div className="text-gray-600 text-lg mt-2">во время бета-тестирования</div>
                    </div>
                    <Button 
                      size="lg"
                      className="w-full max-w-md mb-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg py-6"
                      onClick={handleShowRegister}
                    >
                      Присоединиться к бета-программе
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8 mt-8">
                    <div>
                      <h4 className="font-semibold text-lg mb-4 text-center">🤖 ИИ-возможности</h4>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5" />
                          Анализ PDF и фото меню с помощью ИИ
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5" />
                          Автоматическая генерация описаний блюд
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5" />
                          Создание фотографий блюд через DALL-E
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5" />
                          Улучшение описаний на разных языках
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-4 text-center">⚡ Основные функции</h4>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5" />
                          Неограниченное количество ресторанов и блюд
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5" />
                          QR-коды и публичные ссылки на меню
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5" />
                          Полная кастомизация дизайна
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5" />
                          Многоязычная поддержка (RU/EN/DE)
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">Бесплатный доступ ко всем функциям во время бета-тестирования</p>
              <div className="flex justify-center space-x-8 text-sm text-gray-500">
                <span>✓ Регистрация за 30 секунд</span>
                <span>✓ Никаких скрытых платежей</span>
                <span>✓ Помогаем развивать продукт</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Часто задаваемые вопросы
              </h2>
              <p className="text-xl text-gray-600">
                Ответы на самые популярные вопросы о QRMenu
              </p>
            </div>
            
            <div className="space-y-6">
              <Card className="p-6">
                <CardContent className="pt-0">
                  <h3 className="font-semibold text-lg mb-3">Как быстро я могу создать меню?</h3>
                  <p className="text-gray-600">
                    С QRMenu вы можете создать полноценное цифровое меню за 5-10 минут. Загрузите PDF или фотографии существующего меню, и наш ИИ автоматически извлечет всю информацию о блюдах, ценах и описаниях.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="pt-0">
                  <h3 className="font-semibold text-lg mb-3">Нужно ли устанавливать приложение?</h3>
                  <p className="text-gray-600">
                    Нет! QRMenu работает через обычный веб-браузер. Ваши гости просто сканируют QR-код и мгновенно видят меню на своих телефонах без установки каких-либо приложений.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="pt-0">
                  <h3 className="font-semibold text-lg mb-3">Можно ли изменить дизайн меню?</h3>
                  <p className="text-gray-600">
                    Да! У нас есть множество готовых тем и возможность полной кастомизации цветов, шрифтов и макета. Вы также можете добавить логотип вашего ресторана и фоновые изображения.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="pt-0">
                  <h3 className="font-semibold text-lg mb-3">Есть ли ограничения в бесплатном плане?</h3>
                  <p className="text-gray-600">
                    Бесплатный план включает 1 ресторан и до 50 блюд. Этого достаточно для небольших заведений. При необходимости всегда можно перейти на платный план с расширенными возможностями.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="pt-0">
                  <h3 className="font-semibold text-lg mb-3">Какие языки поддерживает платформа?</h3>
                  <p className="text-gray-600">
                    QRMenu поддерживает русский, английский и немецкий языки. Интерфейс автоматически определяет язык браузера посетителя, а вы можете создать меню на любом из поддерживаемых языков.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="p-6">
                <CardContent className="pt-0">
                  <h3 className="font-semibold text-lg mb-3">Безопасны ли мои данные?</h3>
                  <p className="text-gray-600">
                    Абсолютно! Все данные шифруются и хранятся на защищенных серверах. Мы регулярно создаем резервные копии и соблюдаем все стандарты безопасности. Ваша информация никогда не передается третьим лицам.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA Before Footer */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Готовы создать меню будущего?
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Станьте одними из первых, кто попробует революционную платформу
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100"
                onClick={handleShowRegister}
              >
                Создать меню бесплатно
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Посмотреть демо
              </Button>
            </div>
            
            <div className="text-sm opacity-75">
              ✓ Настройка за 5 минут • ✓ Без долгосрочных обязательств • ✓ Поддержка 24/7
            </div>
          </div>
        </section>



        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center mb-6">
                  <Utensils className="text-primary-500 text-2xl mr-3" />
                  <span className="font-bold text-2xl">QRMenu</span>
                </div>
                <p className="text-gray-400 mb-6 max-w-md">
                  Современная платформа для создания цифровых меню с искусственным интеллектом. 
                  Помогаем ресторанам по всему миру создавать красивые и функциональные меню за минуты.
                </p>
                <div className="text-sm text-gray-500">
                  <p className="mb-2">© 2024 QRMenu. Все права защищены.</p>
                  <div className="flex space-x-4">
                    <span>🚀 Открытая бета-версия</span>
                    <span>🤖 Powered by AI</span>
                    <span>⚡ Made with ❤️</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Продукт</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Возможности</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Цены</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Интеграции</a></li>
                </ul>
                
                <h3 className="font-semibold mb-4 mt-8">Поддержка</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Центр помощи</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Связаться с нами</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Статус системы</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Настройки</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Язык</label>
                    <LanguageSelector />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Валюта</label>
                    <select className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 w-full">
                      <option>💶 EUR - Euro</option>
                      <option>💵 USD - Dollar</option>
                      <option>🇵🇱 PLN - Złoty</option>
                      <option>🇲🇩 MDL - Leu</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-800">
                  <p className="text-sm text-gray-400 mb-2">Юридическая информация</p>
                  <div className="space-y-2 text-sm">
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">Политика конфиденциальности</a>
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">Условия использования</a>
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">Cookie-файлы</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
