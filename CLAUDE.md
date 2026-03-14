# QRMenu — Руководство для агента

> SaaS-платформа цифровых меню для ресторанов с AI-генерацией, QR-кодами, реалтайм-обновлениями и админ-панелью.

## Быстрый старт

```bash
# Запуск инфраструктуры (PostgreSQL + Redis)
docker compose -f docker-compose.dev.yml up -d

# Применить миграции
docker exec qrmenu-db-dev psql -U qrmenu -d qrmenu -f /dev/stdin < migrations/0007_admin_platform.sql

# Запуск dev-сервера (порт 5000)
source .env && npm run dev

# Сборка
npm run build && npm start

# Проверка типов
npm run check

# Drizzle ORM
npm run db:generate   # сгенерировать миграцию из schema.ts
npm run db:push       # синхронизировать схему с БД
npm run db:studio     # визуальный браузер БД
```

**URL в dev-режиме:** http://localhost:5000 (API + Frontend на одном порту)

---

## Стек технологий

| Слой | Технологии |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS 3 + Radix UI (shadcn/ui) |
| Роутинг | Wouter (легковесный клиентский роутер) |
| Состояние | TanStack React Query (серверное), React state (локальное) |
| Формы | React Hook Form + Zod |
| i18n | react-i18next (ru, en, de, fr, es, it, tr, uk) |
| Backend | Express.js 4 + TypeScript |
| ORM | Drizzle ORM 0.39 + node-postgres (pg) |
| БД | PostgreSQL 16 |
| Кэш/Сессии | Redis 7 (connect-redis, rate-limit-redis) |
| AI | OpenAI GPT-4o, OpenRouter, Replicate (Imagen-4) |
| Хранилище | Supabase Storage / локальная ФС (/uploads) |
| WebSocket | ws (кастомный MenuWebSocketManager) |
| Email | SendGrid |
| Уведомления | Telegram Bot API |
| Безопасность | Helmet, bcrypt, AES-256-GCM, DOMPurify, CSRF headers |

---

## Структура проекта

