#!/bin/bash

# Validation script to check if everything is working

echo "🔍 Running validation checks..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "❌ node_modules not found. Run: npm install"
  exit 1
fi
echo "✅ Dependencies installed"

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "❌ .env file not found. Run: cp .env.example .env"
  exit 1
fi
echo "✅ .env file exists"

# Check if Prisma client is generated
if [ ! -d "node_modules/.prisma" ]; then
  echo "❌ Prisma client not generated. Run: npm run db:generate"
  exit 1
fi
echo "✅ Prisma client generated"

# TypeScript check
echo ""
echo "🔧 Running TypeScript check..."
npm run typecheck
if [ $? -eq 0 ]; then
  echo "✅ TypeScript check passed"
else
  echo "❌ TypeScript errors found"
  exit 1
fi

# Build check
echo ""
echo "🏗️  Running production build..."
npm run build
if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed"
  exit 1
fi

echo ""
echo "🎉 All validation checks passed!"
echo ""
echo "Ready to deploy or run in production mode:"
echo "  npm run start"
