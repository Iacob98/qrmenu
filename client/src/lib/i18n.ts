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

      // Landing page navigation
      "howItWorks": "Как это работает",
      "examples": "Примеры", 
      "support": "Поддержка",
      
      // Landing page content
      "heroTitle": "Онлайн-меню для вашего ресторана — за 5 минут",
      "heroSubtitle": "Просто загрузите PDF, фото или введите текст — и мы создадим красивое меню с ИИ.",
      "createMenu": "Создать меню",
      "aiFeatureTitle": "ИИ в помощь",
      "aiFeatureDesc": "Генерирует фото блюд, БЖУ и состав по PDF или фото",
      "convenientTitle": "Удобно",
      "convenientDesc": "Современный дизайн, легко открывается с телефона",
      "multilingualTitle": "Многоязычность",
      "multilingualDesc": "Интерфейс поддерживает немецкий, английский и русский языки",
      "howItWorksTitle": "Как это работает?",
      "step1Title": "Зарегистрируйтесь и укажите данные ресторана",
      "step1Desc": "Название, адрес, валюта, контакт.",
      "step2Title": "Создайте меню вручную или загрузите PDF/фото",
      "step2Desc": "Наш ИИ сам достанет нужную информацию.",
      "step3Title": "Получите QR-ссылку для гостей",
      "step3Desc": "Показывайте меню на экране или на столах.",
      "hello": "Привет",
      
      // Auth buttons
      "loginButton": "Вход", 
      "registerButton": "Регистрация",
      "startNow": "Начать сейчас",
      
      // AI page
      "foundDishes": "Найденные блюда",
      "dishesFound": "найдено блюд",
      
      // QR instructions
      "qrInstructions1Title": "На столах",
      "qrInstructions1Desc": "Распечатайте QR-код и разместите на каждом столике",
      "qrInstructions2Title": "В витрине", 
      "qrInstructions2Desc": "Разместите на входе или в витрине для привлечения гостей",
      "qrInstructions3Title": "В соцсетях",
      "qrInstructions3Desc": "Добавьте в посты Instagram, Facebook или на сайт",
      "qrInstructions4Title": "На визитках",
      "qrInstructions4Desc": "Добавьте на визитки или рекламные материалы",
      "additionalFunctions": "Дополнительные функции будут добавлены в следующих версиях:",
      "qrColorCustomization": "Настройка цвета и стиля QR-кода",
      "logoIntegration": "Интеграция логотипа в QR-код",
      "analytics": "Аналитика переходов",

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
      
      // Auth page additional keys
      "loggingIn": "Вход...",
      "continue": "Продолжить",
      "completeRegistration": "Завершить регистрацию",
      
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

      // Landing page navigation
      "howItWorks": "How It Works",
      "examples": "Examples",
      "support": "Support",
      
      // Landing page content
      "heroTitle": "Online menu for your restaurant — in 5 minutes",
      "heroSubtitle": "Just upload PDF, photo or enter text — and we'll create a beautiful menu with AI.",
      "createMenu": "Create Menu",
      "aiFeatureTitle": "AI Assistant",
      "aiFeatureDesc": "Generates dish photos, nutrition facts and ingredients from PDF or photo",
      "convenientTitle": "Convenient",
      "convenientDesc": "Modern design, easy to open from phone",
      "multilingualTitle": "Multilingual",
      "multilingualDesc": "Interface supports German, English and Russian languages",
      "howItWorksTitle": "How does it work?",
      "step1Title": "Register and add restaurant details",
      "step1Desc": "Name, address, currency, contact.",
      "step2Title": "Create menu manually or upload PDF/photo",
      "step2Desc": "Our AI will extract the necessary information.",
      "step3Title": "Get QR link for guests",
      "step3Desc": "Show menu on screen or on tables.",
      "hello": "Hello",
      
      // Auth buttons
      "loginButton": "Login",
      "registerButton": "Register", 
      "startNow": "Start Now",
      
      // AI page
      "foundDishes": "Found Dishes",
      "dishesFound": "dishes found",
      
      // QR instructions
      "qrInstructions1Title": "On Tables",
      "qrInstructions1Desc": "Print QR code and place on each table",
      "qrInstructions2Title": "In Showcase",
      "qrInstructions2Desc": "Place at entrance or in showcase to attract guests",
      "qrInstructions3Title": "On Social Media", 
      "qrInstructions3Desc": "Add to Instagram, Facebook posts or website",
      "qrInstructions4Title": "On Business Cards",
      "qrInstructions4Desc": "Add to business cards or promotional materials",
      "additionalFunctions": "Additional features will be added in future versions:",
      "qrColorCustomization": "QR code color and style customization",
      "logoIntegration": "Logo integration in QR code",
      "analytics": "Click analytics",

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

      // Landing page navigation
      "howItWorks": "Wie es funktioniert",
      "examples": "Beispiele",
      "support": "Support",
      
      // Landing page content
      "heroTitle": "Online-Menü für Ihr Restaurant — in 5 Minuten",
      "heroSubtitle": "Laden Sie einfach PDF, Foto hoch oder geben Sie Text ein — und wir erstellen ein schönes Menü mit KI.",
      "createMenu": "Menü erstellen",
      "aiFeatureTitle": "KI-Assistent",
      "aiFeatureDesc": "Generiert Gerichtfotos, Nährwerte und Zutaten aus PDF oder Foto",
      "convenientTitle": "Bequem",
      "convenientDesc": "Modernes Design, einfach vom Handy zu öffnen",
      "multilingualTitle": "Mehrsprachig",
      "multilingualDesc": "Benutzeroberfläche unterstützt Deutsch, Englisch und Russisch",
      "howItWorksTitle": "Wie funktioniert es?",
      "step1Title": "Registrieren Sie sich und geben Sie Restaurant-Details ein",
      "step1Desc": "Name, Adresse, Währung, Kontakt.",
      "step2Title": "Menü manuell erstellen oder PDF/Foto hochladen",
      "step2Desc": "Unsere KI extrahiert die notwendigen Informationen.",
      "step3Title": "QR-Link für Gäste erhalten",
      "step3Desc": "Menü auf Bildschirm oder auf Tischen anzeigen.",
      "hello": "Hallo",
      
      // Auth buttons
      "loginButton": "Anmelden",
      "registerButton": "Registrieren",
      "startNow": "Jetzt starten",
      
      // AI page  
      "foundDishes": "Gefundene Gerichte",
      "dishesFound": "Gerichte gefunden",
      
      // QR instructions
      "qrInstructions1Title": "Auf Tischen",
      "qrInstructions1Desc": "QR-Code drucken und auf jeden Tisch legen",
      "qrInstructions2Title": "Im Schaufenster",
      "qrInstructions2Desc": "Am Eingang oder im Schaufenster platzieren, um Gäste anzulocken",
      "qrInstructions3Title": "In sozialen Medien",
      "qrInstructions3Desc": "Zu Instagram-, Facebook-Posts oder Website hinzufügen",
      "qrInstructions4Title": "Auf Visitenkarten", 
      "qrInstructions4Desc": "Zu Visitenkarten oder Werbematerialien hinzufügen",
      "additionalFunctions": "Zusätzliche Funktionen werden in zukünftigen Versionen hinzugefügt:",
      "qrColorCustomization": "QR-Code-Farb- und Stilanpassung",
      "logoIntegration": "Logo-Integration in QR-Code",
      "analytics": "Klick-Analytik",

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
      
      // Auth page additional keys
      "loggingIn": "Anmelden...",
      "continue": "Weiter",
      "completeRegistration": "Registrierung abschließen",
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