```
├── client/src/                  # React SPA
│   ├── App.tsx                  # Роутер + провайдеры
│   ├── main.tsx                 # Entry point
│   ├── pages/
│   │   ├── landing.tsx          # Публичная лендинг-страница
│   │   ├── auth/                # login.tsx, register.tsx
│   │   ├── dashboard/           # Кабинет ресторатора
│   │   │   ├── index.tsx        # Редирект на /dashboard/menu
│   │   │   ├── menu.tsx         # Управление меню (категории, блюда)
│   │   │   ├── ai.tsx           # AI-генерация меню
│   │   │   ├── settings.tsx     # Настройки ресторана
│   │   │   ├── design.tsx       # Дизайн (лого, баннер, цвета)
│   │   │   ├── qr.tsx           # QR-коды
│   │   │   └── feedback.tsx     # Обратная связь
│   │   ├── admin/               # Админ-панель (только isAdmin=true)
│   │   │   ├── index.tsx        # Обзор: KPI, графики за 30 дней
│   │   │   ├── layout.tsx       # Sidebar-layout админки
│   │   │   ├── users.tsx        # Все пользователи, поиск, toggle admin
│   │   │   ├── user-detail.tsx  # Детали пользователя + его рестораны + AI логи
│   │   │   ├── restaurants.tsx  # Все рестораны с token usage
│   │   │   ├── ai-logs.tsx      # Логи AI-запросов, фильтры
│   │   │   └── feedback.tsx     # Управление фидбэком (статус, приоритет)
│   │   └── public-menu/         # Публичное меню ресторана
│   │       └── [restaurantId].tsx
│   ├── components/
│   │   ├── ui/                  # shadcn/ui (Button, Card, Input, Dialog, Badge...)
│   │   ├── admin/               # AdminGuard
│   │   ├── auth/                # AuthGuard, EmailVerificationBanner
│   │   ├── layout/              # Sidebar
│   │   ├── modals/              # AddCategory, AddDish, EditDish, EditCategory...
│   │   ├── menu/                # DishCard
│   │   └── restaurant/          # CreateRestaurantModal
│   ├── lib/
│   │   ├── auth.tsx             # AuthProvider + useAuth() — login/register/logout
│   │   ├── queryClient.ts       # QueryClient + apiRequest() с CSRF-заголовком
│   │   ├── i18n.ts              # i18next конфигурация
│   │   ├── analytics.ts         # GTM + GA4
│   │   └── utils.ts             # cn() (tailwind-merge)
│   └── hooks/
│       └── use-toast.ts         # Toast-уведомления
│
├── server/                      # Express API
│   ├── index.ts                 # App setup: Helmet, CORS, CSRF, compression, session
│   ├── routes.ts                # Основные API роуты (1705 строк)
│   ├── adminRoutes.ts           # Admin API роуты (346 строк)
│   ├── db.ts                    # PostgreSQL pool (max:25, min:5) + Drizzle instance
│   ├── redis.ts                 # Redis singleton с reconnect strategy
│   ├── storage.ts               # DatabaseStorage — CRUD для всех сущностей (363 строки)
│   ├── websocket.ts             # MenuWebSocketManager (235 строк)
│   ├── supabase.ts              # Supabase client + buckets config
│   ├── telegram.ts              # Telegram Bot уведомления
│   ├── sendgrid.ts              # Email-сервис
│   ├── vite.ts                  # Vite dev server integration
│   ├── services/
│   │   ├── ai.ts                # AIService (964 строки) — analyze PDF/photo/text, generate image, translate
│   │   ├── translationService.ts # Оркестрация переводов (bulk jobs)
│   │   ├── translationCache.ts  # Кэш переводов в БД
│   │   ├── storageService.ts    # Supabase / local FS abstraction
│   │   ├── qr.ts                # QR-код генерация
│   │   └── email.ts             # Email verification
│   ├── middleware/
│   │   ├── adminAuth.ts         # requireAdmin — проверка isAdmin
│   │   ├── rateLimiter.ts       # Redis-backed rate limiters (global/auth/ai/public/upload)
│   │   ├── cache.ts             # Redis-backed response cache с TTL
│   │   └── upload.ts            # Multer + Sharp image processing
│   └── utils/
│       ├── crypto.ts            # AES-256-GCM шифрование AI-токенов
│       └── retry.ts             # Retry с exponential backoff
│
├── shared/
│   └── schema.ts                # Drizzle ORM схема + Zod schemas + TypeScript типы
│
├── migrations/                  # SQL-миграции (0000–0007)
├── docker-compose.yml           # Production (app + db + redis + supabase)
├── docker-compose.dev.yml       # Dev (db + redis only)
└── supabase/                    # Supabase docker config
```

---

## Схема базы данных

```
users
  id (PK, UUID), email (unique), password (bcrypt), name, is_admin,
  email_verified, email_verification_token, onboarded, created_at, updated_at

restaurants
  id (PK, UUID), user_id (FK→users, CASCADE), name, slug (unique), city, phone,
  currency, language, target_languages[], ai_provider, ai_token (AES-encrypted),
  ai_model, favorites_title, logo, banner, design (JSONB), created_at, updated_at

categories
  id (PK, UUID), restaurant_id (FK→restaurants, CASCADE), name, sort_order, icon,
  translations (JSONB: {lang: {name}}), created_at, updated_at

dishes
  id (PK, UUID), category_id (FK→categories, CASCADE), name (unique per category),
  description, price (decimal), image, ingredients[], nutrition (JSONB),
  tags[], translations (JSONB: {lang: {name, description, ingredients[]}}),
  available, is_favorite, is_hidden, discount_enabled, discount_price,
  sort_order, image_generations_count, created_at, updated_at

translation_cache
  id (PK), content_hash + target_lang + field_type (unique), source_lang,
  source_text, translated_text, usage_count

feedback
  id (PK), user_id (FK→users, SET NULL), email, type (bug|suggestion|feature_request),
  title, description, photos[], status (open|in_progress|resolved|closed),
  priority (low|medium|high|critical), browser_info (JSONB)

ai_usage_logs
  id (PK), user_id (FK→users, CASCADE), restaurant_id (FK→restaurants, SET NULL),
  request_type, model, provider, prompt_tokens, completion_tokens, total_tokens,
  success, error_message, created_at
```

