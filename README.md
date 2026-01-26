# Pro Service

A NestJS-based microservice for managing service providers, categories, skills, reviews, payments and subscriptions. Features geolocation-based provider discovery, JWT authentication, and RabbitMQ event messaging.

## Tech Stack

- **Runtime**: Node.js 20 (Alpine)
- **Framework**: NestJS 11
- **Database**: PostgreSQL 16 with PostGIS extension
- **ORM**: TypeORM
- **Authentication**: Passport JWT
- **Message Queue**: RabbitMQ
- **Containerization**: Docker & Docker Compose

## Project Features

- ✅ Service provider management with verification status
- ✅ Geolocation-based provider discovery (PostGIS)
- ✅ Skill-to-category mapping
- ✅ Review system with star ratings and provider averages
- ✅ Soft delete support for data integrity
- ✅ JWT-based authentication with role-based access
- ✅ RabbitMQ integration for async operations
- ✅ Database migrations with TypeORM

---

## Development Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 16 with PostGIS
- Docker & Docker Compose (optional, for database)

### Installation

```bash
# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the project root:

```env
APP_ENV=staging
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=nest_db
DB_LOGGING=true
TYPEORM_LOGGING=false
TYPEORM_MIGRATIONS_RUN=true
RABBITMQ_URL=amqps://user:password@broker.example.com/vhost
RABBITMQ_EXCHANGE=exchange_name
RABBITMQ_QUEUE=default
PAYMENT_SERVICE_BASE_URL=
JWT_PUBLIC_KEY_PATH=./keys/public.pem
```

### Database Setup (Development)

Start PostgreSQL with PostGIS:

```bash
# Using Docker Compose (recommended)
docker compose -f docker-compose-dev.yaml up postgres adminer

# Or start with just postgres service
docker compose -f docker-compose-dev.yaml up postgres
```

Access Adminer (database UI): http://localhost:8080

### Run Migrations

```bash
# Generate new migration
MIGRATION_NAME=YourMigrationName npm run migration:generate

# Run pending migrations
npm run migration:run-dev

# Revert last migration
npm run migration:revert
```

### Run the Application

```bash
# Development mode (watch)
npm run start:dev

# Debug mode
npm run start:debug

# Production build
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

---

## Production Setup (Docker)

### Build and Run

```bash
# Build image and start all services
docker compose -f docker-compose.yaml up --build

# Run in background
docker compose -f docker-compose.yaml up -d --build

# Stop services
docker compose -f docker-compose.yaml down

# View logs
docker compose -f docker-compose.yaml logs -f app
```

### Environment Variables

The production Docker setup uses environment variables from your `.env` file:

```bash
# Required for RabbitMQ
RABBITMQ_URL=amqps://user:password@broker.example.com/vhost
```

### What Happens on Docker Start

1. **PostgreSQL** starts with PostGIS extension
2. **Health check** waits for PostgreSQL to be ready
3. **Adminer** (optional database UI) starts
4. **App service**:
   - Waits for PostgreSQL health check
   - Runs pending migrations automatically
   - Starts the NestJS application

### Accessing Services

- **API**: http://localhost:3000
- **Database UI (Adminer)**: http://localhost:8080
- **Database**: localhost:5432

---

## Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

---

## Code Quality

```bash
# Format code
npm run format

# Lint code
npm run lint
```

---

## Database Migrations

### Generate Migration (Dev Only)

```bash
MIGRATION_NAME=CreateUsersTable npm run migration:generate
```

This analyzes your entities and generates SQL based on changes.

### Run Migrations

```bash
# Development
npm run migration:run-dev

# Production (uses compiled dist)
npm run migration:run

# Docker automatically runs on startup
```

### Revert Migration (Dev only)

```bash
npm run migration:revert
```

---

## Project Structure

```
src/
├── auth/              # Authentication & authorization
│   ├── decorators/
│   ├── guards/
│   └── strategies/
├── categories/        # Service categories & skills
│   ├── dto/
│   ├── entities/
│   └── services/
├── common/           # Shared utilities, enums, decorators
│   ├── decorators/
│   ├── entities/
│   ├── enums/
│   └── utils/
├── config/           # Configuration files
├── database/         # TypeORM setup & migrations
│   ├── migrations/
│   └── seeders/
├── jobs/             # Job & service request management
├── messaging/        # RabbitMQ integration
├── payments/          # Payment management
├── reviews/          # Review & rating system
├── subscriptions/     # Subscriptions system
├── users/            # User, client, service provider management
├── app.module.ts     # Root module
└── main.ts          # Application entry point
```

---

## API Documentation

### Key Endpoints

#### Service Providers

```
GET    /users/service-provider/by-skill/:skillId
GET    /users/service-provider/by-category/:categoryId
GET    /users/service-provider/:id
POST   /users/service-provider
```

#### Query Parameters

```
?state=Lagos&city=Ikeja&latitude=6.557&longitude=3.396
```

Supports filtering by location (state/city) and distance-based sorting.

#### Categories

```
GET    /categories
POST   /categories
```

#### Reviews

```
POST   /reviews
GET    /reviews/:providerId
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker compose -f docker-compose.yaml ps

# View database logs
docker compose -f docker-compose.yaml logs postgres

# Restart services
docker compose -f docker-compose.yaml restart
```

### Migration Failures

```bash
# Clear and rebuild
docker compose -f docker-compose.yaml down -v
docker compose -f docker-compose.yaml up --build
```

---

## Performance Notes

- DISTINCT ON with geolocation queries requires proper indexing
- Average rating calculations use aggregation subqueries
- Profile location uses PostGIS geography type for accuracy
- Soft deletes filter deleted records in queries

---

## Support & Documentation

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [PostGIS Documentation](https://postgis.net)

---

## License

MIT
