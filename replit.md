# Overview

This is a full-stack restaurant online menu management system in **open beta phase** that enables restaurant owners to create, manage, and share digital menus via QR codes and public links. Its core purpose is to modernize menu management, offering features like AI-powered menu generation, comprehensive design customization, and multi-language support. The project is currently being developed and tested with early adopters, with all features available free during the beta period. The platform aims to provide restaurants with a flexible, efficient, and visually appealing way to present their offerings to customers.

# User Preferences

Preferred communication style: Simple, everyday language.
AI Image Generation: Always use specified Midjourney-style flags in DALL-E prompts as requested by user.
Project Status: Open beta version with no real clients yet - all marketing content should be honest about beta status and avoid fake statistics or testimonials.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query for server state
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with CSS variables for theming, enabling extensive design customization (color schemes, typography, layout, branding).
- **Internationalization**: Full multilingual support using `react-i18next` for German, English, and Russian, with automatic browser language detection and language selector.
- **Mobile Dashboard**: Comprehensive responsive design for all dashboard pages and components, implementing a mobile-first approach.

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based using Express sessions with bcrypt password hashing.
- **File Structure**: Monorepo with shared schemas between client and server.
- **API Design**: RESTful APIs with JSON responses for all CRUD operations.

## Database Design
- **ORM**: Drizzle with PostgreSQL dialect.
- **Schema Location**: `/shared/schema.ts` for type sharing.
- **Tables**: Users, Restaurants, Categories, Dishes with UUID primary keys, timestamps, and JSONB for flexible data.
- **Performance**: Utilizes database indices for key lookups and optimized queries with JOINs to reduce database calls.

## Key Features & Design Decisions
- **Authentication System**: Session-based, with auth guard components for route protection and global user context.
- **Menu Management**: Hierarchical structure (Restaurant → Categories → Dishes) with rich dish data (images, nutrition, tags, pricing) and drag-and-drop reordering. Includes real-time updates for public menus via WebSockets.
- **AI Integration**: Integrates OpenAI and OpenRouter for AI-powered menu generation, dish description enhancement, and high-quality food photography using ComfyUI via Replicate. Supports various input methods (PDF, image analysis, text) and structured JSON output. Handles image persistence and enhances prompts for accuracy.
- **Design Customization**: Live preview system for menu appearance, color scheme management, typography and layout customization, and logo/branding integration. All design settings are properly applied to the public menu.
- **Public Menu System**: SEO-friendly public URLs with restaurant slugs, category-based navigation, mobile-responsive design, and tag-based filtering for dietary preferences. Includes sticky category navigation and enhanced category tabs.

# External Dependencies

- **@neondatabase/serverless**: PostgreSQL connection (for Neon DB, though current issues noted in original file indicate troubleshooting with standard client)
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **bcrypt**: Password hashing
- **express-session**: User session management
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library
- **OpenAI API**: For AI-powered menu generation and description enhancement
- **Replicate**: For high-quality AI food photography generation (ComfyUI workflow)
- **QR Code Generation**: Via external API or library (details not specified)
- **Sharp**: Image processing
- **react-i18next**: Internationalization framework