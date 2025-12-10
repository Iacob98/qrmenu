import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';

// All supported languages with their metadata
const allLanguages: Record<string, { name: string; flag: string }> = {
  en: { name: 'English', flag: '🇺🇸' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  uk: { name: 'Українська', flag: '🇺🇦' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  pl: { name: 'Polski', flag: '🇵🇱' },
  tr: { name: 'Türkçe', flag: '🇹🇷' },
  ro: { name: 'Română', flag: '🇷🇴' },
};

// Default languages when no specific list provided
const defaultLanguageCodes = ['en', 'de', 'ru'];

interface LanguageSelectorProps {
  availableLanguages?: string[];
}

export function LanguageSelector({ availableLanguages }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const queryClient = useQueryClient();

  // Use provided languages or default list
  const languageCodes = availableLanguages && availableLanguages.length > 0
    ? availableLanguages
    : defaultLanguageCodes;

  // Build languages array from codes
  const languages = languageCodes
    .filter(code => allLanguages[code])
    .map(code => ({ code, ...allLanguages[code] }));

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (languageCode: string) => {
    // Change UI language
    i18n.changeLanguage(languageCode);

    // Also update restaurant language if we have a selected restaurant
    const selectedRestaurant = localStorage.getItem('selectedRestaurant');
    if (selectedRestaurant) {
      try {
        await apiRequest('PATCH', `/api/restaurants/${selectedRestaurant}/language`, { language: languageCode });
        // Invalidate restaurant queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/restaurants', selectedRestaurant] });
      } catch (error) {
        // Silently fail - the user might not be authenticated or restaurant might not exist
        console.log('Could not sync restaurant language:', error);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={i18n.language === language.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}