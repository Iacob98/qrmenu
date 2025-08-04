import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Utensils, Menu } from "lucide-react";
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

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Utensils className="text-primary-600 text-2xl mr-3" />
            <span className="font-bold text-xl text-gray-900">QRMenu</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors">
              {t('howItWorks')}
            </a>
            <a href="#examples" className="text-gray-600 hover:text-primary-600 transition-colors">
              {t('examples')}
            </a>
            <a href="#support" className="text-gray-600 hover:text-primary-600 transition-colors">
              {t('support')}
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
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
                  Вход
                </Button>
                <Button onClick={onShowRegister}>
                  Зарегистрироваться
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
            <Menu className="text-gray-600" />
          </Button>
        </div>
      </div>
    </header>
  );
}
