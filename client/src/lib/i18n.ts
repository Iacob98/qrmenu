import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation & General
      "menu": "Menu",
      "settings": "Settings",
      "design": "Design",
      "ai": "AI",
      "qr": "QR Code",
      "logout": "Logout",
      "dashboard": "Dashboard",
      "restaurant": "Restaurant",
      
      // Auth
      "login": "Login",
      "register": "Register",
      "email": "Email",
      "password": "Password",
      "name": "Name",
      "loginButton": "Sign In",
      "registerButton": "Sign Up",
      "loginTitle": "Welcome Back",
      "registerTitle": "Create Account",
      
      // Restaurant Management
      "createRestaurant": "Create Restaurant",
      "restaurantName": "Restaurant Name",
      "description": "Description",
      "location": "Location",
      "currency": "Currency",
      "save": "Save",
      "cancel": "Cancel",
      "edit": "Edit",
      "delete": "Delete",
      
      // Categories
      "categories": "Categories",
      "addCategory": "Add Category",
      "categoryName": "Category Name",
      "icon": "Icon",
      "createCategory": "Create Category",
      "editCategory": "Edit Category",
      
      // Dishes
      "dishes": "Dishes",
      "addDish": "Add Dish",
      "dishName": "Dish Name",
      "price": "Price",
      "ingredients": "Ingredients",
      "nutrition": "Nutrition",
      "tags": "Tags",
      "createDish": "Create Dish",
      "editDish": "Edit Dish",
      "favorite": "Favorite",
      "visible": "Visible",
      "hidden": "Hidden",
      
      // AI Features
      "generateMenu": "Generate Menu",
      "uploadPhotos": "Upload Photos",
      "analyzeMenu": "Analyze Menu",
      "generateImage": "Generate Image",
      "improveDescription": "Improve Description",
      "processing": "Processing...",
      
      // Public Menu
      "searchPlaceholder": "Find a dish...",
      "noResults": "No results found",
      "noDishes": "No dishes in category",
      "viewDetails": "View Details",
      "favorites": "Favorites",
      
      // QR & Sharing
      "shareMenu": "Share Menu",
      "downloadQR": "Download QR Code",
      "publicLink": "Public Link",
      "qrCode": "QR Code",
      
      // Design
      "colors": "Colors",
      "fonts": "Fonts",
      "layout": "Layout",
      "logo": "Logo",
      "banner": "Banner",
      "theme": "Theme",
      
      // Common
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",
      "confirm": "Confirm",
      "close": "Close",
      "upload": "Upload",
      "remove": "Remove",
      "preview": "Preview",
      "apply": "Apply",
      
      // Currency
      "eur": "Euro",
      "usd": "US Dollar",
      "pln": "Polish Złoty",
      "mdl": "Moldovan Leu",
      
      // Tags
      "vegan": "vegan",
      "vegetarian": "vegetarian",
      "glutenFree": "gluten-free",
      "spicy": "spicy",
      "healthy": "healthy",
      "seafood": "seafood",
      
      // Language Selector
      "language": "Language",
      "english": "English",
      "german": "Deutsch",
      "russian": "Русский",
      
      // Auth Additional
      "back": "Back",
      "loginDescription": "Sign in to your account to manage menus",
      "emailPlaceholder": "example@email.com",
      "passwordPlaceholder": "Enter password",
      "loggingIn": "Signing in...",
      "loginSuccess": "Successfully logged in",
      "loginError": "Login Error",
      "loginErrorDesc": "Invalid credentials",
      "noAccount": "No account?",
      "emailInvalid": "Enter a valid email",
      "passwordMin": "Password must be at least 6 characters",
      
      // Register
      "backToMain": "Back to Main",
      "createAccountTitle": "Create account and start working with menus",
      "createAccountSubtitle": "Specify only the essentials — everything else can be added later",
      "confirmPassword": "Confirm Password",
      "passwordMinLength": "Minimum 8 characters",
      "acceptTerms": "I accept the terms of use and privacy policy",
      "continue": "Continue",
      "passwordMismatch": "Passwords do not match",
      "termsRequired": "Must accept terms of use",
      "restaurantNameRequired": "Restaurant name is required",
      "restaurantCreated": "Your restaurant has been created. Welcome!",
      "restaurantInfo": "Restaurant Information",
      "restaurantInfoSubtitle": "Tell us about your establishment",
      "restaurantNamePlaceholder": "Italian Restaurant",
      "cityPlaceholder": "Berlin",
      "phoneOptional": "Contact Phone (optional)",
      "phonePlaceholder": "+49 123 456 789",
      "aiTokenOptional": "AI Token (optional)",
      "aiTokenPlaceholder": "sk-...",
      "aiTokenDescription": "Add your AI provider token (e.g., OpenRouter or OpenAI) to automatically generate photos, ingredients, and nutrition info",
      "creating": "Creating...",
      "completeRegistration": "Complete Registration",
      
      // Modal Components
      "addCategory": "Add Category",
      "categoryName": "Category Name",
      "categoryNamePlaceholder": "e.g.: Soups, Hot Dishes, Desserts",
      "iconOptional": "Icon (optional)",
      "cancel": "Cancel",
      "create": "Create",
      "categoryCreated": "Category created",
      "categoryCreateError": "Failed to create category",
      "editCategory": "Edit Category",
      "save": "Save",
      "deleteCategory": "Delete Category",
      "confirmDeleteCategory": "Are you sure you want to delete this category?",
      "addDish": "Add Dish",
      "editDish": "Edit Dish",
      "dishName": "Dish Name",
      "price": "Price",
      "ingredients": "Ingredients",
      "nutrition": "Nutrition",
      "tags": "Tags",
      "delete": "Delete"
    }
  },
  de: {
    translation: {
      // Navigation & General
      "menu": "Menü",
      "settings": "Einstellungen",
      "design": "Design",
      "ai": "KI",
      "qr": "QR-Code",
      "logout": "Abmelden",
      "dashboard": "Dashboard",
      "restaurant": "Restaurant",
      
      // Auth
      "login": "Anmelden",
      "register": "Registrieren",
      "email": "E-Mail",
      "password": "Passwort",
      "name": "Name",
      "loginButton": "Einloggen",
      "registerButton": "Registrieren",
      "loginTitle": "Willkommen zurück",
      "registerTitle": "Konto erstellen",
      
      // Restaurant Management
      "createRestaurant": "Restaurant erstellen",
      "restaurantName": "Restaurant Name",
      "description": "Beschreibung",
      "location": "Standort",
      "currency": "Währung",
      "save": "Speichern",
      "cancel": "Abbrechen",
      "edit": "Bearbeiten",
      "delete": "Löschen",
      
      // Categories
      "categories": "Kategorien",
      "addCategory": "Kategorie hinzufügen",
      "categoryName": "Kategorie Name",
      "icon": "Symbol",
      "createCategory": "Kategorie erstellen",
      "editCategory": "Kategorie bearbeiten",
      
      // Dishes
      "dishes": "Gerichte",
      "addDish": "Gericht hinzufügen",
      "dishName": "Gericht Name",
      "price": "Preis",
      "ingredients": "Zutaten",
      "nutrition": "Nährwerte",
      "tags": "Eigenschaften",
      "createDish": "Gericht erstellen",
      "editDish": "Gericht bearbeiten",
      "favorite": "Favorit",
      "visible": "Sichtbar",
      "hidden": "Versteckt",
      
      // AI Features
      "generateMenu": "Menü generieren",
      "uploadPhotos": "Fotos hochladen",
      "analyzeMenu": "Menü analysieren",
      "generateImage": "Bild generieren",
      "improveDescription": "Beschreibung verbessern",
      "processing": "Verarbeitung...",
      
      // Public Menu
      "searchPlaceholder": "Gericht suchen...",
      "noResults": "Keine Ergebnisse gefunden",
      "noDishes": "Keine Gerichte in der Kategorie",
      "viewDetails": "Details anzeigen",
      "favorites": "Favoriten",
      
      // QR & Sharing
      "shareMenu": "Menü teilen",
      "downloadQR": "QR-Code herunterladen",
      "publicLink": "Öffentlicher Link",
      "qrCode": "QR-Code",
      
      // Design
      "colors": "Farben",
      "fonts": "Schriften",
      "layout": "Layout",
      "logo": "Logo",
      "banner": "Banner",
      "theme": "Design",
      
      // Common
      "loading": "Lädt...",
      "error": "Fehler",
      "success": "Erfolg",
      "confirm": "Bestätigen",
      "close": "Schließen",
      "upload": "Hochladen",
      "remove": "Entfernen",
      "preview": "Vorschau",
      "apply": "Anwenden",
      
      // Currency
      "eur": "Euro",
      "usd": "US-Dollar",
      "pln": "Polnischer Złoty",
      "mdl": "Moldauischer Leu",
      
      // Tags
      "vegan": "vegan",
      "vegetarian": "vegetarisch",
      "glutenFree": "glutenfrei",
      "spicy": "scharf",
      "healthy": "gesund",
      "seafood": "Meeresfrüchte",
      
      // Language Selector
      "language": "Sprache",
      "english": "English",
      "german": "Deutsch",
      "russian": "Русский",
      
      // Auth Additional
      "back": "Zurück",
      "loginDescription": "Melden Sie sich in Ihrem Konto an, um Menüs zu verwalten",
      "emailPlaceholder": "beispiel@email.com",
      "passwordPlaceholder": "Passwort eingeben",
      "loggingIn": "Wird angemeldet...",
      "loginSuccess": "Erfolgreich angemeldet",
      "loginError": "Anmeldefehler",
      "loginErrorDesc": "Ungültige Anmeldedaten",
      "noAccount": "Kein Konto?",
      "emailInvalid": "Geben Sie eine gültige E-Mail ein",
      "passwordMin": "Passwort muss mindestens 6 Zeichen lang sein",
      
      // Register
      "backToMain": "Zurück zur Hauptseite",
      "createAccountTitle": "Konto erstellen und mit Menüs arbeiten",
      "createAccountSubtitle": "Geben Sie nur das Wesentliche an — alles andere kann später hinzugefügt werden",
      "confirmPassword": "Passwort bestätigen",
      "passwordMinLength": "Mindestens 8 Zeichen",
      "acceptTerms": "Ich akzeptiere die Nutzungsbedingungen und Datenschutzrichtlinie",
      "continue": "Weiter",
      "passwordMismatch": "Passwörter stimmen nicht überein",
      "termsRequired": "Nutzungsbedingungen müssen akzeptiert werden",
      "restaurantNameRequired": "Restaurantname ist erforderlich",
      "restaurantCreated": "Ihr Restaurant wurde erstellt. Willkommen!",
      "restaurantInfo": "Restaurant-Informationen",
      "restaurantInfoSubtitle": "Erzählen Sie uns von Ihrem Lokal",
      "restaurantNamePlaceholder": "Italienisches Restaurant",
      "cityPlaceholder": "Berlin",
      "phoneOptional": "Kontakttelefon (optional)",
      "phonePlaceholder": "+49 123 456 789",
      "aiTokenOptional": "KI-Token (optional)",
      "aiTokenPlaceholder": "sk-...",
      "aiTokenDescription": "Fügen Sie Ihren KI-Anbieter-Token hinzu (z.B. OpenRouter oder OpenAI), um automatisch Fotos, Zutaten und Nährwerte zu generieren",
      "creating": "Wird erstellt...",
      "completeRegistration": "Registrierung abschließen",
      
      // Modal Components
      "addCategory": "Kategorie hinzufügen",
      "categoryName": "Kategoriename",
      "categoryNamePlaceholder": "z.B.: Suppen, Hauptgerichte, Desserts",
      "iconOptional": "Symbol (optional)",
      "cancel": "Abbrechen",
      "create": "Erstellen",
      "categoryCreated": "Kategorie erstellt",
      "categoryCreateError": "Kategorie konnte nicht erstellt werden",
      "editCategory": "Kategorie bearbeiten",
      "save": "Speichern",
      "deleteCategory": "Kategorie löschen",
      "confirmDeleteCategory": "Sind Sie sicher, dass Sie diese Kategorie löschen möchten?",
      "addDish": "Gericht hinzufügen",
      "editDish": "Gericht bearbeiten",
      "dishName": "Gerichtname",
      "price": "Preis",
      "ingredients": "Zutaten",
      "nutrition": "Nährwerte",
      "tags": "Tags",
      "delete": "Löschen"
    }
  },
  ru: {
    translation: {
      // Navigation & General
      "menu": "Меню",
      "settings": "Настройки",
      "design": "Дизайн",
      "ai": "ИИ",
      "qr": "QR-код",
      "logout": "Выйти",
      "dashboard": "Панель",
      "restaurant": "Ресторан",
      
      // Auth
      "login": "Войти",
      "register": "Регистрация",
      "email": "Email",
      "password": "Пароль",
      "name": "Имя",
      "loginButton": "Войти",
      "registerButton": "Зарегистрироваться",
      "loginTitle": "Добро пожаловать",
      "registerTitle": "Создать аккаунт",
      
      // Restaurant Management
      "createRestaurant": "Создать ресторан",
      "restaurantName": "Название ресторана",
      "description": "Описание",
      "location": "Местоположение",
      "currency": "Валюта",
      "save": "Сохранить",
      "cancel": "Отмена",
      "edit": "Редактировать",
      "delete": "Удалить",
      
      // Categories
      "categories": "Категории",
      "addCategory": "Добавить категорию",
      "categoryName": "Название категории",
      "icon": "Иконка",
      "createCategory": "Создать категорию",
      "editCategory": "Редактировать категорию",
      
      // Dishes
      "dishes": "Блюда",
      "addDish": "Добавить блюдо",
      "dishName": "Название блюда",
      "price": "Цена",
      "ingredients": "Ингредиенты",
      "nutrition": "Пищевая ценность",
      "tags": "Теги",
      "createDish": "Создать блюдо",
      "editDish": "Редактировать блюдо",
      "favorite": "Избранное",
      "visible": "Видимо",
      "hidden": "Скрыто",
      
      // AI Features
      "generateMenu": "Генерировать меню",
      "uploadPhotos": "Загрузить фото",
      "analyzeMenu": "Анализировать меню",
      "generateImage": "Генерировать изображение",
      "improveDescription": "Улучшить описание",
      "processing": "Обработка...",
      
      // Public Menu
      "searchPlaceholder": "Найти блюдо...",
      "noResults": "Ничего не найдено",
      "noDishes": "Нет блюд в категории",
      "viewDetails": "Подробнее",
      "favorites": "Избранное",
      
      // QR & Sharing
      "shareMenu": "Поделиться меню",
      "downloadQR": "Скачать QR-код",
      "publicLink": "Публичная ссылка",
      "qrCode": "QR-код",
      
      // Design
      "colors": "Цвета",
      "fonts": "Шрифты",
      "layout": "Макет",
      "logo": "Логотип",
      "banner": "Баннер",
      "theme": "Тема",
      
      // Common
      "loading": "Загрузка...",
      "error": "Ошибка",
      "success": "Успешно",
      "confirm": "Подтвердить",
      "close": "Закрыть",
      "upload": "Загрузить",
      "remove": "Удалить",
      "preview": "Предпросмотр",
      "apply": "Применить",
      
      // Currency
      "eur": "Евро",
      "usd": "Доллар США",
      "pln": "Польский злотый",
      "mdl": "Молдавский лей",
      
      // Tags
      "vegan": "веган",
      "vegetarian": "вегетарианское",
      "glutenFree": "без глютена",
      "spicy": "острое",
      "healthy": "полезное",
      "seafood": "морепродукты",
      
      // Language Selector
      "language": "Язык",
      "english": "English",
      "german": "Deutsch",
      "russian": "Русский",
      
      // Auth Additional
      "back": "Назад",
      "loginDescription": "Войдите в свой аккаунт для управления меню",
      "emailPlaceholder": "example@email.com",
      "passwordPlaceholder": "Введите пароль",
      "loggingIn": "Вход...",
      "loginSuccess": "Успешно вошли в систему",
      "loginError": "Ошибка входа",
      "loginErrorDesc": "Неверные учетные данные",
      "noAccount": "Нет аккаунта?",
      "emailInvalid": "Введите корректный email",
      "passwordMin": "Пароль должен содержать минимум 6 символов",
      
      // Register
      "backToMain": "Вернуться на главную",
      "createAccountTitle": "Создайте аккаунт и начните работать с меню",
      "createAccountSubtitle": "Укажите только самое необходимое — всё остальное можно добавить позже",
      "confirmPassword": "Повторите пароль",
      "passwordMinLength": "Минимум 8 символов",
      "acceptTerms": "Я принимаю условия использования и политику конфиденциальности",
      "continue": "Продолжить",
      "passwordMismatch": "Пароли не совпадают",
      "termsRequired": "Необходимо принять условия использования",
      "restaurantNameRequired": "Укажите название ресторана",
      "restaurantCreated": "Ваш ресторан создан. Добро пожаловать!",
      "restaurantInfo": "Информация о ресторане",
      "restaurantInfoSubtitle": "Расскажите о вашем заведении",
      "restaurantNamePlaceholder": "Итальянский ресторан",
      "cityPlaceholder": "Берлин",
      "phoneOptional": "Контактный телефон (опционально)",
      "phonePlaceholder": "+49 123 456 789",
      "aiTokenOptional": "ИИ-токен (опционально)",
      "aiTokenPlaceholder": "sk-...",
      "aiTokenDescription": "Добавьте токен своего ИИ-провайдера (например, OpenRouter или OpenAI), чтобы мы могли автоматически генерировать фото, состав и БЖУ",
      "creating": "Создание...",
      "completeRegistration": "Завершить регистрацию",
      
      // Modal Components
      "addCategory": "Добавить категорию",
      "categoryName": "Название категории",
      "categoryNamePlaceholder": "Например: Супы, Горячее, Десерты",
      "iconOptional": "Иконка (опционально)",
      "cancel": "Отмена",
      "create": "Создать",
      "categoryCreated": "Категория создана",
      "categoryCreateError": "Не удалось создать категорию",
      "editCategory": "Редактировать категорию",
      "save": "Сохранить",
      "deleteCategory": "Удалить категорию",
      "confirmDeleteCategory": "Вы уверены, что хотите удалить эту категорию?",
      "addDish": "Добавить блюдо",
      "editDish": "Редактировать блюдо",
      "dishName": "Название блюда",
      "price": "Цена",
      "ingredients": "Состав",
      "nutrition": "БЖУ",
      "tags": "Теги",
      "delete": "Удалить"
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
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;