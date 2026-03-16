import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Utensils, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  onShowRegister?: () => void;
  onShowLogin?: () => void;
}

export function Header({ onShowRegister, onShowLogin }: HeaderProps) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          <div className="flex items-center">
            <Utensils className="text-primary-600 text-2xl mr-2 md:mr-3 w-5 h-5 md:w-6 md:h-6" />
            <span className="font-bold text-lg md:text-xl text-gray-900">QRMenu</span>
          </div>

          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => scrollTo('how-it-works')}
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              {t('howItWorks')}
            </button>
            <button
              onClick={() => scrollTo('examples')}
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              {t('examples')}
            </button>
            <button
              onClick={() => scrollTo('future-plans')}
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Future Plans
            </button>
            <button
              onClick={() => scrollTo('support')}
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              {t('support')}
            </button>
          </nav>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{t('hello')}, {user.name || user.email}</span>
                <Button variant="outline" onClick={logout}>
                  {t('logout')}
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" onClick={onShowLogin}>
                  {t('loginButton')}
                </Button>
                <Button onClick={onShowRegister}>
                  {t('registerButton')}
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            <button
              onClick={() => scrollTo('how-it-works')}
              className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
            >
              {t('howItWorks')}
            </button>
            <button
              onClick={() => scrollTo('examples')}
              className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
            >
              {t('examples')}
            </button>
            <button
              onClick={() => scrollTo('future-plans')}
              className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
            >
              Future Plans
            </button>
            <button
              onClick={() => scrollTo('support')}
              className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
            >
              {t('support')}
            </button>

            <div className="pt-2 border-t border-gray-100 mt-2 flex gap-2">
              {user ? (
                <div className="flex items-center justify-between w-full px-3 py-2">
                  <span className="text-gray-700 text-sm">{user.name || user.email}</span>
                  <Button variant="outline" size="sm" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                    {t('logout')}
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => { onShowLogin?.(); setMobileMenuOpen(false); }}>
                    {t('loginButton')}
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => { onShowRegister?.(); setMobileMenuOpen(false); }}>
                    {t('registerButton')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
