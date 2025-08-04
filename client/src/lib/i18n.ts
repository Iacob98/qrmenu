import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ru: {
    translation: {
      // Navigation
      "menu": "Меню",
      "settings": "Настройки", 
      "design": "Дизайн",
      "ai": "ИИ",
      "qr": "QR-код",
      "logout": "Выйти",

      // Common actions
      "save": "Сохранить",
      "cancel": "Отмена",
      "delete": "Удалить", 
      "edit": "Редактировать",
      "create": "Создать",
      "update": "Обновить",
      "upload": "Загрузить",
      "download": "Скачать",
      "copy": "Копировать",
      "close": "Закрыть",
      "confirm": "Подтвердить",
      "back": "Назад",
      "next": "Далее",
      "loading": "Загрузка...",
      "error": "Ошибка",
      "success": "Успешно!",

      // Auth
      "login": "Вход",
      "register": "Регистрация", 
      "email": "Email",
      "password": "Пароль",
      "confirmPassword": "Подтвердите пароль",
      "firstName": "Имя",
      "lastName": "Фамилия",
      "alreadyHaveAccount": "Уже есть аккаунт?",
      "dontHaveAccount": "Нет аккаунта?",
      "loginHere": "Войти",
      "registerHere": "Зарегистрироваться",

      // Restaurant management
      "restaurantName": "Название ресторана",
      "restaurantSlug": "URL-адрес",
      "restaurantCurrency": "Валюта",
      "createRestaurant": "Создать ресторан",
      "noRestaurants": "У вас пока нет ресторанов",
      "createFirstRestaurant": "Создайте свой первый ресторан",

      // Menu management
      "addDish": "Добавить блюдо",
      "addCategory": "Добавить категорию",
      "editDish": "Редактировать блюдо",
      "editCategory": "Редактировать категорию",
      "editFavoritesTitle": "Изменить название",
      "deleteDish": "Удалить блюдо",
      "deleteCategory": "Удалить категорию",
      "dishName": "Название блюда",
      "dishDescription": "Описание",
      "dishPrice": "Цена",
      "dishIngredients": "Ингредиенты",
      "categoryName": "Название категории",
      "categoryIcon": "Иконка",
      "favorites": "Избранное",
      "addToFavorites": "В избранное",
      "removeFromFavorites": "Убрать из избранного",
      "hideDish": "Скрыть блюдо",
      "showDish": "Показать блюдо",
      "noDishesInCategory": "В этой категории пока нет блюд",

      // Settings page
      "settingsTitle": "Настройки",
      "restaurantSettings": "Настройки ресторана",
      "profile": "Профиль",
      "profileSettings": "Профиль",
      "aiSettings": "Настройки ИИ",
      "aiProvider": "AI провайдер",
      "apiToken": "API Token",
      "additionalSettings": "Дополнительные настройки",
      "currencyAndLanguage": "Валюта и язык",
      "currency": "Валюта",
      "language": "Язык",
      "saveChanges": "Сохранить",
      "settingsUpdated": "Настройки обновлены",
      "settingsUpdateError": "Ошибка обновления настроек",

      // AI page
      "createDishesWithAI": "Создание блюд с помощью ИИ",
      "chooseFile": "Выбрать файл",
      "uploadPDFOrImage": "Загрузите PDF меню или фото",
      "maxFileSize": "Максимум 8МБ",
      "analyzeWithAI": "Анализировать с помощью ИИ",
      "analyzing": "Анализируем...",
      "addSelectedDishes": "Добавить выбранные блюда",
      "selectDishesToAdd": "Выберите блюда для добавления в меню",
      "noDishesFound": "Блюда не найдены",
      "aiAnalysisError": "Ошибка анализа ИИ",

      // QR page
      "howToUseQR": "Как использовать QR-код",
      "qrCodeInstructions": "Инструкции по использованию QR-кода", 
      "downloadQR": "Скачать QR-код",
      "shareLink": "Поделиться ссылкой",
      "publicMenuLink": "Публичная ссылка меню",
      "linkCopied": "Ссылка скопирована",
      "menuLinkCopied": "Ссылка на меню скопирована",

      // Design page
      "designSettings": "Настройки дизайна",
      "colorScheme": "Цветовая схема",
      "primaryColor": "Основной цвет",
      "accentColor": "Акцентный цвет",
      "backgroundColor": "Цвет фона",
      "fontFamily": "Семейство шрифтов",
      "fontSize": "Размер шрифта",
      "borderRadius": "Скругление углов",
      "preview": "Предварительный просмотр",
      "resetToDefault": "Сбросить к умолчанию",
      "designSaved": "Дизайн сохранен",
      "designSaveError": "Ошибка сохранения дизайна",

      // Color themes
      "defaultTheme": "По умолчанию",
      "elegantTheme": "Элегантная",
      "warmTheme": "Теплая",
      "darkTheme": "Темная",

      // Toast messages
      "favoritesTitleUpdated": "Название раздела избранного обновлено",
      "failedToUpdateTitle": "Не удалось обновить название",
      "categoryCreated": "Категория создана",
      "categoryUpdated": "Категория обновлена", 
      "categoryUpdateError": "Ошибка обновления категории",
      "dishCreated": "Блюдо создано",
      "dishUpdated": "Блюдо обновлено",
      "updateDishError": "Ошибка обновления блюда",
      
      // Form labels and placeholders
      "categoryNamePlaceholder": "Название категории",
      "favoriteTitlePlaceholder": "Например: Хиты, Рекомендуем, Любимое...",
      "dishNamePlaceholder": "Название блюда",
      "descriptionPlaceholder": "Описание блюда",
      "ingredientsPlaceholder": "Например: томаты, моцарелла, базилик",
      "categoryLabel": "Название категории",
      "favoriteTitleLabel": "Название раздела",
      "saving": "Сохранение...",
      "creating": "Создание...",
      "updating": "Обновление...",
    }
  },
  en: {
    translation: {
      // Navigation
      "menu": "Menu",
      "settings": "Settings",
      "design": "Design", 
      "ai": "AI",
      "qr": "QR Code",
      "logout": "Logout",

      // Common actions
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit", 
      "create": "Create",
      "update": "Update",
      "upload": "Upload",
      "download": "Download",
      "copy": "Copy",
      "close": "Close",
      "confirm": "Confirm",
      "back": "Back",
      "next": "Next",
      "loading": "Loading...",
      "error": "Error",
      "success": "Success!",

      // Auth
      "login": "Login",
      "register": "Register",
      "email": "Email",
      "password": "Password",
      "confirmPassword": "Confirm Password",
      "firstName": "First Name",
      "lastName": "Last Name",
      "alreadyHaveAccount": "Already have an account?",
      "dontHaveAccount": "Don't have an account?",
      "loginHere": "Login here",
      "registerHere": "Register here",

      // Restaurant management
      "restaurantName": "Restaurant Name",
      "restaurantSlug": "URL Slug",
      "restaurantCurrency": "Currency",
      "createRestaurant": "Create Restaurant",
      "noRestaurants": "You don't have any restaurants yet",
      "createFirstRestaurant": "Create your first restaurant",

      // Menu management
      "addDish": "Add Dish",
      "addCategory": "Add Category",
      "editDish": "Edit Dish",
      "editCategory": "Edit Category",
      "editFavoritesTitle": "Edit Title",
      "deleteDish": "Delete Dish",
      "deleteCategory": "Delete Category",
      "dishName": "Dish Name",
      "dishDescription": "Description",
      "dishPrice": "Price",
      "dishIngredients": "Ingredients",
      "categoryName": "Category Name",
      "categoryIcon": "Icon",
      "favorites": "Favorites",
      "addToFavorites": "Add to Favorites",
      "removeFromFavorites": "Remove from Favorites",
      "hideDish": "Hide Dish",
      "showDish": "Show Dish", 
      "noDishesInCategory": "No dishes in this category yet",

      // Settings page
      "settingsTitle": "Settings", 
      "restaurantSettings": "Restaurant Settings",
      "profile": "Profile",
      "profileSettings": "Profile",
      "aiSettings": "AI Settings",
      "aiProvider": "AI Provider",
      "apiToken": "API Token",
      "additionalSettings": "Additional Settings",
      "currencyAndLanguage": "Currency and Language",
      "currency": "Currency",
      "language": "Language",
      "saveChanges": "Save Changes",
      "settingsUpdated": "Settings updated",
      "settingsUpdateError": "Settings update error",

      // AI page
      "createDishesWithAI": "Create Dishes with AI",
      "chooseFile": "Choose File",
      "uploadPDFOrImage": "Upload PDF menu or photo",
      "maxFileSize": "Maximum 8MB",
      "analyzeWithAI": "Analyze with AI",
      "analyzing": "Analyzing...",
      "addSelectedDishes": "Add Selected Dishes",
      "selectDishesToAdd": "Select dishes to add to menu",
      "noDishesFound": "No dishes found",
      "aiAnalysisError": "AI analysis error",

      // QR page
      "howToUseQR": "How to Use QR Code",
      "qrCodeInstructions": "QR Code Usage Instructions",
      "downloadQR": "Download QR Code",
      "shareLink": "Share Link", 
      "publicMenuLink": "Public Menu Link",
      "linkCopied": "Link copied",
      "menuLinkCopied": "Menu link copied",

      // Design page
      "designSettings": "Design Settings",
      "colorScheme": "Color Scheme",
      "primaryColor": "Primary Color",
      "accentColor": "Accent Color",
      "backgroundColor": "Background Color",
      "fontFamily": "Font Family",
      "fontSize": "Font Size",
      "borderRadius": "Border Radius",
      "preview": "Preview",
      "resetToDefault": "Reset to Default",
      "designSaved": "Design saved",
      "designSaveError": "Design save error",

      // Color themes
      "defaultTheme": "Default",
      "elegantTheme": "Elegant",
      "warmTheme": "Warm", 
      "darkTheme": "Dark",

      // Toast messages
      "favoritesTitleUpdated": "Favorites section title updated",
      "failedToUpdateTitle": "Failed to update title",
      "categoryCreated": "Category created",
      "categoryUpdated": "Category updated",
      "categoryUpdateError": "Category update error", 
      "dishCreated": "Dish created",
      "dishUpdated": "Dish updated",
      "updateDishError": "Dish update error",
      
      // Form labels and placeholders
      "categoryNamePlaceholder": "Category name",
      "favoriteTitlePlaceholder": "For example: Hits, Recommended, Favorites...",
      "dishNamePlaceholder": "Dish name",
      "descriptionPlaceholder": "Dish description",
      "ingredientsPlaceholder": "For example: tomatoes, mozzarella, basil",
      "categoryLabel": "Category name",
      "favoriteTitleLabel": "Section title",
      "saving": "Saving...",
      "creating": "Creating...",
      "updating": "Updating...",
    }
  },
  de: {
    translation: {
      // Navigation
      "menu": "Menü",
      "settings": "Einstellungen",
      "design": "Design",
      "ai": "KI",
      "qr": "QR-Code",
      "logout": "Abmelden",

      // Common actions
      "save": "Speichern",
      "cancel": "Abbrechen",
      "delete": "Löschen",
      "edit": "Bearbeiten",
      "create": "Erstellen",
      "update": "Aktualisieren",
      "upload": "Hochladen",
      "download": "Herunterladen",
      "copy": "Kopieren",
      "close": "Schließen",
      "confirm": "Bestätigen",
      "back": "Zurück",
      "next": "Weiter",
      "loading": "Lädt...",
      "error": "Fehler",
      "success": "Erfolgreich!",

      // Auth
      "login": "Anmelden",
      "register": "Registrieren",
      "email": "E-Mail",
      "password": "Passwort",
      "confirmPassword": "Passwort bestätigen",
      "firstName": "Vorname",
      "lastName": "Nachname",
      "alreadyHaveAccount": "Haben Sie bereits ein Konto?",
      "dontHaveAccount": "Haben Sie noch kein Konto?",
      "loginHere": "Hier anmelden",
      "registerHere": "Hier registrieren",

      // Restaurant management
      "restaurantName": "Restaurant Name",
      "restaurantSlug": "URL-Slug",
      "restaurantCurrency": "Währung",
      "createRestaurant": "Restaurant erstellen",
      "noRestaurants": "Sie haben noch keine Restaurants",
      "createFirstRestaurant": "Erstellen Sie Ihr erstes Restaurant",

      // Menu management
      "addDish": "Gericht hinzufügen",
      "addCategory": "Kategorie hinzufügen",
      "editDish": "Gericht bearbeiten",
      "editCategory": "Kategorie bearbeiten",
      "editFavoritesTitle": "Titel bearbeiten",
      "deleteDish": "Gericht löschen",
      "deleteCategory": "Kategorie löschen",
      "dishName": "Gericht Name",
      "dishDescription": "Beschreibung",
      "dishPrice": "Preis",
      "dishIngredients": "Zutaten",
      "categoryName": "Kategorie Name",
      "categoryIcon": "Symbol",
      "favorites": "Favoriten",
      "addToFavorites": "Zu Favoriten hinzufügen",
      "removeFromFavorites": "Aus Favoriten entfernen",
      "hideDish": "Gericht verstecken",
      "showDish": "Gericht anzeigen",
      "noDishesInCategory": "Noch keine Gerichte in dieser Kategorie",

      // Settings page
      "settingsTitle": "Einstellungen",
      "restaurantSettings": "Restaurant Einstellungen", 
      "profile": "Profil",
      "profileSettings": "Profil",
      "aiSettings": "KI-Einstellungen",
      "aiProvider": "KI-Anbieter",
      "apiToken": "API-Token",
      "additionalSettings": "Zusätzliche Einstellungen",
      "currencyAndLanguage": "Währung und Sprache",
      "currency": "Währung",
      "language": "Sprache",
      "saveChanges": "Änderungen speichern",
      "settingsUpdated": "Einstellungen aktualisiert",
      "settingsUpdateError": "Fehler beim Aktualisieren der Einstellungen",

      // AI page
      "createDishesWithAI": "Gerichte mit KI erstellen",
      "chooseFile": "Datei auswählen",
      "uploadPDFOrImage": "PDF-Menü oder Foto hochladen",
      "maxFileSize": "Maximum 8MB",
      "analyzeWithAI": "Mit KI analysieren",
      "analyzing": "Analysiere...",
      "addSelectedDishes": "Ausgewählte Gerichte hinzufügen",
      "selectDishesToAdd": "Gerichte zum Hinzufügen auswählen",
      "noDishesFound": "Keine Gerichte gefunden",
      "aiAnalysisError": "KI-Analysefehler",

      // QR page
      "howToUseQR": "Verwendung des QR-Codes",
      "qrCodeInstructions": "QR-Code-Nutzungsanweisungen",
      "downloadQR": "QR-Code herunterladen",
      "shareLink": "Link teilen",
      "publicMenuLink": "Öffentlicher Menü-Link",
      "linkCopied": "Link kopiert",
      "menuLinkCopied": "Menü-Link kopiert",

      // Design page
      "designSettings": "Design-Einstellungen",
      "colorScheme": "Farbschema",
      "primaryColor": "Hauptfarbe",
      "accentColor": "Akzentfarbe",
      "backgroundColor": "Hintergrundfarbe",
      "fontFamily": "Schriftfamilie",
      "fontSize": "Schriftgröße",
      "borderRadius": "Eckenrundung",
      "preview": "Vorschau",
      "resetToDefault": "Auf Standard zurücksetzen",
      "designSaved": "Design gespeichert",
      "designSaveError": "Fehler beim Speichern des Designs",

      // Color themes
      "defaultTheme": "Standard",
      "elegantTheme": "Elegant",
      "warmTheme": "Warm",
      "darkTheme": "Dunkel",

      // Toast messages
      "favoritesTitleUpdated": "Favoriten-Abschnittstitel aktualisiert",
      "failedToUpdateTitle": "Titel konnte nicht aktualisiert werden",
      "categoryCreated": "Kategorie erstellt",
      "categoryUpdated": "Kategorie aktualisiert",
      "categoryUpdateError": "Kategorie-Aktualisierungsfehler",
      "dishCreated": "Gericht erstellt", 
      "dishUpdated": "Gericht aktualisiert",
      "updateDishError": "Gericht-Aktualisierungsfehler",
      
      // Form labels and placeholders
      "categoryNamePlaceholder": "Kategoriename",
      "favoriteTitlePlaceholder": "Zum Beispiel: Hits, Empfohlen, Favoriten...",
      "dishNamePlaceholder": "Gericht Name",
      "descriptionPlaceholder": "Gericht Beschreibung",
      "ingredientsPlaceholder": "Zum Beispiel: Tomaten, Mozzarella, Basilikum",
      "categoryLabel": "Kategoriename",
      "favoriteTitleLabel": "Abschnittstitel",
      "saving": "Speichern...",
      "creating": "Erstelle...",
      "updating": "Aktualisiere...",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;