# Overview

This is a full-stack restaurant online menu management system built with React, Express, and PostgreSQL. The application allows restaurant owners to create, manage, and share digital menus via QR codes and public links. It features AI-powered menu generation capabilities and a comprehensive design customization system.

## Recent Updates (July 30, 2025)
- ✅ **Database Integration Complete**: Successfully migrated from in-memory storage to PostgreSQL with Drizzle ORM
- ✅ **Authentication System Working**: Fixed session management and cookie handling for proper user authentication
- ✅ **Restaurant Creation Fixed**: Added dedicated modal for creating restaurants with proper form validation
- ✅ **API Endpoints Functional**: All CRUD operations working with PostgreSQL persistence
- ✅ **Login System Complete**: Created proper login page to replace placeholder alerts
- ✅ **Multi-AI Provider Support**: Added OpenRouter support alongside OpenAI with configurable models
- ✅ **Dish Photo Generation**: Added AI-powered photo generation for dishes in creation forms
- ✅ **Enhanced Settings**: Updated restaurant settings with AI provider selection and model configuration
- ✅ **Banner Upload System**: Added logo and banner support with AI generation for restaurant branding
- ✅ **File Upload System**: Added comprehensive file upload functionality with Sharp image processing and storage
- ✅ **Dish Editing System**: Complete CRUD operations for dishes with modal interface and file upload support
- ✅ **Category Editing System**: Complete CRUD operations for categories with modal interface and icon selection
- ✅ **File Upload Interface**: Removed all URL input fields from file upload components for cleaner interface
- ✅ **Public Menu Banner Display**: Fixed banner display in public menu with background overlay and proper styling
- ✅ **Database Stability**: Resolved server crashes by cleaning up storage classes and maintaining PostgreSQL connection
- ✅ **Dish Details Modal**: Added comprehensive dish details viewing in public menu with ingredients, nutrition, and tags
- ✅ **OpenAI Token Validation**: Fixed API token validation with dedicated endpoint supporting OpenAI and OpenRouter
- ✅ **Favorites & Visibility System**: Added ability to mark dishes as favorites and hide/show dishes from public menu
- ✅ **Real-time Updates**: Implemented WebSocket system for instant menu updates in guest view when admin makes changes
- ✅ **Professional Food Photography**: Enhanced AI image generation with professional photography prompts for realistic dish photos
- ✅ **Favorites as First Category**: Redesigned favorites to appear as the first category tab, always visible even when empty
- ✅ **Restaurant Creation Limit**: Added server-side validation limiting users to create maximum 1 restaurant per account
- ✅ **AI Image Generation Fixed**: Resolved DALL-E API integration issues, now working with global OPENAI_API_KEY when restaurant doesn't have custom token
- ✅ **Image Storage Fixed**: Fixed dish image saving to database - images now properly persist after AI generation and manual updates
- ✅ **Multiple Photo Upload**: Added support for uploading multiple photos for AI menu analysis with duplicate detection
- ✅ **Enhanced Photo Analysis**: Improved photo analysis workflow with progress tracking and error handling for batch processing
- ✅ **AI Image Persistence Fixed**: Fixed DALL-E generated images by downloading and saving them locally instead of using temporary URLs
- ✅ **Enhanced AI Image Prompts**: Improved DALL-E prompts to include full dish information (ingredients, tags, description) for more accurate food photography
- ✅ **Maximum Quality AI Images**: Updated DALL-E 3 settings to use HD quality and enhanced prompts for professional food photography
- ✅ **FLUX.1 Pro Integration**: Switched to FLUX.1 Pro via OpenRouter for superior image generation quality and text rendering

# User Preferences

Preferred communication style: Simple, everyday language.
AI Image Generation: Always use specified Midjourney-style flags in DALL-E prompts as requested by user.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with hot module replacement

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Express sessions with bcrypt password hashing
- **File Structure**: Monorepo with shared schemas between client and server
- **API Design**: RESTful APIs with JSON responses

## Database Design
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema Location**: `/shared/schema.ts` for type sharing
- **Tables**: Users, Restaurants, Categories, Dishes with proper foreign key relationships
- **Features**: UUID primary keys, timestamps, JSONB for flexible data (design settings, nutrition info)

# Key Components

## Authentication System
- Session-based authentication using express-session
- Password hashing with bcrypt
- Auth guard components for route protection
- User context provider for global auth state

## Menu Management
- Hierarchical structure: Restaurant → Categories → Dishes
- Rich dish data including images, nutrition facts, tags, and pricing
- Drag-and-drop reordering with sortOrder fields
- Tag-based filtering system for dietary restrictions

## AI Integration
- OpenAI GPT-4o integration for menu generation
- Multiple input methods: PDF upload, image analysis, text input
- Structured JSON output for consistent dish data
- Nutrition calculation and ingredient extraction

## Design Customization
- Live preview system for menu appearance
- Color scheme management with CSS variables
- Typography and layout customization
- Logo and branding integration

## Public Menu System
- SEO-friendly public URLs with restaurant slugs
- Category-based navigation with tab switching
- Mobile-responsive design
- Tag-based filtering for dietary preferences

# Data Flow

## User Registration & Setup
1. User registers with email/password
2. Creates restaurant profile with basic info
3. Optionally adds AI token for enhanced features
4. Sets up menu categories and dishes

## Menu Generation Workflow
1. User uploads PDF/image or enters text
2. AI service processes content and extracts menu items
3. Structured data returned with dishes, prices, descriptions
4. User reviews and selects items to add to menu
5. Items integrated into restaurant's category structure

## Public Menu Access
1. Customer scans QR code or visits public URL
2. Menu loads with restaurant branding and design
3. Categories displayed as tabs for easy navigation
4. Dishes can be filtered by dietary tags
5. Responsive design adapts to mobile devices

# External Dependencies

## Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for Neon DB
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **bcrypt**: Password hashing for security
- **express-session**: User session management

## UI Dependencies
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

## AI & External Services
- **OpenAI API**: Menu generation from various inputs
- **QR Code Generation**: Via external API or library
- **Image Processing**: For menu photo analysis

# Deployment Strategy

## Build Process
- Frontend: Vite builds optimized production bundle
- Backend: esbuild compiles TypeScript to ESM format
- Shared schemas enable type safety across frontend/backend

## Environment Configuration
- Database URL required for Drizzle connection
- Session secrets for authentication security
- AI tokens for OpenAI integration
- Replit-specific configurations for development

## Database Management
- Drizzle migrations in `/migrations` directory
- Schema changes tracked and versioned
- Push command for development database updates

## Production Considerations
- Static file serving for frontend assets
- Session store configuration for scaling
- Database connection pooling
- Error handling and logging middleware