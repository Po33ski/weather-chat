#!/bin/bash

# Weather Center Chat - Deployment Script
# This script helps with local testing and deployment preparation

set -e

echo "🌤️  Weather Center Chat - Deployment Helper"
echo "=========================================="

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

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check environment variables
check_env_vars() {
    print_status "Checking environment variables..."
    
    if [ -z "$VISUAL_CROSSING_API_KEY" ]; then
        print_warning "VISUAL_CROSSING_API_KEY is not set"
    else
        print_success "VISUAL_CROSSING_API_KEY is set"
    fi
    
    if [ -z "$GOOGLE_API_KEY" ]; then
        print_warning "GOOGLE_API_KEY is not set"
    else
        print_success "GOOGLE_API_KEY is set"
    fi
}

# Build and test locally
test_local() {
    print_status "Building and testing locally with Docker Compose..."
    
    # Stop any running containers
    docker-compose down
    
    # Build and start services
    docker-compose up --build -d
    
    # Wait for services to start
    print_status "Waiting for services to start..."
    sleep 30
    
    # Test backend health
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_error "Backend health check failed"
        docker-compose logs backend
        exit 1
    fi
    
    # Test frontend
    if curl -f http://localhost:3000/ > /dev/null 2>&1; then
        print_success "Frontend is accessible"
    else
        print_error "Frontend is not accessible"
        docker-compose logs frontend
        exit 1
    fi
    
    print_success "Local testing completed successfully!"
    print_status "You can now visit:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:8000"
    echo "  API Docs: http://localhost:8000/docs"
}

# Deploy to Render
deploy_render() {
    print_status "Preparing for Render deployment..."
    
    echo ""
    echo "To deploy to Render:"
    echo "1. Push your code to GitHub:"
    echo "   git add ."
    echo "   git commit -m 'Add Docker and Render configuration'"
    echo "   git push origin main"
    echo ""
    echo "2. Go to https://render.com and:"
    echo "   - Click 'New +' → 'Blueprint'"
    echo "   - Connect your GitHub repository"
    echo "   - Set environment variables:"
    echo "     * VISUAL_CROSSING_API_KEY"
    echo "     * GOOGLE_API_KEY"
    echo "   - Click 'Apply'"
    echo ""
    echo "3. Monitor the deployment in the Render dashboard"
    echo ""
    print_success "Deployment instructions provided!"
}

# Show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  test     - Test the application locally with Docker"
    echo "  deploy   - Show deployment instructions for Render"
    echo "  check    - Check prerequisites and environment"
    echo "  help     - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 test     # Test locally"
    echo "  $0 deploy   # Show deployment instructions"
    echo "  $0 check    # Check setup"
}

# Main script logic
case "${1:-help}" in
    "test")
        check_docker
        check_env_vars
        test_local
        ;;
    "deploy")
        deploy_render
        ;;
    "check")
        check_docker
        check_env_vars
        print_success "All checks completed!"
        ;;
    "help"|*)
        show_usage
        ;;
esac 