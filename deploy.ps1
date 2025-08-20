# Grind Synap 3.0 - Windows Deployment Script
Write-Host "🚀 Starting Grind Synap 3.0 Deployment..." -ForegroundColor Blue

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check dependencies
function Check-Dependencies {
    Write-Status "Checking dependencies..."
    
    try {
        npm --version | Out-Null
        Write-Success "npm is installed!"
    }
    catch {
        Write-Error "npm is not installed. Please install Node.js first."
        exit 1
    }
    
    try {
        git --version | Out-Null
        Write-Success "git is installed!"
    }
    catch {
        Write-Error "git is not installed. Please install git first."
        exit 1
    }
}

# Install dependencies
function Install-Dependencies {
    Write-Status "Installing backend dependencies..."
    Set-Location backEnd
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Backend dependencies installed!"
    } else {
        Write-Error "Failed to install backend dependencies"
        exit 1
    }
    
    Write-Status "Installing frontend dependencies..."
    Set-Location ..\frontEnd
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Frontend dependencies installed!"
    } else {
        Write-Error "Failed to install frontend dependencies"
        exit 1
    }
    
    Set-Location ..
}

# Test build
function Test-Build {
    Write-Status "Testing frontend build..."
    Set-Location frontEnd
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Frontend build successful!"
    } else {
        Write-Error "Frontend build failed"
        exit 1
    }
    Set-Location ..
}

# Main deployment process
function Main {
    Write-Host "================================================" -ForegroundColor Magenta
    Write-Host "🎯 GRIND SYNAP 3.0 DEPLOYMENT ASSISTANT" -ForegroundColor Magenta
    Write-Host "================================================" -ForegroundColor Magenta
    
    Check-Dependencies
    Install-Dependencies
    Test-Build
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "🚀 READY FOR DEPLOYMENT!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    
    Write-Status "Backend deployment (Railway):"
    Write-Host "1. Go to https://railway.app" -ForegroundColor White
    Write-Host "2. Sign up with GitHub" -ForegroundColor White
    Write-Host "3. Create new project from GitHub repo" -ForegroundColor White
    Write-Host "4. Select 'backEnd' folder as root" -ForegroundColor White
    Write-Host "5. Add environment variables from DEPLOYMENT_ENV.md" -ForegroundColor White
    
    Write-Host ""
    Write-Status "Frontend deployment (Vercel):"
    Write-Host "1. Go to https://vercel.com" -ForegroundColor White
    Write-Host "2. Sign up with GitHub" -ForegroundColor White
    Write-Host "3. Import your repository" -ForegroundColor White
    Write-Host "4. Set root directory to 'frontEnd'" -ForegroundColor White
    Write-Host "5. Add environment variables from DEPLOYMENT_ENV.md" -ForegroundColor White
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "✅ DEPLOYMENT SETUP COMPLETE!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "📖 Check DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Yellow
    Write-Host "⚙️  Environment variables are in DEPLOYMENT_ENV.md" -ForegroundColor Yellow
    Write-Host "🔗 Your app will be live after completing the manual steps" -ForegroundColor Yellow
    Write-Host ""
    Write-Success "Happy coding! 🎉"
}

# Run the script
Main