---

## API-эндпоинты

### Аутентификация
| Метод | Путь | Описание |
|-------|------|----------|
| POST | /api/auth/register | Регистрация (email, password, name) |
| POST | /api/auth/login | Вход (email, password) |
| POST | /api/auth/logout | Выход |
| GET | /api/auth/me | Текущий пользователь |
| PATCH | /api/auth/onboarded | Отметить onboarding пройденным |

### Рестораны (requireAuth)
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/restaurants | Рестораны текущего пользователя |
| POST | /api/restaurants | Создать ресторан |
| GET | /api/restaurants/:id | Ресторан с категориями и блюдами |
| PUT | /api/restaurants/:id | Обновить ресторан |
| DELETE | /api/restaurants/:id | Удалить ресторан |

### Категории и блюда (requireAuth)
| Метод | Путь | Описание |
|-------|------|----------|
| POST | /api/categories | Создать категорию |
| PUT | /api/categories/:id | Обновить категорию |
| DELETE | /api/categories/:id | Удалить категорию |
| POST | /api/dishes | Создать блюдо |
| PUT | /api/dishes/:id | Обновить блюдо |
| DELETE | /api/dishes/:id | Удалить блюдо |

### AI (requireAuth + rate limit 10/час)
| Метод | Путь | Описание |
|-------|------|----------|
| POST | /api/ai/analyze-text | Парсинг меню из текста |
| POST | /api/ai/analyze-pdf | Парсинг меню из PDF |
| POST | /api/ai/analyze-photo | Парсинг меню из фото |
| POST | /api/ai/generate-image | Генерация изображения блюда (Replicate) |
| POST | /api/ai/improve-description | Улучшение описания блюда |
| POST | /api/ai/test-token | Проверка AI-токена |

### Публичное меню (без авторизации)
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/public/menu/:slug | Меню ресторана |

### Админ-панель (requireAdmin)
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/admin/me | Проверка admin-роли |
| GET | /api/admin/stats | Статистика платформы |
| GET | /api/admin/users | Список пользователей (поиск, пагинация) |
| GET | /api/admin/users/:id | Детали пользователя |
| PATCH | /api/admin/users/:id | Toggle admin-роли |
| GET | /api/admin/restaurants | Все рестораны |
| GET | /api/admin/ai-logs | AI-логи (фильтры: userId, restaurantId, requestType) |
| GET | /api/admin/feedback | Все отзывы |
| PATCH | /api/admin/feedback/:id | Обновить статус/приоритет |

---

## Ключевые паттерны кода

### Backend

```typescript
// Аутентификация — requireAuth middleware проверяет session
const requireAuth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ message: "Authentication required" });
  next();
};

// CRUD через storage singleton
import { storage } from "./storage";
const restaurant = await storage.getRestaurant(id);

// AI-сервис — фабрика на основе настроек ресторана
const aiService = createAIService(apiKey, provider, model);
const result = await aiService.analyzeText(text);
// Токены: aiService.lastUsage → { promptTokens, completionTokens, totalTokens }

// Логирование AI — fire-and-forget
logAiUsage({ userId, restaurantId, requestType, model, provider, ...aiService.lastUsage });

// Error handling
const handleError = (error: unknown): string =>
  error instanceof Error ? error.message : "An unexpected error occurred";

// AI-токены шифруются AES-256-GCM перед сохранением в БД
// Sensitive поля (aiToken) не возвращаются клиенту → stripSensitiveRestaurantFields()
```

### Frontend

```typescript
// Fetch данных — useQuery с автоматическим queryFn из queryClient.ts
const { data } = useQuery({ queryKey: ["/api/restaurants"] });

// Мутации — apiRequest() добавляет CSRF-заголовок автоматически
const mutation = useMutation({
  mutationFn: (data) => apiRequest("POST", "/api/restaurants", data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] }),
});

// Авторизация — AuthGuard оборачивает приватные роуты
<Route path="/dashboard/menu"><AuthGuard><MenuManagement /></AuthGuard></Route>

// Админ — AdminGuard проверяет /api/admin/me
<Route path="/admin" component={AdminDashboard} />

// UI-компоненты — из @/components/ui/ (shadcn/ui)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Toast-уведомления
const { toast } = useToast();
toast({ title: "Успешно", description: "Ресторан создан" });
```

