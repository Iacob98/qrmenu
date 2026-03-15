import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Utensils, Brain, Smartphone, Globe, Star, Users, Clock, TrendingUp, QrCode, Zap, CheckCircle, BarChart3, Shield, ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/ui/language-selector";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleShowRegister = () => {
    setLocation("/register");
  };

  const handleShowLogin = () => {
    setLocation("/login");
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-[#FFFBF5]">
        <Header onShowRegister={handleShowRegister} onShowLogin={handleShowLogin} />

        {/* ═══════════════════════════════════════════════ */}
        {/* HERO SECTION */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="relative overflow-hidden pt-8 pb-20 lg:pt-16 lg:pb-32">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-200/40 via-orange-100/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-100/30 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              {/* Left: Copy */}
              <div className="max-w-xl">
                <div className="inline-flex items-center bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-amber-200/60">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('betaBadge')}
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight">
                  {t('heroTitle')}
                </h1>

                <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed">
                  {t('heroSubtitle')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <Button
                    size="lg"
                    className="text-base px-8 py-6 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5"
                    onClick={handleShowRegister}
                  >
                    {t('createMenuFree')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base px-8 py-6 rounded-full border-2 border-gray-300 hover:border-amber-400 hover:bg-amber-50 transition-all"
                    onClick={() => window.open('/menu/test-zbllwi', '_blank')}
                  >
                    {t('viewDemo')}
                  </Button>
                </div>

                {/* Trust indicators */}
                <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mr-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    {t('setup5min')}
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mr-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    {t('freePlan')}
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mr-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    {t('noCommitments')}
                  </div>
                </div>
              </div>

              {/* Right: Phone Mockup */}
              <div className="flex justify-center lg:justify-end" id="demo">
                <div
                  className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-gray-900/20 cursor-pointer group transition-transform duration-500 hover:scale-[1.02]"
                  onClick={() => window.open('/menu/test-zbllwi', '_blank')}
                  style={{ width: '300px', height: '620px' }}
                >
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                    <iframe
                      src="/menu/test-zbllwi"
                      className="w-full h-full border-0"
                      title="Demo Menu"
                      style={{ pointerEvents: 'none' }}
                    />
                  </div>
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900/80 text-white text-xs px-4 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    {t('viewDemo')} →
                  </div>
                  {/* Decorative glow behind phone */}
                  <div className="absolute -inset-8 bg-gradient-to-b from-amber-400/20 via-orange-300/10 to-transparent rounded-full blur-2xl -z-10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* STATS BAR */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="py-12 border-y border-amber-200/40 bg-white/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {t('betaHeroTitle')}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t('betaHeroSubtitle')}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "∞", label: t('betaStatsUnlimited'), color: "bg-amber-50 text-amber-600 border-amber-200" },
                { value: "AI", label: t('betaStatsAI'), color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
                { value: "24/7", label: t('betaStatsSupport'), color: "bg-sky-50 text-sky-600 border-sky-200" },
                { value: "FREE", label: t('betaStatsFree'), color: "bg-rose-50 text-rose-600 border-rose-200" },
              ].map((stat, i) => (
                <div key={i} className={`text-center p-6 rounded-2xl border ${stat.color} transition-transform hover:-translate-y-1`}>
                  <div className="text-3xl md:text-4xl font-extrabold mb-1">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* FEATURES — BENTO GRID */}
        {/* ═══════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                {t('betaWhyTitle')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('betaWhySubtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* AI Card — Large */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-200/50 md:row-span-1 transition-all hover:shadow-lg hover:shadow-amber-100">
                <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
                  <Brain className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{t('aiFeatureTitle')}</h3>
                <p className="text-gray-600 mb-5">{t('aiFeatureDesc')}</p>
                <ul className="space-y-2.5 text-sm text-gray-600">
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 text-amber-500 mr-2.5 mt-0.5 shrink-0" />{t('analyzePdfPhotos')}</li>
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 text-amber-500 mr-2.5 mt-0.5 shrink-0" />{t('automaticDescriptions')}</li>
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 text-amber-500 mr-2.5 mt-0.5 shrink-0" />{t('professionalDishPhotos')}</li>
                </ul>
              </div>

              {/* Mobile Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-200/50 transition-all hover:shadow-lg hover:shadow-emerald-100">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                  <Smartphone className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{t('convenientTitle')}</h3>
                <p className="text-gray-600 mb-5">{t('convenientDesc')}</p>
                <ul className="space-y-2.5 text-sm text-gray-600">
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2.5 mt-0.5 shrink-0" />{t('adaptiveDesign')}</li>
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2.5 mt-0.5 shrink-0" />{t('fastLoading')}</li>
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2.5 mt-0.5 shrink-0" />{t('convenientNavigation')}</li>
                </ul>
              </div>

              {/* Multilingual Card */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-8 border border-violet-200/50 transition-all hover:shadow-lg hover:shadow-violet-100">
                <div className="w-14 h-14 bg-violet-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/20">
                  <Globe className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{t('multilingualTitle')}</h3>
                <p className="text-gray-600 mb-5">{t('multilingualDesc')}</p>
                <ul className="space-y-2.5 text-sm text-gray-600">
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 text-violet-500 mr-2.5 mt-0.5 shrink-0" />{t('russianEnglishGerman')}</li>
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 text-violet-500 mr-2.5 mt-0.5 shrink-0" />{t('automaticDetection')}</li>
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 text-violet-500 mr-2.5 mt-0.5 shrink-0" />{t('easySwitching')}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* TOOLKIT GRID */}
        {/* ═══════════════════════════════════════════════ */}
        <section id="examples" className="py-20 bg-white rounded-t-[3rem]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                {t('fullToolkitTitle')}
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: QrCode, title: t('qrCodesLinks'), desc: t('qrCodesLinksDesc'), bg: "bg-amber-50", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
                { icon: Zap, title: t('instantUpdates'), desc: t('instantUpdatesDesc'), bg: "bg-emerald-50", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
                { icon: BarChart3, title: t('analyticsReports'), desc: t('analyticsReportsDesc'), bg: "bg-violet-50", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
                { icon: Users, title: t('teamwork'), desc: t('teamworkDesc'), bg: "bg-sky-50", iconBg: "bg-sky-100", iconColor: "text-sky-600" },
                { icon: Shield, title: "Data Security", desc: "All data is protected with encryption and regularly backed up", bg: "bg-rose-50", iconBg: "bg-rose-100", iconColor: "text-rose-600" },
                { icon: Clock, title: "24/7 Support", desc: "Our team is always ready to help you with setup and usage", bg: "bg-orange-50", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
              ].map((item, i) => (
                <div key={i} className={`${item.bg} rounded-2xl p-6 border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-md`}>
                  <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                    <item.icon className={item.iconColor} size={22} />
                  </div>
                  <h3 className="font-bold text-base mb-2 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* EARLY ACCESS */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                {t('earlyAccessTitle')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('earlyAccessSubtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Community */}
              <div className="bg-[#FFFBF5] rounded-3xl p-8 border border-amber-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-400/20">
                    <Users className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{t('betaCommunityTitle')}</h3>
                  <p className="text-gray-600 mb-5">{t('betaCommunityDesc')}</p>
                  <ul className="space-y-2.5 text-sm text-gray-600">
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-amber-500 mr-2.5 mt-0.5 shrink-0" />{t('betaDirectContactDev')}</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-amber-500 mr-2.5 mt-0.5 shrink-0" />{t('betaInfluenceProduct')}</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-amber-500 mr-2.5 mt-0.5 shrink-0" />{t('betaEarlyAccess')}</li>
                  </ul>
                </div>
              </div>

              {/* AI Tech — Featured */}
              <div className="bg-gradient-to-b from-amber-500 to-orange-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-amber-500/20">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full blur-xl" />
                <div className="relative">
                  <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold mb-5 backdrop-blur-sm">
                    Beta Program
                  </span>
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                    <Brain className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{t('betaAiTechTitle')}</h3>
                  <p className="text-white/80 mb-5">{t('betaAiTechDesc')}</p>
                  <ul className="space-y-2.5 text-sm text-white/80">
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-white/60 mr-2.5 mt-0.5 shrink-0" />{t('betaGPT4Text')}</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-white/60 mr-2.5 mt-0.5 shrink-0" />{t('betaDalleImages')}</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-white/60 mr-2.5 mt-0.5 shrink-0" />{t('betaMultilingualAI')}</li>
                  </ul>
                </div>
              </div>

              {/* Development */}
              <div className="bg-[#FFFBF5] rounded-3xl p-8 border border-amber-100 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-400/20">
                    <TrendingUp className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{t('betaDevelopmentTitle')}</h3>
                  <p className="text-gray-600 mb-5">{t('betaDevelopmentDesc')}</p>
                  <ul className="space-y-2.5 text-sm text-gray-600">
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2.5 mt-0.5 shrink-0" />{t('betaPersonalSupport')}</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2.5 mt-0.5 shrink-0" />{t('betaFastImplementation')}</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2.5 mt-0.5 shrink-0" />{t('betaUserPrivileges')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* PRICING */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="py-20 bg-[#FFFBF5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                {t('betaPricingTitle')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('betaPricingSubtitle')}
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-3xl border-2 border-amber-200 shadow-xl shadow-amber-100/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />
                <div className="absolute top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-500 text-white px-5 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                    {t('betaFooterStatus')}
                  </span>
                </div>

                <div className="pt-16 pb-10 px-8 md:px-12">
                  <div className="text-center mb-10">
                    <h3 className="text-2xl font-bold mb-4">{t('betaPricingCardTitle')}</h3>
                    <div className="mb-2">
                      <span className="text-6xl font-extrabold text-amber-500">{t('betaPricingFree')}</span>
                    </div>
                    <div className="text-gray-500">{t('betaPricingFreeDuring')}</div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full max-w-md mx-auto block mb-10 bg-amber-500 hover:bg-amber-600 text-white rounded-full py-6 text-lg shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30"
                    onClick={handleShowRegister}
                  >
                    {t('betaJoinProgram')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-sm uppercase tracking-wider text-amber-600 mb-4">{t('betaAiFeaturesTitle')}</h4>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start"><CheckCircle className="w-4 h-4 text-emerald-500 mr-3 mt-0.5 shrink-0" />{t('betaAnalyzePDF')}</li>
                        <li className="flex items-start"><CheckCircle className="w-4 h-4 text-emerald-500 mr-3 mt-0.5 shrink-0" />{t('betaGenerateDescriptions')}</li>
                        <li className="flex items-start"><CheckCircle className="w-4 h-4 text-emerald-500 mr-3 mt-0.5 shrink-0" />{t('betaCreatePhotos')}</li>
                        <li className="flex items-start"><CheckCircle className="w-4 h-4 text-emerald-500 mr-3 mt-0.5 shrink-0" />{t('betaImproveDescriptions')}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm uppercase tracking-wider text-amber-600 mb-4">{t('betaMainFeaturesTitle')}</h4>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start"><CheckCircle className="w-4 h-4 text-emerald-500 mr-3 mt-0.5 shrink-0" />{t('betaUnlimitedRestaurants')}</li>
                        <li className="flex items-start"><CheckCircle className="w-4 h-4 text-emerald-500 mr-3 mt-0.5 shrink-0" />{t('betaQrAndLinks')}</li>
                        <li className="flex items-start"><CheckCircle className="w-4 h-4 text-emerald-500 mr-3 mt-0.5 shrink-0" />{t('betaDesignCustomization')}</li>
                        <li className="flex items-start"><CheckCircle className="w-4 h-4 text-emerald-500 mr-3 mt-0.5 shrink-0" />{t('betaMultilingual')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-8">
                <p className="text-gray-500 mb-3 text-sm">{t('betaFreeAccessTitle')}</p>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-gray-400">
                  <span>✓ {t('betaRegistration30sec')}</span>
                  <span>✓ {t('betaNoHiddenFees')}</span>
                  <span>✓ {t('betaHelpDevelop')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* FUTURE PLANS */}
        {/* ═══════════════════════════════════════════════ */}
        <section id="future-plans" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                {t('futurePlans')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('futurePlansSubtitle')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: QrCode, title: t('qrStyleCustomization'), desc: t('qrStyleDesc'), color: "text-violet-600", bg: "bg-violet-100" },
                { icon: Star, title: t('reviewSystem'), desc: t('reviewSystemDesc'), color: "text-amber-600", bg: "bg-amber-100" },
                { icon: BarChart3, title: t('analytics'), desc: t('analyticsDesc'), color: "text-emerald-600", bg: "bg-emerald-100" },
                { icon: Globe, title: t('multiLocation'), desc: t('multiLocationDesc'), color: "text-sky-600", bg: "bg-sky-100" },
                { icon: Globe, title: t('menuTranslation'), desc: t('menuTranslationDesc'), color: "text-orange-600", bg: "bg-orange-100" },
                { icon: TrendingUp, title: t('moreComing'), desc: t('moreComingDesc'), color: "text-rose-600", bg: "bg-rose-100" },
              ].map((item, i) => (
                <div key={i} className="bg-[#FFFBF5] rounded-2xl p-6 border border-gray-100 hover:border-amber-200 transition-all hover:-translate-y-1 hover:shadow-md">
                  <div className={`w-11 h-11 ${item.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <item.icon className={item.color} size={20} />
                  </div>
                  <h3 className="font-bold text-base mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* FAQ */}
        {/* ═══════════════════════════════════════════════ */}
        <section id="support" className="py-20 bg-[#FFFBF5]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                {t('faqTitle')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('faqSubtitle')}
              </p>
            </div>

            <div className="space-y-3">
              {[
                { q: t('faqHowFast'), a: t('faqHowFastAnswer') },
                { q: t('faqNeedApp'), a: t('faqNeedAppAnswer') },
                { q: t('faqCustomizeDesign'), a: t('faqCustomizeDesignAnswer') },
                { q: t('faqFreeLimits'), a: t('faqFreeLimitsAnswer') },
                { q: t('faqLanguages'), a: t('faqLanguagesAnswer') },
                { q: t('faqDataSecurity'), a: t('faqDataSecurityAnswer') },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all hover:border-amber-200"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ${openFaq === i ? 'max-h-96 pb-6' : 'max-h-0'}`}>
                    <p className="px-6 text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* FINAL CTA */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="py-20 lg:py-28 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
          </div>
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
              {t('betaCtaTitle')}
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-white/85 max-w-2xl mx-auto">
              {t('betaCtaSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                className="text-base px-10 py-6 bg-white text-amber-600 hover:bg-gray-50 rounded-full shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5 font-bold"
                onClick={handleShowRegister}
              >
                {t('createMenuFree')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-10 py-6 rounded-full !border-2 !border-white/40 !text-white !bg-white/10 hover:!bg-white/20 backdrop-blur-sm transition-all"
                onClick={() => window.open('/menu/test-zbllwi', '_blank')}
              >
                {t('viewDemo')}
              </Button>
            </div>

            <div className="text-sm text-white/60">
              ✓ {t('setup5minCommit')} · ✓ {t('noLongTermCommitments')} · ✓ {t('support24_7')}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* FOOTER */}
        {/* ═══════════════════════════════════════════════ */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center mb-6">
                  <Utensils className="text-amber-400 text-2xl mr-3" />
                  <span className="font-bold text-2xl">QRMenu</span>
                </div>
                <p className="text-gray-400 mb-6 max-w-md">
                  {t('footerDescription')}
                </p>
                <div className="text-sm text-gray-500">
                  <p className="mb-2">{t('copyright')}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span>{t('betaFooterStatus')}</span>
                    <span>{t('betaFooterPowered')}</span>
                    <span>{t('betaFooterMade')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">{t('product')}</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">{t('features')}</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t('pricing')}</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t('api')}</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t('integrations')}</a></li>
                </ul>

                <h3 className="font-semibold mb-4 mt-8">{t('support')}</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#support" className="hover:text-white transition-colors">{t('helpCenter')}</a></li>
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
                    <select className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 w-full text-sm">
                      <option>EUR - Euro</option>
                      <option>USD - Dollar</option>
                      <option>PLN - Zloty</option>
                      <option>MDL - Leu</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-800">
                  <p className="text-sm text-gray-400 mb-2">{t('legalInfo')}</p>
                  <div className="space-y-2 text-sm">
                    <a href="/privacy" className="block text-gray-400 hover:text-white transition-colors">{t('privacyPolicy')}</a>
                    <a href="/terms" className="block text-gray-400 hover:text-white transition-colors">{t('termsOfUse')}</a>
                    <a href="/privacy#cookies" className="block text-gray-400 hover:text-white transition-colors">{t('cookieFiles')}</a>
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
