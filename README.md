# Fitness Tracker Dashboard

A modern fitness tracking dashboard for visualizing workout, sleep, and weight data. Built with React, Material-UI, and Express.js. Optimized for Raspberry Pi deployment.

## Features

- **Workout Tracking**: View workout history with volume trends and exercise breakdowns
- **Sleep Analysis**: Track sleep duration and quality with charts
- **Weight Monitoring**: Monitor weight and body fat percentage over time
- **Interactive Dashboard**: Overview of key metrics and recent activity
- **Secure Authentication**: Password-protected access with JWT tokens
- **Responsive Design**: Works on desktop, tablet, and mobile

## Quick Start

```bash
git clone https://github.com/shiraayuki/fitness-tracker
cd fitness-tracker 
chmod +x setup.sh
./setup.sh
```

The setup script will guide you through:

1. **Database selection**:
   - **Embedded PostgreSQL** - Fresh installation with new database
   - **External PostgreSQL** - Connect to existing database (e.g., from n8n/Hevy)

2. **Admin password** - Set your dashboard login password

3. **Auto-start** - Builds and starts all Docker containers

**Access the dashboard at:** `http://localhost:8080` or `http://YOUR_IP:8080`

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18, TypeScript, Material-UI, Recharts |
| Backend | Express.js, TypeScript, PostgreSQL |
| Infrastructure | Docker, Nginx, Alpine Linux |

## Project Structure

```
fitness-tracker/
├── backend/           # Express.js API server
│   ├── src/           # TypeScript source
│   └── migrations/    # SQL database migrations
├── frontend/          # React application
│   └── src/           # TypeScript source
├── nginx/             # Reverse proxy config
├── docs/              # API documentation
├── setup.sh           # One-command setup script
├── docker-compose.yml # Embedded DB configuration
└── docker-compose.external.yml  # External DB configuration
```

## Configuration

All configuration is handled by `setup.sh`. Manual configuration:

```bash
# Edit .env file
nano .env

# Restart services
docker compose down && docker compose up -d
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DB_HOST` | Database host (external DB only) |
| `DB_PORT` | Database port (default: 5432) |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Auto-generated secret for JWT tokens |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of admin password |

## Commands

```bash
# View logs
docker compose logs -f

# Stop services
docker compose down

# Restart services
docker compose restart

# Update to latest version
git pull && docker compose up -d --build

# For external database mode, add: -f docker-compose.external.yml
docker compose -f docker-compose.external.yml logs -f
```

## Database

### Embedded Mode (Default)
- PostgreSQL runs in Docker container
- Data persisted in Docker volume
- Tables created automatically on first start

### External Mode
- Connect to existing PostgreSQL server
- Migrations run automatically to add missing tables
- Compatible with existing n8n/Hevy workout data

### Tables

| Table | Description |
|-------|-------------|
| `workouts` | Workout sessions |
| `exercises` | Exercise definitions |
| `sets` | Individual sets (weight, reps) |
| `sleep_logs` | Sleep tracking data |
| `weight_logs` | Weight/body fat tracking |

## API Documentation

See [docs/API.md](docs/API.md) for complete API reference.

**Endpoints:**
- `POST /api/auth/login` - Authenticate
- `GET /api/workouts` - List workouts
- `GET /api/workouts/:id` - Workout details
- `GET /api/exercises` - List exercises
- `GET /api/exercises/:id/progress` - Exercise progression
- `GET /api/sleep` - Sleep logs
- `GET /api/weight` - Weight logs

## External Access

See [EXTERNAL-ACCESS.md](EXTERNAL-ACCESS.md) for instructions on accessing from outside your network:

- **Tailscale** (recommended) - Easy VPN setup
- **Cloudflare Tunnel** - Public URL with HTTPS
- **Port Forwarding + DynDNS** - Traditional method

## Security

- JWT tokens expire after 24 hours
- Login rate limited (5 attempts per 15 minutes)
- Passwords hashed with bcrypt
- SQL injection prevention via parameterized queries

## Troubleshooting

**Services not starting:**
```bash
docker compose logs -f
```

**Database connection failed:**
- Check credentials in `.env`
- Ensure PostgreSQL is accessible

**Login fails:**
- Re-run `setup.sh` to reset password
- Check `ADMIN_PASSWORD_HASH` in `.env`

**Reset everything:**
```bash
docker compose down -v  # Removes data!
rm .env
./setup.sh
```

## License

MIT License
