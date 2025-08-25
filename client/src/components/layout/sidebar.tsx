import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Utensils, Palette, Settings, Bot, QrCode, Menu, X, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/ui/language-selector";

const navigation = [
  { nameKey: "menu", href: "/dashboard", icon: Utensils },
  { nameKey: "design", href: "/dashboard/design", icon: Palette },
  { nameKey: "settings", href: "/dashboard/settings", icon: Settings },
  { nameKey: "ai", href: "/dashboard/ai", icon: Bot },
  { nameKey: "qr", href: "/dashboard/qr", icon: QrCode },
  { nameKey: "feedback", href: "/dashboard/feedback", icon: MessageSquare },
  { name: "Test Telegram", href: "/dashboard/telegram-test", icon: MessageSquare },
];

export function Sidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-md"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar & Mobile Drawer */}
      <div className={cn(
        "bg-white shadow-sm h-screen sticky top-0 transition-transform duration-300 ease-in-out z-40",
        "lg:w-64 lg:translate-x-0", // Desktop: always visible, 256px width
        "fixed w-80 lg:relative", // Mobile: fixed overlay, wider for touch
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Utensils className="text-primary-600 text-xl mr-3" />
              <span className="font-bold text-lg">QRMenu</span>
            </div>
            
            {/* Close button for mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={16} />
            </Button>
          </div>
          
          {/* Language Selector */}
          <div className="mt-4 flex justify-center">
            <LanguageSelector />
          </div>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
              return (
                <li key={item.nameKey}>
                  <a
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)} // Close mobile menu on navigation
                    className={cn(
                      "flex items-center p-3 rounded-lg transition-colors text-base", // Larger touch targets
                      isActive
                        ? "text-primary-600 bg-primary-50"
                        : "text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                    )}
                  >
                    <item.icon className="mr-3" size={20} />
                    {t(item.nameKey)}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
