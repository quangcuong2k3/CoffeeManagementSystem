@echo off
echo 🚀 Coffee Management System - Admin Setup
echo ==========================================

echo.
echo 📦 Installing dotenv dependency...
npm install dotenv

echo.
echo 🔧 Setting up admin user...
node setup-admin.js

echo.
echo ✅ Setup complete!
echo.
echo 📋 Next steps:
echo 1. Start the server: npm run dev
echo 2. Visit http://localhost:3000
echo 3. Login with admin credentials from .env.local
echo.
pause
