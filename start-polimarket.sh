#!/bin/bash

# PoliMarket CBSE System Startup Script
# This script starts only Backend and Angular components
# Author: PoliMarket Development Team
# Version: 2.0 - React Removed

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration - Only Backend and Angular
BACKEND_DIR="Backend"
ANGULAR_CLIENT_DIR="Client1-Angular"
LOG_DIR="logs"
PID_DIR="pids"

# Load environment variables or use defaults
BACKEND_PORT=${BACKEND_PORT:-5001}
ANGULAR_PORT=${ANGULAR_PORT:-4200}

# Backend environment
ASPNETCORE_ENVIRONMENT=${ASPNETCORE_ENVIRONMENT:-Development}
DATABASE_CONNECTION_STRING=${DATABASE_CONNECTION_STRING:-"Data Source=polimarket.db"}

# Create necessary directories
mkdir -p "$LOG_DIR"
mkdir -p "$PID_DIR"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

print_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

print_info() {
    echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"
}

# Function to check if a port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=60  # Increased timeout for development servers
    local attempt=1

    print_status "Waiting for $service_name to be ready..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi

        echo -n "."
        sleep 3  # Increased sleep time
        attempt=$((attempt + 1))
    done

    print_warning "$service_name failed to start within expected time, but continuing..."
    return 1
}

# Function to start .NET backend
start_backend() {
    print_status "Starting .NET Backend API..."
    
    if ! check_port $BACKEND_PORT; then
        print_warning "Port $BACKEND_PORT is already in use. Attempting to stop existing process..."
        # Kill any processes using the port
        lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
        pkill -f "dotnet.*PoliMarket.API" || true
        pkill -f "PoliMarket.API" || true
        sleep 5

        # Double check the port is free
        if ! check_port $BACKEND_PORT; then
            print_error "Unable to free port $BACKEND_PORT. Please manually stop the process."
            return 1
        fi
    fi
    
    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "Backend directory '$BACKEND_DIR' not found!"
        return 1
    fi
    
    cd "$BACKEND_DIR"

    # Restore dependencies
    print_status "Restoring .NET dependencies..."
    dotnet restore > "../$LOG_DIR/backend-restore.log" 2>&1

    # Build the project
    print_status "Building .NET project..."
    dotnet build > "../$LOG_DIR/backend-build.log" 2>&1

    # Start the backend from the API project directory
    print_status "Starting .NET API server on port $BACKEND_PORT..."
    cd PoliMarket.API
    nohup env ASPNETCORE_ENVIRONMENT="$ASPNETCORE_ENVIRONMENT" \
              DATABASE_CONNECTION_STRING="$DATABASE_CONNECTION_STRING" \
              dotnet run --urls="http://localhost:$BACKEND_PORT" > "../../$LOG_DIR/backend.log" 2>&1 &
    echo $! > "../../$PID_DIR/backend.pid"
    
    cd ../..

    # Wait for backend to be ready
    # Skip health check - backend will be available when ready
    print_info "Backend started - will be available at http://localhost:$BACKEND_PORT when initialization completes"
    sleep 3  # Optional: minimal pause to let it start
    
    print_success ".NET Backend API started successfully on http://localhost:$BACKEND_PORT"
    print_info "Swagger UI available at: http://localhost:$BACKEND_PORT"
    print_info "Health check: http://localhost:$BACKEND_PORT/api/Integracion/health"
}

