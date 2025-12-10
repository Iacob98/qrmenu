#!/bin/sh
set -e

echo "🚀 Starting QRMenu application..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
while ! wget --spider -q http://db:5432 2>/dev/null; do
  sleep 1
done
echo "✅ Database is ready"

# Run database migrations if needed
echo "📦 Running database migrations..."
npm run db:push || echo "⚠️ Migration failed or already up to date"

# Start the application
echo "🎉 Starting server..."
exec node dist/index.js
