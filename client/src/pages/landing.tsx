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
                {t('betaBadge')}
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
                  {t('createMenuFree')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 !border-white !text-white !bg-transparent hover:!bg-white hover:!text-blue-600"
                  onClick={() => window.open('/menu/test-zbllwi', '_blank')}
                >
                  {t('viewDemo')}
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex justify-center items-center space-x-8 text-sm text-gray-600 mb-12">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  {t('setup5min')}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  {t('freePlan')}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  {t('noCommitments')}
                </div>
              </div>
            </div>
            
            <div className="mt-16 flex justify-center" id="demo">
              {/* Modern smartphone mockup showing menu interface */}
              <div className="relative w-80 h-96 bg-gray-900 rounded-3xl p-2 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 text-center">
                    <h3 className="font-semibold">{t('italianRestaurant')}</h3>
                    <p className="text-xs opacity-90">{t('scanQrForMenu')}</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex space-x-2">
                      <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">{t('soups')}</span>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">{t('hotDishes')}</span>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">{t('desserts')}</span>
                    </div>
                    <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-sm">{t('ukrainianBorscht')}</h4>
                          <p className="text-gray-600 text-xs">{t('beetMeatSourCream')}</p>
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
                          <h4 className="font-semibold text-sm">{t('meatSolyanka')}</h4>
                          <p className="text-gray-600 text-xs">{t('smokedMeatPicklesLemon')}</p>
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
                {t('betaHeroTitle')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('betaHeroSubtitle')}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">∞</div>
                <div className="text-gray-600">{t('betaStatsUnlimited')}</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-green-600">AI</div>
                <div className="text-gray-600">{t('betaStatsAI')}</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-purple-600">24/7</div>
                <div className="text-gray-600">{t('betaStatsSupport')}</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">FREE</div>
                <div className="text-gray-600">{t('betaStatsFree')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('betaWhyTitle')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('betaWhySubtitle')}
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
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />{t('analyzePdfPhotos')}</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />{t('automaticDescriptions')}</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />{t('professionalDishPhotos')}</li>
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
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />{t('adaptiveDesign')}</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />{t('fastLoading')}</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />{t('convenientNavigation')}</li>
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
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />{t('russianEnglishGerman')}</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />{t('automaticDetection')}</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />{t('easySwitching')}</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="examples" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('fullToolkitTitle')}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex items-start p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <QrCode className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t('qrCodesLinks')}</h3>
                  <p className="text-gray-600 text-sm">{t('qrCodesLinksDesc')}</p>
                </div>
              </div>
              
              <div className="flex items-start p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Zap className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t('instantUpdates')}</h3>
                  <p className="text-gray-600 text-sm">{t('instantUpdatesDesc')}</p>
                </div>
              </div>
              
              <div className="flex items-start p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <BarChart3 className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t('analyticsReports')}</h3>
                  <p className="text-gray-600 text-sm">{t('analyticsReportsDesc')}</p>
                </div>
              </div>
              
              <div className="flex items-start p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <Users className="text-orange-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t('teamwork')}</h3>
                  <p className="text-gray-600 text-sm">{t('teamworkDesc')}</p>
                </div>
              </div>
              
              <div className="flex items-start p-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <Shield className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Data Security</h3>
                  <p className="text-gray-600 text-sm">All data is protected with encryption and regularly backed up</p>
                </div>
              </div>
              
              <div className="flex items-start p-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                  <Clock className="text-indigo-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">24/7 Support</h3>
                  <p className="text-gray-600 text-sm">Our team is always ready to help you with setup and usage</p>
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
                {t('earlyAccessTitle')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('earlyAccessSubtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-center">{t('betaCommunityTitle')}</h3>
                  <p className="text-gray-600 text-center mb-4">
                    {t('betaCommunityDesc')}
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />{t('betaDirectContactDev')}</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />{t('betaInfluenceProduct')}</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />{t('betaEarlyAccess')}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="p-8 border-0 shadow-lg border-2 border-blue-500 relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Beta Program
                  </span>
                </div>
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Brain className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-center">{t('betaAiTechTitle')}</h3>
                  <p className="text-gray-600 text-center mb-4">
                    {t('betaAiTechDesc')}
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />{t('betaGPT4Text')}</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />{t('betaDalleImages')}</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />{t('betaMultilingualAI')}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="p-8 border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-center">{t('betaDevelopmentTitle')}</h3>
                  <p className="text-gray-600 text-center mb-4">
                    {t('betaDevelopmentDesc')}
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />{t('betaPersonalSupport')}</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />{t('betaFastImplementation')}</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />{t('betaUserPrivileges')}</li>
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
                {t('betaPricingTitle')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('betaPricingSubtitle')}
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              {/* Beta Plan - Single centered card */}
              <Card className="border-2 border-gradient-to-r from-blue-500 to-purple-600 shadow-2xl relative p-12 bg-gradient-to-b from-blue-50 via-white to-purple-50">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                    {t('betaFooterStatus')}
                  </span>
                </div>
                <CardContent className="pt-8">
                  <div className="text-center">
                    <h3 className="text-3xl font-bold mb-4">{t('betaPricingCardTitle')}</h3>
                    <div className="mb-8">
                      <span className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('betaPricingFree')}</span>
                      <div className="text-gray-600 text-lg mt-2">{t('betaPricingFreeDuring')}</div>
                    </div>
                    <Button 
                      size="lg"
                      className="w-full max-w-md mb-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg py-6"
                      onClick={handleShowRegister}
                    >
                      {t('betaJoinProgram')}
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8 mt-8">
                    <div>
                      <h4 className="font-semibold text-lg mb-4 text-center">{t('betaAiFeaturesTitle')}</h4>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5" />
                          {t('betaAnalyzePDF')}
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5" />
                          {t('betaGenerateDescriptions')}
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5" />
                          {t('betaCreatePhotos')}
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5" />
                          {t('betaImproveDescriptions')}
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-4 text-center">{t('betaMainFeaturesTitle')}</h4>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5" />
                          {t('betaUnlimitedRestaurants')}
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5" />
                          {t('betaQrAndLinks')}
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5" />
                          {t('betaDesignCustomization')}
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5" />
                          {t('betaMultilingual')}
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">{t('betaFreeAccessTitle')}</p>
              <div className="flex justify-center space-x-8 text-sm text-gray-500">
                <span>✓ {t('betaRegistration30sec')}</span>
                <span>✓ {t('betaNoHiddenFees')}</span>
                <span>✓ {t('betaHelpDevelop')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Future Plans Section */}
        <section id="future-plans" className="py-20 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('futurePlans')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('futurePlansSubtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6 border-0 shadow-lg">
                <CardContent className="pt-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="text-purple-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{t('qrStyleCustomization')}</h3>
                  <p className="text-gray-600 text-sm">{t('qrStyleDesc')}</p>
                </CardContent>
              </Card>

              <Card className="p-6 border-0 shadow-lg">
                <CardContent className="pt-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Star className="text-green-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{t('reviewSystem')}</h3>
                  <p className="text-gray-600 text-sm">{t('reviewSystemDesc')}</p>
                </CardContent>
              </Card>

              <Card className="p-6 border-0 shadow-lg">
                <CardContent className="pt-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="text-orange-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{t('analytics')}</h3>
                  <p className="text-gray-600 text-sm">{t('analyticsDesc')}</p>
                </CardContent>
              </Card>

              <Card className="p-6 border-0 shadow-lg">
                <CardContent className="pt-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Globe className="text-blue-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{t('multiLocation')}</h3>
                  <p className="text-gray-600 text-sm">{t('multiLocationDesc')}</p>
                </CardContent>
              </Card>

              <Card className="p-6 border-0 shadow-lg">
                <CardContent className="pt-0">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <Globe className="text-indigo-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{t('menuTranslation')}</h3>
                  <p className="text-gray-600 text-sm">{t('menuTranslationDesc')}</p>
                </CardContent>
              </Card>

              <Card className="p-6 border-0 shadow-lg">
                <CardContent className="pt-0">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="text-red-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">🚀 {t('moreComing')}</h3>
                  <p className="text-gray-600 text-sm">{t('moreComingDesc')}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="support" className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('faqTitle')}
              </h2>
              <p className="text-xl text-gray-600">
                {t('faqSubtitle')}
              </p>
            </div>
            
            <div className="space-y-6">
              <Card className="p-6">
                <CardContent className="pt-0">
                  <h3 className="font-semibold text-lg mb-3">{t('faqHowFast')}</h3>
                  <p className="text-gray-600">
                    {t('faqHowFastAnswer')}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="pt-0">
                  <h3 className="font-semibold text-lg mb-3">{t('faqNeedApp')}</h3>
                  <p className="text-gray-600">
                    {t('faqNeedAppAnswer')}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="pt-0">
                  <h3 className="font-semibold text-lg mb-3">{t('faqCustomizeDesign')}</h3>
                  <p className="text-gray-600">
                    {t('faqCustomizeDesignAnswer')}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="pt-0">
                  <h3 className="font-semibold text-lg mb-3">{t('faqFreeLimits')}</h3>
                  <p className="text-gray-600">
                    {t('faqFreeLimitsAnswer')}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="pt-0">
                  <h3 className="font-semibold text-lg mb-3">{t('faqLanguages')}</h3>
                  <p className="text-gray-600">
                    {t('faqLanguagesAnswer')}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="p-6">
                <CardContent className="pt-0">
                  <h3 className="font-semibold text-lg mb-3">{t('faqDataSecurity')}</h3>
                  <p className="text-gray-600">
                    {t('faqDataSecurityAnswer')}
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
              {t('betaCtaTitle')}
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {t('betaCtaSubtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100"
                onClick={handleShowRegister}
              >
                {t('createMenuFree')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 !border-white !text-white !bg-transparent hover:!bg-white hover:!text-blue-600"
                onClick={() => window.open('/menu/test-zbllwi', '_blank')}
              >
                {t('viewDemo')}
              </Button>
            </div>
            
            <div className="text-sm opacity-75">
              ✓ {t('setup5minCommit')} • ✓ {t('noLongTermCommitments')} • ✓ {t('support24_7')}
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
                  {t('footerDescription')}
                </p>
                <div className="text-sm text-gray-500">
                  <p className="mb-2">{t('copyright')}</p>
                  <div className="flex space-x-4">
                    <span>{t('betaFooterStatus')}</span>
                    <span>{t('betaFooterPowered')}</span>
                    <span>{t('betaFooterMade')}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">{t('product')}</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">{t('features')}</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t('pricing')}</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t('api')}</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t('integrations')}</a></li>
                </ul>
                
                <h3 className="font-semibold mb-4 mt-8">{t('support')}</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">{t('helpCenter')}</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t('contactUs')}</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t('systemStatus')}</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">{t('settingsFooter')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('language')}</label>
                    <LanguageSelector />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('currency')}</label>
                    <select className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 w-full">
                      <option>💶 EUR - Euro</option>
                      <option>💵 USD - Dollar</option>
                      <option>🇵🇱 PLN - Złoty</option>
                      <option>🇲🇩 MDL - Leu</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-800">
                  <p className="text-sm text-gray-400 mb-2">{t('legalInfo')}</p>
                  <div className="space-y-2 text-sm">
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">{t('privacyPolicy')}</a>
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">{t('termsOfUse')}</a>
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">{t('cookieFiles')}</a>
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
