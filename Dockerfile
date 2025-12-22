# ==========================================
# Stage 1: Dependencies
# ==========================================
FROM node:20-alpine AS deps

WORKDIR /app

# Install dependencies for native modules (bcrypt, sharp)
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies
RUN npm ci

# ==========================================
# Stage 2: Builder
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
# - Vite builds frontend to dist/public
# - esbuild builds server to dist/index.js
RUN npm run build

# ==========================================
# Stage 3: Runner (Production)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies for native modules
RUN apk add --no-cache libc6-compat

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Copy production dependencies only
COPY --from=deps /app/node_modules ./node_modules

# Create uploads directory
RUN mkdir -p uploads && chown -R expressjs:nodejs uploads

# Copy shared schema (needed at runtime for drizzle)
COPY --from=builder /app/shared ./shared

# Switch to non-root user
USER expressjs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/init || exit 1

# Start the application
CMD ["node", "dist/index.js"]
