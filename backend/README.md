<p>
  <a href="https://7code.ro/" target="blank"><img src="https://avatars.githubusercontent.com/u/41831998" height="100" alt="7Code Logo" /></a>
</p>

## Description

[Nest](https://github.com/nestjs/nest) + [Prisma](https://github.com/prisma/prisma) + [TypeScript](https://github.com/microsoft/TypeScript) starter repository.

### Production-ready REST API:
* Error Handling (Exception Filters)
* Logging System
* DB Seeds/Migrations
* Built-in AuthModule, using JWT. Route Guards
* Model Events Listener (onCreated, …)
* Deployable. CI/CD pipeline using Github Actions.
* Advanced ESLint/TSLint config. (e.g: auto-fix will remove unused imports)
* Shared services/constants/helpers
* Middlewares/Interceptors implementation example.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0
- **npm** or **yarn** package manager
- **PostgreSQL** database (with pgvector extension for vector support)
- **Git**

## Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd butterfast-backend
   ```

2. **Install dependencies**:
   ```bash
   # Using npm
   npm install

   # Or using yarn
   yarn install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and configure the required environment variables (see [Environment Variables](#environment-variables) section below).

4. **Set up the database**:
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev

   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the development server**:
   ```bash
   # Using npm
   npm run start:dev

   # Or using yarn
   yarn start:dev
   ```

The application will be available at `http://localhost:3001` (or the port specified in `APP_PORT`).

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Required Environment Variables

#### Database Configuration
```env
# PostgreSQL database connection string
# Format: postgresql://user:password@host:port/database?schema=public
DATABASE_URL="postgresql://user:password@localhost:5432/butterfast_meeting?schema=public"
```

#### JWT Configuration
```env
# JWT secret for token signing
JWT_SIGNATURE="your-super-secret-jwt-key-change-this-in-production"

# Access token configuration
ACCESS_TOKEN_SECRET="your-access-token-secret"
ACCESS_TOKEN_EXPIRY="7d"  # Token expiry time (e.g., 7d, 24h, 1h)

# Refresh token configuration
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
```

#### Application Configuration
```env
# Application port (default: 3001)
APP_PORT=3001

# Base URL of the application
APP_URL="http://localhost:3001"

# Application name
APP_NAME="Butterfast"

# Exchange app URL (if applicable)
EXCHANGE_APP_URL="http://localhost:3000"

# CORS allowed origins (comma-separated)
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"

# API secret key for middleware validation
API_SECRET="your-api-secret-key"
```

#### Mail Configuration
```env
# Mail service configuration
MAIL_MAILER="smtp"  # Default: smtp
MAIL_HOST="smtp.mailtrap.io"  # SMTP server host
MAIL_PORT=587  # SMTP server port
MAIL_USERNAME="your-smtp-username"
MAIL_PASSWORD="your-smtp-password"
MAIL_ENCRYPTION="tls"  # tls or ssl
MAIL_FROM_ADDRESS="info@example.com"
MAIL_FROM_NAME="Butterfast"
```

#### Backblaze B2 Storage Configuration (Optional)
```env
# Backblaze B2 credentials for file storage
B2_APPLICATION_KEY_ID="your-b2-application-key-id"
B2_APPLICATION_KEY="your-b2-application-key"
B2_BUCKET_NAME="your-b2-bucket-name"
```

#### Development/Debugging
```env
# Enable Prisma query debugging (true/false)
QUERY_DEBUG="false"
```

### Example `.env` File

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/butterfast_meeting?schema=public"

# JWT
JWT_SIGNATURE="change-this-to-a-random-secret-key-in-production"
ACCESS_TOKEN_SECRET="change-this-to-a-random-secret-key-in-production"
ACCESS_TOKEN_EXPIRY="7d"
REFRESH_TOKEN_SECRET="change-this-to-a-random-secret-key-in-production"

# Application
APP_PORT=3001
APP_URL="http://localhost:3001"
APP_NAME="Butterfast"
EXCHANGE_APP_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
API_SECRET="your-api-secret-key-here"

# Mail
MAIL_MAILER="smtp"
MAIL_HOST="smtp.mailtrap.io"
MAIL_PORT=587
MAIL_USERNAME="your-username"
MAIL_PASSWORD="your-password"
MAIL_ENCRYPTION="tls"
MAIL_FROM_ADDRESS="noreply@butterfast.com"
MAIL_FROM_NAME="Butterfast"

# Backblaze B2 (Optional)
B2_APPLICATION_KEY_ID=""
B2_APPLICATION_KEY=""
B2_BUCKET_NAME=""

# Debugging
QUERY_DEBUG="false"
```

## Running the App

```bash
# Development mode (with hot-reload)
npm run start:dev
# or
yarn start:dev

# Watch mode
npm run start:watch

# Production mode
npm run build
npm run start:prod
# or
yarn build
yarn start:prod

# Debug mode
npm run start:debug
```

## Database Management

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply a new migration
npx prisma migrate dev

# Apply migrations in production
npx prisma migrate deploy

# Push schema changes without creating migration (development only)
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed the database
npx prisma db seed
```

### Database Setup

1. **Create a PostgreSQL database**:
   ```sql
   CREATE DATABASE butterfast_meeting;
   ```

2. **Enable pgvector extension** (required for vector support):
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

3. **Run migrations**:
   ```bash
   npx prisma migrate dev
   ```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Project Structure

```
butterfast-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seed file
├── src/
│   ├── modules/               # Feature modules
│   │   ├── app/              # Main app module
│   │   ├── auth/             # Authentication module
│   │   ├── users/            # User management
│   │   ├── subscription/     # Subscription management
│   │   └── ...
│   ├── shared/               # Shared utilities
│   │   ├── configs/          # Configuration files
│   │   ├── constants/        # Constants
│   │   ├── guards/           # Route guards
│   │   ├── helpers/          # Helper functions
│   │   └── middlewares/      # Middlewares
│   └── main.ts               # Application entry point
├── .env                      # Environment variables (create this)
├── package.json
└── tsconfig.json
```

## API Documentation

Once the server is running, you can access the Swagger API documentation at:
```
http://localhost:3001/api/docs
```

## Authentication

This implementation uses `httpOnly` (server-side) cookie-based authentication. [Read more](https://dev.to/guillerbr/authentication-cookies-http-http-only-jwt-reactjs-context-api-and-node-on-backend-industry-structure-3f8e)

That means that the `JWT Token` is never stored on the client. 
Usually it was stored in `localStorage` / `sessionStorage` / `cookies` (browser), but this is not secure. 

Storing the token on a server side cookie is more secure, but it requires a small adjustment on frontend HTTP requests in order to work.

### Frontend Adjustments

* If you're using `axios` then you need to set: `withCredentials: true`. [Read more](https://flaviocopes.com/axios-credentials/)
* If you're using `fetch` then you need to set: `credentials: 'include'`. [Read more](https://github.com/github/fetch#sending-cookies)

## Code Style

Sync your IDE with project `.eslintrc.js`. 

Check `Run ESLint --fix on save`

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Check if the database exists
- Ensure pgvector extension is installed

### Port Already in Use

If port 3001 is already in use, change `APP_PORT` in your `.env` file.

### Migration Issues

If you encounter migration errors:
```bash
# Reset the database (WARNING: This will delete all data)
npx prisma migrate reset

# Or push schema without migration (development only)
npx prisma db push
```

## Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set production environment variables** in your hosting platform

3. **Run database migrations**:
   ```bash
   npx prisma migrate deploy
   ```

4. **Start the application**:
   ```bash
   npm run start:prod
   ```

## TO-DO

* Add Mail Service 
* Add [Recap.DEV](https://recap.dev/) integration - Tracing/Monitoring service
* Add Unit tests.
* Add Social Media Auth
* Add documentation for setting the GitHub Secrets for the CI/CD pipeline
* Add API Throttling - https://docs.nestjs.com/security/rate-limiting
* ...

## Stay in touch

- Author - [Igor Mardari](https://www.linkedin.com/in/igor-mardari-7code/) | [GarryOne](https://github.com/GarryOne)
- Website - [7code.ro](https://7code.ro/)
- Github - [@7codeRO](https://github.com/7codeRO/)

## License

[MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
