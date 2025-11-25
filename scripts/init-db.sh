#!/bin/bash

# Script to initialize database tables with default data
# This script runs all initialization SQL files

echo "🚀 Initializing ACPS News Database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set it in your .env file or export it:"
    echo "  export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

echo "📝 Running site_settings initialization..."
psql "$DATABASE_URL" -f scripts/create-site-settings.sql

echo "📝 Running ads initialization..."
psql "$DATABASE_URL" -f scripts/init-ads.sql

echo "✅ Database initialization complete!"
echo ""
echo "Summary:"
echo "  - Site settings table created and populated"
echo "  - Ads table populated with sample data"
echo ""
echo "You can now run your application!"
