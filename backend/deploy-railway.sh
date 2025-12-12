#!/bin/bash
# Railway Deployment Script for MyHealthID Backend
# Run this script after getting MongoDB Atlas connection string and deploying smart contract

set -e  # Exit on error

echo "🚂 MyHealthID - Railway Deployment Script"
echo "=========================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in
echo "📝 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

# Navigate to backend directory
cd "$(dirname "$0")/.."
echo "📂 Working directory: $(pwd)"
echo ""

# Check for required environment variables
echo "🔍 Checking required environment variables..."
echo ""

read -p "MongoDB Atlas connection string (MONGODB_URI): " MONGODB_URI
if [ -z "$MONGODB_URI" ]; then
    echo "❌ MongoDB URI is required!"
    exit 1
fi

read -p "Smart contract address (CONTRACT_ADDRESS): " CONTRACT_ADDRESS
if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "⚠️  No contract address provided. You can set this later."
    CONTRACT_ADDRESS="will-be-set-after-deployment"
fi

# Read from .env for other secrets
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Loaded variables from .env file"
else
    echo "⚠️  No .env file found, using defaults"
fi

echo ""
echo "🚀 Initializing Railway project..."
railway init || echo "Project already initialized"

echo ""
echo "⚙️  Setting environment variables..."

# Core database and blockchain
railway variables set MONGODB_URI="$MONGODB_URI"
railway variables set CONTRACT_ADDRESS="$CONTRACT_ADDRESS"
railway variables set SEPOLIA_RPC_URL="https://rpc.sepolia.org"

# JWT secrets
railway variables set JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"
railway variables set JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET:-$(openssl rand -hex 64)}"

# Encryption
railway variables set ENCRYPTION_KEY="${ENCRYPTION_KEY:-$(openssl rand -hex 32)}"

# Blockchain wallet
railway variables set PRIVATE_KEY="${PRIVATE_KEY}"

# Production settings
railway variables set NODE_ENV="production"
railway variables set PORT="5002"

# Optional services (set if available)
if [ ! -z "$TWILIO_ACCOUNT_SID" ]; then
    railway variables set TWILIO_ACCOUNT_SID="$TWILIO_ACCOUNT_SID"
    railway variables set TWILIO_AUTH_TOKEN="$TWILIO_AUTH_TOKEN"
    railway variables set TWILIO_PHONE_NUMBER="$TWILIO_PHONE_NUMBER"
    echo "✅ Twilio credentials set"
fi

if [ ! -z "$WEB3_STORAGE_TOKEN" ]; then
    railway variables set WEB3_STORAGE_TOKEN="$WEB3_STORAGE_TOKEN"
    echo "✅ Web3.Storage token set"
fi

if [ ! -z "$SENTRY_DSN" ]; then
    railway variables set SENTRY_DSN="$SENTRY_DSN"
    echo "✅ Sentry DSN set"
fi

echo ""
echo "📦 Deploying to Railway..."
railway up

echo ""
echo "🌍 Getting deployment URL..."
RAILWAY_URL=$(railway domain 2>/dev/null || echo "")

if [ -z "$RAILWAY_URL" ]; then
    echo "⚠️  Could not get Railway URL automatically"
    echo "   Get it from: railway domain"
    echo "   Or visit: https://railway.app/dashboard"
else
    echo "✅ Deployment URL: $RAILWAY_URL"
    
    # Update CORS
    echo ""
    echo "🔒 Updating CORS settings..."
    railway variables set ALLOWED_ORIGINS="https://$RAILWAY_URL,http://localhost:8081"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test backend: curl https://$RAILWAY_URL/health"
echo "2. Update frontend src/config/api.js:"
echo "   const PRODUCTION_URL = 'https://$RAILWAY_URL';"
echo "3. Build APK: eas build --platform android --profile preview"
echo ""
echo "📊 View logs: railway logs"
echo "🔧 Manage project: https://railway.app/dashboard"
