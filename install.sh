#!/bin/bash

# Coffee Management System Installation Script
echo "🚀 Installing Coffee Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -c 2-3)
if [ "$NODE_VERSION" -lt "18" ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating environment file..."
    cp .env.local.example .env.local 2>/dev/null || echo "⚠️  Please create .env.local file with your Firebase configuration"
fi

# Run type checking
echo "🔍 Running type check..."
npm run type-check

echo ""
echo "🎉 Installation completed!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your Firebase settings in .env.local"
echo "2. Set up admin user in Firebase Console"
echo "3. Run 'npm run dev' to start development server"
echo ""
echo "📚 Documentation: Check README.md for detailed setup instructions"
echo "🌐 Development server will run on: http://localhost:3000"
