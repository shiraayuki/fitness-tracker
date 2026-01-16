#!/bin/bash

set -e
set +H  # Disable history expansion (fixes passwords with ! character)

echo "==================================="
echo "  Fitness Tracker Setup"
echo "==================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check for required commands
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}Error: $1 is not installed${NC}"
        echo "Please install $1 and try again."
        exit 1
    fi
}

echo "Checking requirements..."
check_command docker
check_command openssl

# Check if docker compose is available (v2 or v1)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo -e "${RED}Error: docker compose is not available${NC}"
    echo "Please install Docker Compose and try again."
    exit 1
fi

echo -e "${GREEN}All requirements met.${NC}"
echo ""

# Database choice
echo "==================================="
echo "  Database Configuration"
echo "==================================="
echo ""
echo "Choose your database setup:"
echo ""
echo -e "  ${CYAN}1)${NC} Embedded PostgreSQL (new installation)"
echo "     - Creates a new PostgreSQL container"
echo "     - All tables created automatically"
echo "     - Best for fresh installations"
echo ""
echo -e "  ${CYAN}2)${NC} External PostgreSQL (existing database)"
echo "     - Connect to your existing PostgreSQL"
echo "     - Uses your existing workout data"
echo "     - Best if you already have data from n8n/Hevy"
echo ""

while true; do
    read -p "Enter choice [1/2]: " DB_CHOICE
    case $DB_CHOICE in
        1) USE_EXTERNAL_DB=false; break;;
        2) USE_EXTERNAL_DB=true; break;;
        *) echo -e "${YELLOW}Please enter 1 or 2${NC}";;
    esac
done

echo ""

# Create .env file
echo "Creating configuration..."

if [ "$USE_EXTERNAL_DB" = true ]; then
    # External database setup
    echo ""
    echo "==================================="
    echo "  External Database Credentials"
    echo "==================================="
    echo ""

    read -p "Database Host (e.g., 192.168.188.158): " DB_HOST
    read -p "Database Port [5432]: " DB_PORT
    DB_PORT=${DB_PORT:-5432}
    read -p "Database Name [fitness]: " DB_NAME
    DB_NAME=${DB_NAME:-fitness}
    read -p "Database User: " DB_USER
    read -s -p "Database Password: " DB_PASSWORD
    echo ""

    # Test connection
    echo ""
    echo "Testing database connection..."
    if docker run --rm postgres:15-alpine pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" &> /dev/null; then
        echo -e "${GREEN}Database connection successful!${NC}"
    else
        echo -e "${YELLOW}Warning: Could not verify database connection.${NC}"
        echo "Make sure the database is accessible from this machine."
        read -p "Continue anyway? [y/N]: " CONTINUE
        if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
            echo "Setup cancelled."
            exit 1
        fi
    fi

    # Create .env for external DB
    cat > .env << EOF
# Database Configuration (External PostgreSQL)
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
USE_EXTERNAL_DB=true

# Authentication
JWT_SECRET=placeholder-will-be-generated
ADMIN_PASSWORD_HASH=placeholder-will-be-generated
TOKEN_EXPIRY=24h

# Server Configuration
NODE_ENV=production
EOF

else
    # Embedded database setup
    cat > .env << EOF
# Database Configuration (Embedded PostgreSQL)
DB_NAME=fitness
DB_USER=fitness
DB_PASSWORD=fitness123
USE_EXTERNAL_DB=false

# Authentication
JWT_SECRET=placeholder-will-be-generated
ADMIN_PASSWORD_HASH=placeholder-will-be-generated
TOKEN_EXPIRY=24h

# Server Configuration
NODE_ENV=production
EOF
fi

echo -e "${GREEN}Configuration file created${NC}"

# Generate JWT secret
echo ""
echo "Generating JWT secret..."
SECRET=$(openssl rand -base64 32)
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=$SECRET|" .env
else
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$SECRET|" .env
fi
echo -e "${GREEN}JWT_SECRET generated${NC}"