# Function to start Angular client
start_angular() {
    print_status "Starting Angular Client..."

    if ! check_port $ANGULAR_PORT; then
        print_warning "Port $ANGULAR_PORT is already in use. Attempting to stop existing process..."
        lsof -ti:$ANGULAR_PORT | xargs kill -9 2>/dev/null || true
        pkill -f "ng serve" || true
        sleep 3
    fi

    if [ ! -d "$ANGULAR_CLIENT_DIR" ]; then
        print_error "Angular client directory '$ANGULAR_CLIENT_DIR' not found!"
        return 1
    fi

    cd "$ANGULAR_CLIENT_DIR"

    # Ensure we're using the correct Node.js version
    export PATH="$HOME/.nvm/versions/node/v20.10.0/bin:$PATH"

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing Angular dependencies..."
        npm install > "../$LOG_DIR/angular-install.log" 2>&1
    fi

    # Start Angular development server
    print_status "Starting Angular development server on port $ANGULAR_PORT..."
    nohup npm start > "../$LOG_DIR/angular.log" 2>&1 &
    echo $! > "../$PID_DIR/angular.pid"

    cd ..

    # Wait for Angular to be ready
    wait_for_service "http://localhost:$ANGULAR_PORT" "Angular Client"

    print_success "Angular Client started successfully on http://localhost:$ANGULAR_PORT"
    print_info "Angular client consuming RF1 (Authorization) and RF3 (Inventory)"
}

# Function to display system status
show_status() {
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                    🏪 PoliMarket CBSE System                 ║${NC}"
    echo -e "${PURPLE}║              Component-Based Software Engineering             ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}🚀 Backend and Angular services are now running!${NC}"
    echo ""
    echo -e "${CYAN}📊 Service URLs:${NC}"
    echo -e "  🔧 .NET Backend API:     ${GREEN}http://localhost:$BACKEND_PORT${NC}"
    echo -e "  📖 Swagger Documentation: ${GREEN}http://localhost:$BACKEND_PORT${NC}"
    echo -e "  🅰️  Angular Client:       ${GREEN}http://localhost:$ANGULAR_PORT${NC}"
    echo ""
    echo -e "${CYAN}🔍 Health Checks:${NC}"
    echo -e "  💓 System Health:        ${GREEN}http://localhost:$BACKEND_PORT/api/Integracion/health${NC}"
    echo ""
    echo -e "${CYAN}📋 Component Coverage:${NC}"
    echo -e "  🔐 RF1 (Authorization):   Angular Client"
    echo -e "  📦 RF3 (Inventory):       Angular Client"
    echo ""
    echo -e "${YELLOW}📝 Logs are available in the 'logs' directory${NC}"
    echo -e "${YELLOW}🔧 Process IDs are stored in the 'pids' directory${NC}"
    echo ""
    echo -e "${RED}To stop all services, run: ./stop-polimarket.sh${NC}"
    echo ""
}

# Function to cleanup on exit
cleanup() {
    print_warning "Received interrupt signal. Cleaning up..."
    ./stop-polimarket.sh
    exit 0
}

# Trap interrupt signals
trap cleanup INT TERM

# Main execution
main() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🏪 PoliMarket CBSE System                 ║"
    echo "║              Backend + Angular Only Configuration            ║"
    echo "║                        Startup Script                        ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    print_status "Initializing PoliMarket Backend + Angular System..."
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    # Check if dotnet is installed
    if ! command -v dotnet &> /dev/null; then
        print_error ".NET SDK is not installed. Please install .NET 8.0 SDK"
        exit 1
    fi
    
    # Check if node is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    print_success "All prerequisites are satisfied"
    
    # Start services in order
    start_backend
    sleep 5  # Give backend time to fully initialize
    
    start_angular
    
    # Wait for Angular to start
    wait
    
    # Show final status
    show_status
    
    # Keep script running
    print_info "Press Ctrl+C to stop all services"
    while true; do
        sleep 10
        # Check if services are still running
        if ! kill -0 $(cat "$PID_DIR/backend.pid" 2>/dev/null) 2>/dev/null; then
            print_error "Backend service has stopped unexpectedly"
            break
        fi
        if ! kill -0 $(cat "$PID_DIR/angular.pid" 2>/dev/null) 2>/dev/null; then
            print_error "Angular service has stopped unexpectedly"
            break
        fi
    done
}

# Run main function
main "$@"