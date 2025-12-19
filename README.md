# QRMenu

Digital menu management system for restaurants with AI-powered features.

## Features

- AI-powered menu generation from PDF, photos, or text
- Automatic translations (Russian, English, German)
- QR code generation for menus
- Real-time menu updates via WebSocket
- Customizable design (logo, banner, colors)
- Mobile-friendly responsive design

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, Radix UI
- **Backend:** Express.js, TypeScript, Drizzle ORM
- **Database:** PostgreSQL
- **Cache:** Redis
- **Storage:** Supabase Storage (optional, falls back to local)
- **AI:** OpenAI, OpenRouter, Replicate

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/Iacob98/qrmenu.git
cd qrmenu
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start PostgreSQL and Redis

```bash
docker compose -f docker-compose.dev.yml up db redis -d
```

### 4. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env` and set:

```env
DATABASE_URL=postgresql://qrmenu:qrmenu_password@localhost:5432/qrmenu
SESSION_SECRET=your-secret-key-min-32-chars
REDIS_URL=redis://localhost:6379
```

### 5. Push database schema

```bash
npm run db:push
```

### 6. Start development server

```bash
npm run dev
```

The app will be available at http://localhost:5000

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Session encryption key (32+ chars) |
| `REDIS_URL` | No | Redis connection (defaults to localhost:6379) |
| `BASE_URL` | No | Public URL for QR codes and emails |
| `SUPABASE_URL` | No | Supabase project URL for cloud storage |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase service role key |
| `OPENAI_API_KEY` | No | OpenAI API key for AI features |
| `OPENROUTER_API_KEY` | No | OpenRouter API key |
| `REPLICATE_API_TOKEN` | No | Replicate API for image generation |
| `SENDGRID_API_KEY` | No | SendGrid for email notifications |
| `TELEGRAM_BOT_TOKEN` | No | Telegram bot for notifications |
| `TELEGRAM_CHAT_ID` | No | Telegram chat ID |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run check` | TypeScript type check |

## Docker

### Development (with hot reload)

```bash
docker compose -f docker-compose.dev.yml up
```

### Production

```bash
docker compose up -d
```

## Production Notes

Before deploying to production:

- [ ] **Reduce AI rate limit** — Change `max: 100` to `max: 10` in `server/middleware/rateLimiter.ts` (line 81)
- [ ] Set secure `SESSION_SECRET` (32+ random characters)
- [ ] Configure `ALLOWED_ORIGINS` for CORS
- [ ] Set up proper `BASE_URL` for QR codes and emails

## Future Features

- **Logo Style Transfer** — Nano Banana model (Gemini 2.5 Flash Image) supports using restaurant logo as a style reference for dish images. Can be enabled by passing `image_input` parameter with logo URL to generate branded food photos that match the restaurant's visual identity.

## License

MIT