### Path Aliases (tsconfig.json)
```
@/*       → client/src/*
@shared/* → shared/*
```

---

## Безопасность

- **Auth**: Session-based, bcrypt 12 rounds, session regeneration on login
- **CSRF**: Custom header `X-CSRF-Protection: 1` на всех мутирующих запросах
- **CORS**: Строгая проверка origin, localhost только в dev
- **Rate limiting**: Redis-backed (global 100/15min, auth 5/10min, AI 10/hr, uploads 20/hr)
- **Encryption**: AI-токены → AES-256-GCM, пароли → bcrypt
- **XSS**: DOMPurify на фронте, Helmet headers
- **SQL injection**: Drizzle ORM параметризованные запросы
- **WebSocket**: Origin validation, per-IP/restaurant connection limits, heartbeat
- **Cookies**: httpOnly, secure (prod), sameSite: lax

---

## Переменные окружения (.env)

```bash
# Обязательные
DATABASE_URL=postgresql://user:pass@localhost:5432/qrmenu
SESSION_SECRET=<32+ символов>
REDIS_URL=redis://:password@localhost:6379

# Приложение
BASE_URL=http://localhost:5000
ALLOWED_ORIGINS=http://localhost:5000,http://localhost:3000

# Опциональные сервисы
OPENAI_API_KEY=           # AI-функции
OPENROUTER_API_KEY=       # Альтернативный AI-провайдер
REPLICATE_API_TOKEN=      # Генерация изображений
SENDGRID_API_KEY=         # Email
TELEGRAM_BOT_TOKEN=       # Telegram-уведомления
TELEGRAM_CHAT_ID=
SUPABASE_URL=             # Cloud storage
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=

# Продакшн
TRUST_PROXY=true          # Если за reverse proxy
COOKIE_SECURE=true        # HTTPS cookies
DB_POOL_MAX=25            # Connection pool
DB_POOL_MIN=5
```

---

## Миграции

Миграции лежат в `/migrations/` в формате SQL. Применяются вручную или через drizzle-kit:

```bash
# Через Docker (dev)
docker exec qrmenu-db-dev psql -U qrmenu -d qrmenu -f /dev/stdin < migrations/0007_admin_platform.sql

# Через drizzle-kit
npm run db:push           # Синхронизация schema.ts → БД
npm run db:generate       # Генерация миграции из diff
```

Миграции идемпотентны (используют `IF NOT EXISTS`, `IF EXISTS`).

---

## Команда (Slash Commands)

| Команда | Роль | Использование |
|---------|------|--------------|
| `/team-lead` | Координатор | `/team-lead добавить систему подписок` |
| `/architect` | Архитектор | `/architect спроектировать нотификации` |
| `/db-engineer` | DBA | `/db-engineer оптимизировать запросы меню` |
| `/backend` | Backend | `/backend добавить endpoint для статистики` |
| `/frontend` | Frontend | `/frontend переделать страницу настроек` |
| `/qa` | QA/Тестировщик | `/qa проверить админку на безопасность` |
| `/team` | Вся команда | `/team реализовать платёжную систему` |

---

## Важные правила

1. **Язык коммуникации**: Русский
2. **Не создавай лишних файлов** — предпочитай редактирование существующих
3. **Следуй паттернам** — useQuery/apiRequest на фронте, storage/requireAuth на бэке
4. **Валидация** — Zod на входе, Drizzle ORM параметризует запросы
5. **Не возвращай sensitive данные** клиенту (aiToken, password)
6. **AI-логирование** — каждый AI-запрос логируется через `logAiUsage()`
7. **Миграции** — при изменении schema.ts создавай SQL-миграцию в /migrations/
8. **UI** — используй существующие компоненты из `@/components/ui/`
9. **Тесты** — пока не реализованы, при создании использовать Vitest
10. **Docker** — dev-инфраструктура через `docker-compose.dev.yml`
