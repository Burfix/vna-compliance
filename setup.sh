#!/bin/bash

# Operational Compliance Engine - Setup Script
# This script automates the initial setup process

set -e

echo "🚀 Starting Operational Compliance Engine Setup..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  
  # Generate AUTH_SECRET
  if command -v openssl &> /dev/null; then
    AUTH_SECRET=$(openssl rand -base64 32)
    # Replace placeholder in .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      sed -i '' "s|your-secret-key-here-generate-with-openssl-rand-base64-32|$AUTH_SECRET|" .env
    else
      # Linux
      sed -i "s|your-secret-key-here-generate-with-openssl-rand-base64-32|$AUTH_SECRET|" .env
    fi
    echo "✅ Generated AUTH_SECRET"
  else
    echo "⚠️  OpenSSL not found. Please manually set AUTH_SECRET in .env"
  fi
  
  echo ""
  echo "⚠️  IMPORTANT: Edit .env and set your DATABASE_URL and DIRECT_URL"
  echo "   For local Postgres, both can be the same:"
  echo "   DATABASE_URL=\"postgresql://user:password@localhost:5432/compliance_engine\""
  echo "   DIRECT_URL=\"postgresql://user:password@localhost:5432/compliance_engine\""
  echo ""
  read -p "Press Enter when DATABASE_URL and DIRECT_URL are configured..."
else
  echo "✅ .env file already exists"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔍 Verifying environment configuration..."
npm run verify:env

echo ""
echo "🗄️  Setting up database..."
echo "   Generating Prisma Client..."
npm run db:generate

echo ""
echo "   Running migrations..."
npm run db:migrate

echo ""
echo "🔍 Verifying database connection..."
npm run verify:db

echo ""
echo "🌱 Seeding database..."
npm run db:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 Next steps:"
echo "   1. Start dev server: npm run dev"
echo "   2. Open browser: http://localhost:3000"
echo "   3. Login with demo users:"
echo "      - manager@demo.com (ADMIN)"
echo "      - officer@demo.com (OFFICER)"
echo ""
echo "📚 See DEMO-SETUP.md for complete documentation"
