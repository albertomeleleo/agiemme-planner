# Personal Growth Planner - Agiemme Planner

A comprehensive personal growth planning application with OKR (Objectives and Key Results) management, learning paths, calendar integration, and progress tracking.

## Technology Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express 4.x
- **Language**: TypeScript 5.3+
- **Database**: PostgreSQL 16
- **Authentication**: JWT (jsonwebtoken)
- **Testing**: Vitest

### Frontend
- **Framework**: React 18.2+ with Vite
- **Language**: TypeScript 5.3+
- **UI Library**: Chakra UI v2
- **Routing**: React Router DOM 6
- **HTTP Client**: Axios
- **Testing**: Vitest, Playwright, axe-core

## Project Structure

```
agiemme-planner/
├── backend/               # Backend API (Express + PostgreSQL)
│   ├── src/
│   │   ├── api/          # API routes and middleware
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   ├── lib/          # Utilities (database, crypto)
│   │   ├── migrations/   # SQL migration files
│   │   └── scripts/      # CLI scripts (migrate, seed)
│   ├── tests/            # Backend tests
│   └── package.json
├── frontend/             # Frontend React app
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client services
│   │   └── styles/       # Theme and styles
│   ├── tests/            # Frontend tests
│   └── package.json
└── README.md
```

## Quick Start with Docker 🐳 (Recommended)

**Get the entire stack running in one command!**

```bash
npm run docker:up
```

Access the app at **http://localhost:5173** ✨

- ✅ Zero configuration required
- ✅ Automatic dependency installation
- ✅ Database migrations run automatically
- ✅ Hot-reload enabled for development

**📖 Full Docker Guide**: See [README-DOCKER.md](./README-DOCKER.md) for complete Docker documentation, troubleshooting, and platform-specific notes.

---

## Manual Setup (Without Docker)

### Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL 16+
- Git

### Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd agiemme-planner
```

### 2. Setup PostgreSQL Database

Create a PostgreSQL database and user:

```sql
CREATE DATABASE agiemme_planner_dev;
CREATE USER agiemme_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE agiemme_planner_dev TO agiemme_user;
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_PASSWORD=your_password
# JWT_SECRET=your_random_secret_key

# Run database migrations
npm run migrate:up

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:3000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Available Scripts

### Backend

```bash
npm run dev              # Start development server with hot reload
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server
npm test                 # Run tests
npm run test:coverage    # Run tests with coverage
npm run lint             # Lint code
npm run type-check       # TypeScript type checking
npm run migrate:up       # Run database migrations
npm run migrate:down     # Rollback last migration
npm run migrate:status   # Show migration status
```

### Frontend

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm test                 # Run unit tests
npm run test:e2e         # Run E2E tests with Playwright
npm run test:a11y        # Run accessibility tests
npm run lint             # Lint code
npm run type-check       # TypeScript type checking
```

## Features Implemented

### Phase 3: OKR Management System (MVP)

- **User Authentication**
  - User registration with email/password
  - Login with JWT tokens
  - Protected routes

- **Objectives Management**
  - Create objectives with 2-5 key results (enforced)
  - View all objectives with filtering (category, status)
  - Update objective details
  - Delete objectives (cascades to key results)

- **Key Results Tracking**
  - Progress tracking with history
  - Automatic status updates (at-risk detection)
  - Completion percentage calculation
  - Visual progress indicators

- **Dashboard**
  - Overview of all objectives
  - Category and status filtering
  - Visual cards with progress bars

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Objectives
- `GET /api/objectives` - Get all objectives (with filters)
- `POST /api/objectives` - Create objective with key results
- `GET /api/objectives/:id` - Get objective details
- `PUT /api/objectives/:id` - Update objective
- `DELETE /api/objectives/:id` - Delete objective

### Key Results
- `GET /api/key-results/at-risk` - Get at-risk key results
- `GET /api/key-results/:id` - Get key result with progress
- `PUT /api/key-results/:id` - Update key result
- `DELETE /api/key-results/:id` - Delete key result
- `POST /api/key-results/:id/progress` - Record progress update
- `GET /api/key-results/:id/trend` - Get progress trend data

## Database Schema

### Users
- Email/password authentication
- Notification preferences (JSONB)
- Timezone settings

### Objectives
- Title, description, category
- Target date and status
- 2-5 key results (enforced via business logic)

### Key Results
- Description, target value, current value, unit
- Deadline and status (auto-updated via triggers)
- Completion percentage (computed)

### Progress Updates
- Historical tracking of key result progress
- Notes field for context
- Automatically updates key result current value (via trigger)

## Development Guidelines

### Code Quality
- TypeScript strict mode enforced
- ESLint configuration with complexity ≤10
- Prettier for code formatting
- 80% test coverage requirement

### Testing
- Unit tests with Vitest
- Integration tests for API endpoints
- E2E tests with Playwright
- Accessibility tests with axe-core

### Performance
- Queries >200ms logged as slow
- Code splitting for chunks <200KB
- Connection pooling configured
- Stateless design for horizontal scaling

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list                 # macOS

# Verify database exists
psql -U postgres -c "\l"

# Test connection
psql -U agiemme_user -d agiemme_planner_dev
```

### Port Already in Use
```bash
# Backend (port 3000)
lsof -ti:3000 | xargs kill -9

# Frontend (port 5173)
lsof -ti:5173 | xargs kill -9
```

### TypeScript Errors
```bash
# Backend
cd backend && npm run type-check

# Frontend
cd frontend && npm run type-check
```

## License

MIT

## Support

For issues and questions, please create an issue in the GitHub repository.
