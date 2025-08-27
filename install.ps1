# Coffee Management System Installation Script for Windows
Write-Host "🚀 Installing Coffee Management System..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
    
    # Extract version number and check if it's 18+
    $versionNumber = [int]($nodeVersion -replace "v(\d+)\..*", '$1')
    if ($versionNumber -lt 18) {
        Write-Host "❌ Node.js version 18+ is required. Current version: $nodeVersion" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Create environment file if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creating environment file..." -ForegroundColor Yellow
    if (Test-Path ".env.local.example") {
        Copy-Item ".env.local.example" ".env.local"
    } else {
        Write-Host "⚠️  Please create .env.local file with your Firebase configuration" -ForegroundColor Yellow
    }
}

# Run type checking
Write-Host "🔍 Running type check..." -ForegroundColor Yellow
npm run type-check

Write-Host ""
Write-Host "🎉 Installation completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure your Firebase settings in .env.local" -ForegroundColor White
Write-Host "2. Set up admin user in Firebase Console" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start development server" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation: Check README.md for detailed setup instructions" -ForegroundColor Cyan
Write-Host "🌐 Development server will run on: http://localhost:3000" -ForegroundColor Cyan
