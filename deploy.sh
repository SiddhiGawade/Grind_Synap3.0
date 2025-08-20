#!/bin/bash

# Grind Synap 3.0 - One-Click Deployment Script
echo "🚀 Starting Grind Synap 3.0 Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "git is not installed. Please install git first."
        exit 1
    fi
    
    print_success "All dependencies are installed!"
}

# Install project dependencies
install_dependencies() {
    print_status "Installing backend dependencies..."
    cd backEnd
    npm install
    if [ $? -eq 0 ]; then
        print_success "Backend dependencies installed!"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    
    print_status "Installing frontend dependencies..."
    cd ../frontEnd
    npm install
    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed!"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    
    cd ..
}

# Test local build
test_build() {
    print_status "Testing frontend build..."
    cd frontEnd
    npm run build
    if [ $? -eq 0 ]; then
        print_success "Frontend build successful!"
    else
        print_error "Frontend build failed"
        exit 1
    fi
    cd ..
}

# Deploy to platforms
deploy_backend() {
    print_status "Backend deployment instructions:"
    echo "1. Go to https://railway.app"
    echo "2. Sign up with GitHub"
    echo "3. Create new project from GitHub repo"
    echo "4. Select 'backEnd' folder as root"
    echo "5. Add environment variables from DEPLOYMENT_ENV.md"
    print_warning "Manual step required - Please complete backend deployment first"
}

deploy_frontend() {
    print_status "Frontend deployment instructions:"
    echo "1. Go to https://vercel.com"
    echo "2. Sign up with GitHub"
    echo "3. Import your repository"
    echo "4. Set root directory to 'frontEnd'"
    echo "5. Add environment variables from DEPLOYMENT_ENV.md"
    print_warning "Manual step required - Please complete frontend deployment"
}

# Main deployment process
main() {
    echo "================================================"
    echo "🎯 GRIND SYNAP 3.0 DEPLOYMENT ASSISTANT"
    echo "================================================"
    
    check_dependencies
    install_dependencies
    test_build
    
    echo ""
    echo "================================================"
    echo "🚀 READY FOR DEPLOYMENT!"
    echo "================================================"
    
    deploy_backend
    echo ""
    deploy_frontend
    
    echo ""
    echo "================================================"
    echo "✅ DEPLOYMENT SETUP COMPLETE!"
    echo "================================================"
    echo "📖 Check DEPLOYMENT_GUIDE.md for detailed instructions"
    echo "⚙️  Environment variables are in DEPLOYMENT_ENV.md"
    echo "🔗 Your app will be live after completing the manual steps"
    echo ""
    print_success "Happy coding! 🎉"
}

# Run the script
main