# Set admin password
echo ""
echo "==================================="
echo "  Set Admin Password"
echo "==================================="
echo ""
echo "Enter a password for the dashboard (min 8 characters):"
while true; do
    read -s ADMIN_PASSWORD
    echo ""
    if [ ${#ADMIN_PASSWORD} -lt 8 ]; then
        echo -e "${YELLOW}Password must be at least 8 characters. Try again:${NC}"
    else
        break
    fi
done

echo "Confirm password:"
read -s ADMIN_PASSWORD_CONFIRM
echo ""

if [ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD_CONFIRM" ]; then
    echo -e "${RED}Passwords don't match. Please run setup again.${NC}"
    exit 1
fi

# Generate bcrypt hash using node in a container
echo "Generating password hash..."
set +e  # Temporarily disable exit on error

# Base64 encode password to avoid shell escaping issues
PW_BASE64=$(printf '%s' "$ADMIN_PASSWORD" | base64 -w0)

HASH=$(docker run --rm -w /tmp node:20-alpine sh -c "
  cd /tmp && npm install --silent bcryptjs >/dev/null 2>&1
  node -e \"
    const bcrypt = require('/tmp/node_modules/bcryptjs');
    const pw = Buffer.from('$PW_BASE64', 'base64').toString();
    console.log(bcrypt.hashSync(pw, 10));
  \"
" 2>&1)
DOCKER_EXIT=$?
set -e  # Re-enable exit on error

if [ $DOCKER_EXIT -ne 0 ] || [ -z "$HASH" ] || [[ ! "$HASH" =~ ^\$2 ]]; then
    echo -e "${RED}Failed to generate password hash${NC}"
    echo "Error: $HASH"
    exit 1
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|ADMIN_PASSWORD_HASH=.*|ADMIN_PASSWORD_HASH=$HASH|" .env
else
    sed -i "s|ADMIN_PASSWORD_HASH=.*|ADMIN_PASSWORD_HASH=$HASH|" .env
fi
echo -e "${GREEN}Admin password hash generated${NC}"

echo ""
echo "==================================="
echo "  Starting Services"
echo "==================================="
echo ""

# Build and start containers
echo "Building and starting Docker containers..."
echo "This may take a few minutes on first run..."
echo ""

if [ "$USE_EXTERNAL_DB" = true ]; then
    # Start without postgres service (external DB)
    $DOCKER_COMPOSE -f docker-compose.external.yml up -d --build
else
    # Start with embedded postgres
    $DOCKER_COMPOSE up -d --build
fi

echo ""
echo "Waiting for services to be ready..."
sleep 5

# Run migrations for external DB (embedded DB runs them via init script)
if [ "$USE_EXTERNAL_DB" = true ]; then
    echo ""
    echo "Running database migrations..."
    # Source the .env file to get credentials
    source .env

    # Run migrations using a temporary container
    for migration in backend/migrations/*.sql; do
        if [ -f "$migration" ]; then
            echo "  Applying $(basename $migration)..."
            docker run --rm \
                -e PGPASSWORD="$DB_PASSWORD" \
                -v "$(pwd)/$migration:/migration.sql:ro" \
                postgres:15-alpine \
                psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f /migration.sql -q 2>/dev/null || true
        fi
    done
    echo -e "${GREEN}Migrations completed${NC}"
fi

# Check if services are running
echo ""
if $DOCKER_COMPOSE ps | grep -q "fitness-backend.*running\|fitness-backend.*Up"; then
    echo -e "${GREEN}Backend is running${NC}"
else
    echo -e "${YELLOW}Backend is starting...${NC}"
fi

if $DOCKER_COMPOSE ps | grep -q "fitness-frontend.*running\|fitness-frontend.*Up"; then
    echo -e "${GREEN}Frontend is running${NC}"
else
    echo -e "${YELLOW}Frontend is starting...${NC}"
fi

if [ "$USE_EXTERNAL_DB" = false ]; then
    if $DOCKER_COMPOSE ps | grep -q "fitness-postgres.*running\|fitness-postgres.*Up"; then
        echo -e "${GREEN}Database is running${NC}"
    else
        echo -e "${YELLOW}Database is starting...${NC}"
    fi
else
    echo -e "${GREEN}Using external database at ${DB_HOST}:${DB_PORT}${NC}"
fi

# Get local IP
LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

echo ""
echo "==================================="
echo -e "  ${GREEN}Setup Complete!${NC}"
echo "==================================="
echo ""
echo "Your Fitness Tracker is now running!"
echo ""
echo "Access the dashboard at:"
echo -e "  Local:   ${GREEN}http://localhost:8080${NC}"
echo -e "  Network: ${GREEN}http://${LOCAL_IP}:8080${NC}"
echo ""
echo "Login with the password you set during setup."
echo ""
echo "Useful commands:"
if [ "$USE_EXTERNAL_DB" = true ]; then
    echo "  View logs:     $DOCKER_COMPOSE -f docker-compose.external.yml logs -f"
    echo "  Stop:          $DOCKER_COMPOSE -f docker-compose.external.yml down"
    echo "  Restart:       $DOCKER_COMPOSE -f docker-compose.external.yml restart"
else
    echo "  View logs:     $DOCKER_COMPOSE logs -f"
    echo "  Stop:          $DOCKER_COMPOSE down"
    echo "  Restart:       $DOCKER_COMPOSE restart"
fi
echo ""
echo "For external access setup, see: EXTERNAL-ACCESS.md"
echo ""
