#!/bin/bash

echo "🚀 MyHealthID - Starting Backend & Frontend"
echo "=============================================="

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found!"
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running!"
    echo "Starting MongoDB..."
    
    # Try to start MongoDB (macOS)
    if command -v brew &> /dev/null; then
        brew services start mongodb-community 2>/dev/null
    fi
    
    sleep 2
fi

# Check MongoDB connection
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "❌ Failed to start MongoDB"
    echo "Please start MongoDB manually:"
    echo "  macOS: brew services start mongodb-community"
    echo "  Linux: sudo systemctl start mongod"
    exit 1
fi

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found!"
    echo "Creating .env from .env.example..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please update backend/.env with your values"
fi

# Start backend in background
echo ""
echo "🔧 Starting Backend Server..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "Backend PID: $BACKEND_PID"
sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend server started on http://localhost:5000"
else
    echo "❌ Backend failed to start. Check backend.log for details"
    exit 1
fi

# Get local IP for mobile testing
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I | awk '{print $1}')
if [ ! -z "$LOCAL_IP" ]; then
    echo "📱 For mobile device testing, update src/config/api.js:"
    echo "   BASE_URL: 'http://${LOCAL_IP}:5000/api'"
fi

echo ""
echo "📱 Starting Frontend (Expo)..."
echo "=============================================="

# Start Expo
npx expo start

# Cleanup on exit
trap "echo ''; echo '🛑 Shutting down...'; kill $BACKEND_PID 2>/dev/null; exit" INT TERM

wait
