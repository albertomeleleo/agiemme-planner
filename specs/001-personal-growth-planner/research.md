# Technology Stack Research: Personal Growth Planner

**Branch**: `001-personal-growth-planner` | **Date**: 2025-12-28 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Executive Summary

This document provides comprehensive technology stack recommendations for the Personal Growth Planner web application based on the project's requirements for a single-user, desktop-focused OKR management system with learning path tracking, calendar integration, and progress dashboards.

**Recommended Stack**:
- **Language**: TypeScript
- **Frontend**: React with Vite
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Design System**: Chakra UI
- **Testing**: Vitest (unit), Playwright (E2E), axe-core (accessibility)
- **Email**: Nodemailer with SMTP
- **Calendar**: FullCalendar

---

## 1. Language/Version Selection

### Decision: TypeScript 5.3+

**Rationale**:
- **Type Safety**: Enforces constitution requirement for "TypeScript interfaces or equivalent type definitions" for all public APIs (Code Quality Standards, Section I)
- **Single Language Full-Stack**: Enables code sharing between frontend/backend (shared types, validation schemas, utilities), reducing duplication and bugs
- **Developer Experience**: Superior IDE support, refactoring confidence, and inline documentation through types
- **Ecosystem Maturity**: Massive npm ecosystem for both frontend (React, Vue) and backend (Express, Fastify) needs
- **Performance**: V8 engine (Node.js) easily meets <200ms read, <500ms write API requirements
- **Constitution Compliance**: Directly supports "No use of `any` type" requirement with strict TypeScript configuration
- **Maintainability**: Self-documenting code through type definitions aligns with Code Quality Standards

**Alternatives Considered**:

| Alternative | Why Rejected |
|------------|--------------|
| **JavaScript (vanilla)** | Cannot enforce type safety required by constitution; high risk of runtime errors; requires JSDoc comments for limited type hints |
| **Python (FastAPI/Django)** | Excellent for backend but creates language split requiring duplicate type definitions for frontend; no code sharing; longer backend response times (~50-100ms slower than Node.js for simple CRUD) |
| **Go** | Superior performance but overkill for single-user app; limited frontend options (would still need JS/TS for web UI); steeper learning curve |
| **Rust** | Extreme performance but unnecessary complexity for this use case; would require JS/TS frontend anyway; much slower development velocity |

**Best Practices**:
- **Strict Mode**: Enable `strict: true` in tsconfig.json with `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`
- **Shared Types**: Create `@types` package for shared interfaces between frontend/backend (User, Objective, KeyResult, LearningPath, CalendarEvent, ProgressUpdate)
- **Path Aliases**: Configure `@/` aliases for cleaner imports (`import { Objective } from '@/types'` instead of `../../types`)
- **Versioning**: Use TypeScript 5.3+ for latest features (decorators, const type parameters, import attributes)
- **Build Tooling**: Use `tsc` for type checking in CI/CD, bundle with Vite/esbuild for optimal performance
- **Linting**: ESLint with `@typescript-eslint` plugin to catch type-related issues beyond tsc
- **No `any` Tracking**: If `any` is unavoidable, add `// TODO: [TICKET-123] Replace any with proper type` and track in issue tracker

---

## 2. Frontend Framework

### Decision: React 18.2+ with Vite

**Rationale**:
- **Design System Ecosystem**: Largest selection of accessible component libraries (Chakra UI, Radix UI, Material-UI, Ant Design) - critical for meeting WCAG 2.1 Level AA requirements
- **Performance**: React 18's concurrent rendering, Suspense, and automatic batching help meet Web Vitals targets (LCP ≤2.5s, FID ≤100ms, INP ≤200ms)
- **Vite Build Tool**:
  - Lightning-fast HMR (<50ms) for development velocity
  - Rollup-based production builds easily meet <200KB JS budget (tree-shaking, code-splitting)
  - Native ESM support reduces bundle size
  - Built-in TypeScript support without configuration
- **Testing Ecosystem**: Vitest (Vite-native, 10x faster than Jest), React Testing Library (accessibility-first), Playwright (E2E with built-in accessibility audits)
- **Accessibility Tooling**: `eslint-plugin-jsx-a11y`, `@axe-core/react`, React Testing Library's accessibility queries
- **State Management**: Multiple options (Context API for simple state, Zustand/Jotai for complex, TanStack Query for server state) - flexibility for different complexity levels
- **Calendar Integration**: FullCalendar has excellent React integration, meets accessibility requirements
- **Community**: Largest frontend ecosystem, extensive documentation, mature best practices

**Alternatives Considered**:

| Alternative | Why Rejected |
|------------|--------------|
| **Vue 3** | Smaller accessible component library ecosystem (Vuetify, PrimeVue vs 10+ mature React options); fewer accessibility testing tools; learning curve for Composition API not justified for single-developer project |
| **Angular 17** | Heavyweight framework (harder to meet <200KB JS budget); steeper learning curve; slower build times than Vite; opinionated architecture may be overkill for ~15 screens |
| **Svelte/SvelteKit** | Excellent performance but immature accessibility component ecosystem; fewer WCAG-compliant libraries; smaller talent pool for future maintenance |
| **Next.js** | Excellent SSR framework but unnecessary complexity for single-user desktop app (no SEO requirements, no server-side rendering benefits); adds deployment complexity; Vite is simpler and faster for SPA use case |
| **Solid.js** | Superior reactivity performance but very small ecosystem; limited accessible component libraries; higher risk for long-term maintenance |

**Best Practices**:
- **Code Splitting**: Use `React.lazy()` and route-based splitting to keep initial bundle <200KB
  ```typescript
  const OKRDashboard = lazy(() => import('@/pages/OKRDashboard'));
  const LearningPaths = lazy(() => import('@/pages/LearningPaths'));
  ```
- **Performance Monitoring**: Integrate `web-vitals` library to track LCP, FID, CLS, INP in production
- **Accessibility**:
  - Use semantic HTML first, ARIA only when necessary
  - Test with `axe-core` in CI/CD (`vitest-axe` integration)
  - Manual keyboard navigation testing (Tab, Enter, Esc, Arrow keys)
  - Screen reader testing with NVDA/JAWS/VoiceOver for P1 user stories
- **State Management**:
  - TanStack Query for server state (API caching, optimistic updates)
  - Zustand for client state (UI state, user preferences)
  - Avoid Redux complexity unless needed
- **Component Organization**:
  ```
  components/
  ├── okr/           # Domain-specific components
  ├── learning/
  ├── calendar/
  ├── progress/
  └── shared/        # Reusable primitives (Button, Input, Modal)
  ```
- **Bundle Budget**: Configure Vite `build.rollupOptions.output.manualChunks` to split vendor libraries
- **Lighthouse CI**: Run on every PR, enforce score ≥90
- **React 18 Features**: Use Suspense for code-splitting loading states, useTransition for non-blocking updates

---

## 3. Backend Framework

### Decision: Node.js 20 LTS with Express 4.x

**Rationale**:
- **Language Consistency**: JavaScript/TypeScript full-stack eliminates context switching, enables type sharing
- **Performance**:
  - Node.js event loop handles I/O-bound operations (database queries, email sending) efficiently
  - Easily meets <200ms reads, <500ms writes with proper database indexing
  - Cluster mode enables horizontal scaling per constitution's stateless design requirement
- **Simplicity**: Express is minimalist, unopinionated - perfect for ~50-100 API endpoints without framework overhead
- **Middleware Ecosystem**: Vast npm ecosystem for authentication, validation, rate limiting, CORS, compression
- **TypeScript Support**: Excellent with `@types/express`, `@types/node`
- **Testing**: Supertest for HTTP endpoint testing, works seamlessly with Vitest
- **Database Drivers**: Mature PostgreSQL drivers (node-postgres, Prisma ORM)
- **Email Integration**: Nodemailer for SMTP, easy SendGrid/Mailgun integration if needed
- **Background Jobs**: BullMQ or node-cron for email notifications, report generation >5s
- **Deployment**: Widely supported (Vercel, Railway, Render, AWS, Docker)

**Alternatives Considered**:

| Alternative | Why Rejected |
|------------|--------------|
| **FastAPI (Python)** | Excellent performance (~10-20% faster than Node.js) but creates language split; no type sharing with React frontend; requires separate type generation (OpenAPI -> TypeScript); Python async ecosystem less mature than Node.js streams |
| **Django (Python)** | Heavyweight ORM and admin panel unnecessary for single-user app; slower than FastAPI/Express; same language split issues as FastAPI |
| **Fastify (Node.js)** | ~20% faster than Express but learning curve not justified; smaller ecosystem; Express simplicity preferred for straightforward CRUD API |
| **NestJS (Node.js)** | Angular-inspired architecture too heavy for ~50-100 endpoints; opinionated structure adds complexity; longer build times; Express simplicity preferred |
| **Go (Gin/Echo)** | Superior performance but language split with frontend; requires protocol buffer/OpenAPI for type sharing; overkill for single-user app performance needs |
| **Bun** | Emerging runtime with great performance but ecosystem immaturity risk; limited production battle-testing; Node.js 20 LTS preferred for stability |

**Best Practices**:
- **Project Structure**:
  ```typescript
  src/
  ├── models/          // TypeScript interfaces + DB schemas
  ├── routes/          // Express route handlers (okrs.ts, learning.ts, calendar.ts)
  ├── services/        // Business logic (okrService.ts, learningService.ts)
  ├── middleware/      // Auth, validation, error handling, rate limiting
  ├── jobs/            // Background jobs (emailNotifications.ts, reportGeneration.ts)
  ├── lib/             // Utilities (email.ts, validation.ts, db.ts)
  └── server.ts        // Express app initialization
  ```
- **Request Validation**: Use Zod or Yup for runtime schema validation (complements TypeScript compile-time checks)
- **Error Handling**: Centralized error middleware, structured error responses
  ```typescript
  app.use((err, req, res, next) => {
    logger.error(err);
    res.status(err.statusCode || 500).json({
      error: err.message,
      code: err.code,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });
  ```
- **Logging**: Use Pino or Winston with structured JSON logging for APM integration
- **Rate Limiting**: `express-rate-limit` to prevent abuse (e.g., 100 requests/15min per IP)
- **Compression**: `compression` middleware for response gzipping
- **CORS**: Configure `cors` middleware for frontend origin
- **Security**: Helmet.js for security headers, express-validator for input sanitization
- **Database Connection**: Pool management with retry logic, graceful shutdown
- **Performance Monitoring**: Use `express-status-monitor` or integrate with APM (New Relic, Datadog)
- **API Documentation**: Generate OpenAPI spec from Zod schemas or JSDoc annotations
- **Health Checks**: `/health` endpoint for load balancer readiness checks
- **Graceful Shutdown**: Handle SIGTERM/SIGINT to close connections before exit

---

## 4. Database

### Decision: PostgreSQL 16

**Rationale**:
- **Relational Data Model**: Perfect fit for OKR relationships (Objective → Key Results → Progress Updates), Learning Path hierarchies (Path → Resources), Calendar Event linkages
- **ACID Compliance**: Guarantees zero data loss per SC-009 requirement
- **Referential Integrity**: Foreign key constraints prevent orphaned records (e.g., deleting Objective cascades to Key Results)
- **Complex Queries**: SQL is ideal for progress tracking aggregations, trend analysis, date-range filtering
  - Example: "Show all Key Results behind schedule" = `WHERE deadline < NOW() AND progress_percentage < expected_progress`
  - Example: "Calculate time invested this week" = `SUM(duration) FROM calendar_events WHERE completed = true AND date >= start_of_week`
- **Indexing**: B-tree indexes easily meet <200ms read requirement for typical queries
- **JSON Support**: `JSONB` columns for flexible metadata (recurrence patterns, user preferences) without schema migrations
- **Date/Time Handling**: Native timezone support critical for FR-020 calendar reminders, handles DST correctly
- **Full-Text Search**: Built-in search for finding objectives, learning resources by keywords
- **Mature Ecosystem**:
  - Node.js: `node-postgres` (low-level), Prisma (ORM with TypeScript types auto-generation)
  - Migration tools: Prisma Migrate, node-pg-migrate
  - Backup/recovery tools: pg_dump, pg_restore
- **Scalability**: Read replicas, connection pooling (PgBouncer), horizontal partitioning if needed (unlikely for single-user)
- **Open Source**: No vendor lock-in, free hosting (Neon, Supabase, Railway free tiers)

**Alternatives Considered**:

| Alternative | Why Rejected |
|------------|--------------|
| **MongoDB** | Document model poor fit for highly relational data (Objective → Key Results → Progress Updates); weak consistency model risks data loss; no foreign key constraints; aggregation pipeline complex for progress queries; overkill schema flexibility for structured OKR data |
| **SQLite** | Single-file database simplicity appealing but lacks network access (can't scale to multiple backend instances); weak concurrency (writes lock entire database); no native JSON query functions; poor choice for production web app despite good for prototyping |
| **MySQL** | Viable alternative but PostgreSQL superior: better JSON support, more advanced indexing (partial, expression indexes), superior full-text search, better SQL compliance, more active development |
| **Firebase Firestore** | Real-time sync unnecessary for single-user desktop app; NoSQL model poor fit for relational OKR data; vendor lock-in; expensive at scale; limited query capabilities (no joins, complex aggregations) |
| **Supabase** | Actually PostgreSQL-based but adds unnecessary real-time layer and auth complexity; prefer vanilla PostgreSQL for control and simplicity; can always migrate to Supabase later if real-time needed |

**Schema Design**:

```sql
-- Core entities aligned with spec.md Key Entities

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- career, health, relationships, skills, financial, personal
  target_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, completed, archived
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0,
  unit VARCHAR(50) NOT NULL, -- e.g., "certifications", "projects", "%", "hours"
  deadline DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'in_progress', -- not_started, in_progress, completed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE progress_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_result_id UUID NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
  value DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  estimated_hours DECIMAL(5,1),
  status VARCHAR(20) DEFAULT 'active', -- active, completed, archived
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE learning_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- book, course, article, video, practice_project
  reference TEXT, -- URL or other reference
  estimated_hours DECIMAL(5,1),
  sequence_order INT NOT NULL,
  status VARCHAR(20) DEFAULT 'not_started', -- not_started, in_progress, completed
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Many-to-many: learning paths can support multiple key results
CREATE TABLE learning_path_key_results (
  learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  key_result_id UUID REFERENCES key_results(id) ON DELETE CASCADE,
  PRIMARY KEY (learning_path_id, key_result_id)
);

CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  recurrence_pattern JSONB, -- {type: "weekly", interval: 1, daysOfWeek: [2,4], endDate: "2025-12-31"}
  learning_resource_id UUID REFERENCES learning_resources(id) ON DELETE SET NULL,
  key_result_id UUID REFERENCES key_results(id) ON DELETE SET NULL,
  category VARCHAR(50), -- matches objective category for color-coding
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, cancelled
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance (<200ms reads)
CREATE INDEX idx_objectives_user_id ON objectives(user_id);
CREATE INDEX idx_objectives_status ON objectives(status);
CREATE INDEX idx_key_results_objective_id ON key_results(objective_id);
CREATE INDEX idx_key_results_deadline ON key_results(deadline);
CREATE INDEX idx_progress_updates_key_result_id ON progress_updates(key_result_id);
CREATE INDEX idx_learning_resources_path_id ON learning_resources(learning_path_id);
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);
```

**Best Practices**:
- **ORM**: Prisma for type-safe queries, auto-generated TypeScript types from schema
  ```typescript
  // Prisma auto-generates this from schema
  const objective = await prisma.objective.findUnique({
    where: { id },
    include: { keyResults: true } // Type-safe include
  });
  ```
- **Migrations**: Use Prisma Migrate for version-controlled schema changes
- **Connection Pooling**: Configure pool size based on expected concurrency (start with 10-20 connections)
- **Query Optimization**:
  - Use `EXPLAIN ANALYZE` to verify index usage
  - Avoid N+1 queries with `include` (Prisma) or JOIN queries
  - Use database-level aggregations instead of fetching all records to app
- **Backups**: Automated daily backups with point-in-time recovery
- **Transactions**: Use for multi-table operations (e.g., creating Objective + Key Results atomically)
  ```typescript
  await prisma.$transaction([
    prisma.objective.create({ data: objectiveData }),
    prisma.keyResult.createMany({ data: keyResultsData })
  ]);
  ```
- **Soft Deletes**: Consider `deleted_at` column instead of hard deletes for audit trail
- **Timestamps**: Always include `created_at`, `updated_at` with triggers for auto-update
- **UUID vs Serial**: UUIDs prevent ID enumeration attacks, better for distributed systems

---

## 5. Design System

### Decision: Chakra UI v2

**Rationale**:
- **Accessibility First**: Built-in WCAG 2.1 Level AA compliance
  - All components keyboard accessible out-of-box
  - Proper ARIA attributes, focus management, screen reader support
  - Color contrast meets 4.5:1 requirement (customizable theme tokens)
  - Works seamlessly with `@axe-core/react` for automated testing
- **TypeScript Native**: Full TypeScript support, excellent IntelliSense
- **Component Coverage**: Comprehensive library covers all needed components:
  - Forms: Input, Select, Checkbox, Radio, Switch, Textarea (all accessible)
  - Layout: Box, Flex, Grid, Stack, Container (8px spacing system built-in)
  - Data Display: Table, Badge, Tag, Card, Stat (progress dashboards)
  - Overlays: Modal, Drawer, Tooltip, Popover (user feedback)
  - Navigation: Tabs, Breadcrumb, Menu, Link
  - Feedback: Toast, Alert, Progress, Spinner (loading states)
- **Theming System**:
  - Design tokens for colors, typography, spacing align perfectly with constitution UX requirements
  - 8px base spacing unit system (`space` tokens: 1=4px, 2=8px, 4=16px, etc.)
  - Color modes (light/dark) built-in for potential future dark mode
- **Performance**:
  - Tree-shakeable, only import used components
  - CSS-in-JS with Emotion (runtime but optimized, ~30KB gzipped)
  - Meets <200KB JS budget when combined with code-splitting
- **Developer Experience**: Excellent documentation, active community, frequent updates
- **Responsive Design**: Built-in responsive prop syntax (`fontSize={{ base: "md", lg: "lg" }}`)

**Alternatives Considered**:

| Alternative | Why Rejected |
|------------|--------------|
| **Material-UI (MUI)** | Excellent accessibility but heavier bundle size (~80KB vs Chakra's 30KB); Material Design opinion may not fit "personal growth" aesthetic; more verbose API; licensing concerns (MUI X components require paid license for some features) |
| **Radix UI** | Superior accessibility primitives but unstyled (requires custom CSS); more work to build design system; better for design-heavy apps, but overkill when Chakra provides styled + accessible components ready-to-use |
| **Ant Design** | Good component coverage but weaker accessibility (known ARIA issues); heavier bundle; more enterprise/admin aesthetic less suitable for personal app; documentation less comprehensive |
| **Headless UI** | Excellent accessibility (by Tailwind team) but unstyled; requires Tailwind CSS setup; more configuration than Chakra's batteries-included approach |
| **shadcn/ui** | Trendy copy-paste component system but requires manual setup; not a library (no npm package); lacks cohesive theming; better for highly custom designs |

**Implementation Example**:

```typescript
// Theme configuration (theme.ts)
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      500: '#2196f3', // Primary color
      600: '#1e88e5',
      900: '#0d47a1',
    },
    career: { 500: '#4caf50' },      // Category colors for OKRs
    health: { 500: '#ff9800' },
    relationships: { 500: '#e91e63' },
    skills: { 500: '#9c27b0' },
  },
  fonts: {
    heading: '"Inter", sans-serif',
    body: '"Inter", sans-serif',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
  space: {
    // 8px base unit: 1=8px, 2=16px, 3=24px, 4=32px
    px: '1px',
    0.5: '0.125rem',
    1: '0.5rem',   // 8px
    2: '1rem',     // 16px
    3: '1.5rem',   // 24px
    4: '2rem',     // 32px
    // ...
  },
});

// Usage in components
import { Box, Heading, Progress, VStack } from '@chakra-ui/react';

function KeyResultCard({ keyResult }: { keyResult: KeyResult }) {
  return (
    <Box
      p={4}                    // 32px padding (8px * 4)
      bg="white"
      borderRadius="md"
      boxShadow="sm"
      borderWidth="1px"
      _hover={{ boxShadow: 'md' }}
      role="article"          // Accessibility: semantic role
      aria-label={`Key result: ${keyResult.description}`}
    >
      <VStack align="stretch" spacing={2}>
        <Heading as="h3" size="md">
          {keyResult.description}
        </Heading>
        <Progress
          value={keyResult.progress_percentage}
          colorScheme={keyResult.progress_percentage >= 75 ? 'green' : 'blue'}
          hasStripe
          isAnimated
          aria-label={`${keyResult.progress_percentage}% complete`}
        />
      </VStack>
    </Box>
  );
}
```

**Best Practices**:
- **Custom Theme**: Define brand colors, spacing scale, typography in `theme.ts`
- **Component Composition**: Use `Stack`, `Flex`, `Grid` for layouts instead of custom CSS
- **Responsive Props**: Use object syntax for breakpoints
  ```typescript
  <Box fontSize={{ base: 'sm', md: 'md', lg: 'lg' }} />
  ```
- **Color Contrast**: Test theme colors with Chakra's contrast checker or manual tools
- **Focus Indicators**: Customize `_focus` styles to meet 2px outline, 3:1 contrast requirement
- **Semantic HTML**: Use proper heading hierarchy (`<Heading as="h1">`, `<Heading as="h2">`)
- **Loading States**: Use `Skeleton` components for content placeholders during async operations
- **Empty States**: Create custom `EmptyState` component with Chakra primitives
- **Form Validation**: Use `FormControl`, `FormLabel`, `FormErrorMessage` for accessible forms
- **Toast Notifications**: Configure global toast provider for user feedback
- **Dark Mode**: Configure if needed, Chakra's `useColorMode` hook makes it trivial

---

## 6. Testing Stack

### Decision: Vitest + Playwright + axe-core

#### Unit & Integration Testing: Vitest

**Rationale**:
- **Vite Native**: Shares Vite config, 10x faster than Jest (no Babel transform needed)
- **Jest Compatible**: Drop-in Jest replacement, same API (`describe`, `it`, `expect`)
- **ESM Support**: Native ES modules, no configuration gymnastics
- **TypeScript**: Zero-config TypeScript support
- **Coverage**: Built-in c8 coverage tool, meets 80% threshold easily
- **Speed**: <5s test suite execution per constitution requirement (Vitest is ~2-3s for 100 tests)
- **Watch Mode**: Instant re-runs on file save (HMR-like test experience)
- **Ecosystem**: Works with React Testing Library, MSW (API mocking)

**Usage**:
```typescript
// Unit test example (services/okrService.test.ts)
import { describe, it, expect, vi } from 'vitest';
import { createObjective } from './okrService';
import { db } from '@/lib/db';

vi.mock('@/lib/db');

describe('OKR Service', () => {
  it('creates objective with key results', async () => {
    const mockObjective = { id: '123', title: 'Career Growth' };
    vi.mocked(db.objective.create).mockResolvedValue(mockObjective);

    const result = await createObjective({
      title: 'Career Growth',
      category: 'career',
      keyResults: [{ description: 'Complete 3 certs', target: 3 }]
    });

    expect(result).toEqual(mockObjective);
    expect(db.objective.create).toHaveBeenCalledWith(/* ... */);
  });
});

// Component test (components/KeyResultCard.test.tsx)
import { render, screen } from '@testing-library/react';
import { KeyResultCard } from './KeyResultCard';

describe('KeyResultCard', () => {
  it('displays progress percentage accessibly', () => {
    render(<KeyResultCard keyResult={{ description: 'Test', progress: 75 }} />);

    expect(screen.getByRole('article')).toHaveAttribute('aria-label', 'Key result: Test');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  });
});
```

#### E2E Testing: Playwright

**Rationale**:
- **Cross-Browser**: Tests in Chromium, Firefox, WebKit (Safari) - catches browser-specific issues
- **Auto-Waiting**: Smart waits for elements, network requests - no flaky tests from manual sleeps
- **Debugging**: Excellent debug UI, trace viewer, time-travel debugging
- **Accessibility Built-in**: Can run axe-core audits within E2E tests
- **Fast**: Parallel test execution, ~2-3 minutes for full E2E suite
- **TypeScript**: First-class TypeScript support
- **Modern**: Better API than Selenium/Cypress, actively developed by Microsoft
- **CI/CD**: Easy GitHub Actions integration, built-in reporters (HTML, JSON, JUnit)

**Usage**:
```typescript
// E2E test (tests/e2e/okr-creation.spec.ts)
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('User Story 1 - Set Annual Growth Goals with OKRs', () => {
  test('creates objective with key results', async ({ page }) => {
    await page.goto('/okrs');

    // Create objective
    await page.getByRole('button', { name: 'New Objective' }).click();
    await page.getByLabel('Title').fill('Advance my career in software engineering');
    await page.getByLabel('Category').selectOption('career');

    // Add key results
    await page.getByRole('button', { name: 'Add Key Result' }).click();
    await page.getByLabel('Key Result 1').fill('Complete 3 certifications');
    await page.getByLabel('Target').fill('3');

    await page.getByRole('button', { name: 'Save' }).click();

    // Verify creation
    await expect(page.getByRole('heading', { name: 'Advance my career' })).toBeVisible();
    await expect(page.getByText('Complete 3 certifications')).toBeVisible();
  });

  test('meets WCAG 2.1 Level AA', async ({ page }) => {
    await page.goto('/okrs');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

#### Accessibility Testing: axe-core

**Rationale**:
- **Industry Standard**: Deque's axe-core is gold standard for automated accessibility testing
- **WCAG Compliance**: Catches ~60% of WCAG violations automatically (manual testing still required for 40%)
- **CI/CD Integration**: Can fail builds on accessibility violations
- **Multiple Integrations**:
  - `vitest-axe` for component testing
  - `@axe-core/playwright` for E2E testing
  - `@axe-core/react` for development-time warnings
- **Detailed Reports**: Identifies specific WCAG criteria violated, provides remediation guidance

**Usage**:
```typescript
// Component accessibility test
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'vitest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('OKRDashboard has no violations', async () => {
    const { container } = render(<OKRDashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

**Full Testing Stack Summary**:

| Test Type | Tool | Purpose | Constitution Requirement |
|-----------|------|---------|-------------------------|
| **Unit** | Vitest + React Testing Library | Business logic, components | 80% coverage, <5s execution |
| **Integration** | Vitest + MSW | API interactions, service composition | All API contracts tested |
| **Contract** | Vitest + Zod schemas | API request/response validation | All API contracts tested |
| **E2E** | Playwright | Critical user journeys | All P1 user stories (4 stories) |
| **Accessibility** | axe-core (Vitest + Playwright) | WCAG 2.1 Level AA compliance | Automated + manual testing |
| **Performance** | Lighthouse CI | Web Vitals monitoring | Score ≥90 |
| **Visual Regression** | Playwright snapshots (optional) | UI consistency | N/A (optional enhancement) |

**Best Practices**:
- **Test Pyramid**: More unit tests (100s), fewer integration (10s), fewest E2E (5-10)
- **Coverage Thresholds**: Enforce in `vitest.config.ts`
  ```typescript
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html', 'lcov'],
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  }
  ```
- **Accessibility in CI**: Run axe-core on every PR, fail on violations
- **E2E Parallelization**: Configure Playwright to run tests in parallel (3-4 workers)
- **Mocking**: Use MSW for API mocking (intercepts network requests, no test code changes)
- **Test Data**: Use factories (Fishery, faker.js) for consistent test data generation
- **CI/CD Pipeline**:
  1. Linting (ESLint + Prettier)
  2. Type checking (tsc)
  3. Unit tests (Vitest)
  4. Integration tests (Vitest)
  5. E2E tests (Playwright)
  6. Accessibility scan (axe-core)
  7. Lighthouse CI
  8. Coverage report upload (Codecov)

---

## 7. Email Service

### Decision: Nodemailer with SMTP (Gmail/SendGrid)

**Rationale**:
- **Simplicity**: Nodemailer is battle-tested, zero-config for basic SMTP
- **Flexibility**: Works with any SMTP provider (Gmail, Outlook, custom SMTP server)
- **Cost**: Free tier for low volume (Gmail: 500 emails/day, SendGrid: 100 emails/day free)
- **TypeScript Support**: Excellent types via `@types/nodemailer`
- **HTML Templates**: Supports HTML emails with embedded images, CSS
- **Error Handling**: Robust retry logic, detailed error messages
- **Testing**: Mailtrap or Ethereal for dev/test environments (no real emails sent)
- **Scalability Path**: Start with SMTP, migrate to SendGrid/Mailgun/AWS SES if volume grows

**Email Requirements** (from FR-020):
- Reminders for upcoming scheduled growth activities
- Estimated volume: ~5-10 emails/day for single user (daily/weekly digest, event reminders)

**Implementation**:

```typescript
// lib/email.ts
import nodemailer from 'nodemailer';
import { CalendarEvent } from '@/types';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,     // smtp.gmail.com
  port: 587,
  secure: false,                   // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,   // your-email@gmail.com
    pass: process.env.SMTP_PASS,   // app password (not regular password!)
  },
});

export async function sendEventReminder(event: CalendarEvent, userEmail: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px;">
      <h2>Reminder: ${event.title}</h2>
      <p>Your growth activity is scheduled for <strong>${formatDate(event.start_time)}</strong></p>
      <p>Duration: ${event.duration} minutes</p>
      <p><a href="${process.env.APP_URL}/calendar/${event.id}">View in Calendar</a></p>
    </div>
  `;

  await transporter.sendMail({
    from: '"Personal Growth Planner" <noreply@yourapp.com>',
    to: userEmail,
    subject: `Reminder: ${event.title}`,
    html,
  });
}

// Background job (jobs/emailNotifications.ts)
import cron from 'node-cron';
import { db } from '@/lib/db';
import { sendEventReminder } from '@/lib/email';

// Run every hour, check for events starting in 24 hours
cron.schedule('0 * * * *', async () => {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const events = await db.calendarEvent.findMany({
    where: {
      start_time: {
        gte: new Date(),
        lte: tomorrow,
      },
      status: 'scheduled',
    },
    include: { user: true },
  });

  for (const event of events) {
    await sendEventReminder(event, event.user.email);
  }
});
```

**Alternatives Considered**:

| Alternative | Why Rejected |
|------------|--------------|
| **SendGrid** | Excellent service but overkill for single-user app; free tier 100 emails/day sufficient but requires API setup; Nodemailer+Gmail simpler for MVP, can migrate later |
| **AWS SES** | Production-grade, cheap ($0.10/1000 emails) but requires AWS account setup; more configuration than SMTP; better for high volume |
| **Mailgun** | Similar to SendGrid, great service but unnecessary complexity for low volume |
| **Postmark** | Excellent deliverability but no free tier; $10/month minimum |
| **Resend** | Modern developer-focused service but new (2023), less proven than Nodemailer |
| **Direct SMTP (no library)** | Reinventing the wheel, Nodemailer handles edge cases (attachments, encoding, retries) |

**Best Practices**:
- **Environment Variables**: Never commit SMTP credentials to git
  ```env
  SMTP_HOST=smtp.gmail.com
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=your-app-password  # Generate in Google Account settings
  ```
- **Gmail App Passwords**: Use app-specific passwords, not regular account password (2FA required)
- **HTML Templates**: Use `mjml` or simple HTML for responsive email templates
- **Unsubscribe**: Include unsubscribe link per email best practices (even for transactional emails)
- **Rate Limiting**: Respect provider limits (Gmail: 500/day, SendGrid free: 100/day)
- **Error Handling**: Catch send failures, retry with exponential backoff
  ```typescript
  try {
    await sendEventReminder(event, userEmail);
  } catch (error) {
    logger.error('Email send failed', { eventId: event.id, error });
    // Queue for retry or notify admin
  }
  ```
- **Testing**: Use Ethereal (ethereal.email) for dev environments - generates fake SMTP server
  ```typescript
  // Development-only transporter
  if (process.env.NODE_ENV === 'development') {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }
  ```
- **Background Jobs**: Use BullMQ for reliable email queue (handles retries, failures)
- **Migration Path**: If volume grows or deliverability issues arise, switch to SendGrid API (minimal code changes)

---

## 8. Calendar Library

### Decision: FullCalendar v6

**Rationale**:
- **Feature Completeness**: Comprehensive calendar UI meeting all FR-014 to FR-019 requirements
  - Day/Week/Month views (matches "daily, weekly, monthly views")
  - Event creation, editing, drag-and-drop rescheduling
  - Recurring events with customizable patterns (daily, weekly, monthly)
  - Event color coding by category
  - Time zone support (critical for single-user timezone handling)
- **React Integration**: Official `@fullcalendar/react` package with TypeScript support
- **Accessibility**:
  - Keyboard navigation (arrow keys, Enter, Tab)
  - ARIA labels for events, dates
  - Screen reader announcements
  - Focus management
- **Customization**: Highly customizable appearance, matches design system colors
- **Performance**: Virtual rendering for large event sets, lazy loading
- **Responsive**: Mobile-friendly (future-proofs for mobile app)
- **Documentation**: Extensive docs, active community, frequent updates
- **Plugins**: Modular architecture (core + daygrid + timegrid + list plugins)

**Implementation**:

```typescript
// components/calendar/CalendarView.tsx
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import { CalendarEvent } from '@/types';

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateSelect: (start: Date, end: Date) => void;
}

export function CalendarView({ events, onEventClick, onDateSelect }: CalendarViewProps) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
      initialView="timeGridWeek"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      }}
      editable={true}
      selectable={true}
      selectMirror={true}
      dayMaxEvents={true}
      weekends={true}
      events={events.map(e => ({
        id: e.id,
        title: e.title,
        start: e.start_time,
        end: e.end_time,
        color: getCategoryColor(e.category),
        rrule: e.recurrence_pattern, // RRule format for recurring events
        extendedProps: {
          status: e.status,
          learningResourceId: e.learning_resource_id,
        },
      }))}
      eventClick={(info) => onEventClick(info.event.id)}
      select={(info) => onDateSelect(info.start, info.end)}
      eventContent={(arg) => (
        // Custom event rendering for accessibility
        <div role="button" aria-label={`Event: ${arg.event.title}`}>
          {arg.event.title}
          {arg.event.extendedProps.status === 'completed' && ' ✓'}
        </div>
      )}
    />
  );
}

// Recurring event example using RRule
const recurringEvent = {
  title: 'Weekly React Study',
  rrule: {
    freq: 'weekly',
    byweekday: ['tu', 'th'], // Tuesday, Thursday
    dtstart: '2025-01-01T19:00:00',
    until: '2025-12-31',
  },
  duration: '02:00', // 2 hours
};
```

**Alternatives Considered**:

| Alternative | Why Rejected |
|------------|--------------|
| **React Big Calendar** | Good library but less feature-rich than FullCalendar; weaker recurring event support; less polished drag-and-drop; smaller community |
| **TUI Calendar** | Feature-complete but heavier bundle size; less React-friendly (jQuery dependency); weaker accessibility |
| **react-calendar** | Too basic - simple date picker, not a full scheduling calendar; lacks week/day views, event management |
| **Google Calendar API** | Out of scope per spec (no third-party calendar integration); would require OAuth, API setup; FullCalendar provides UI without external dependencies |
| **Custom Build** | Reinventing the wheel; calendar logic is complex (timezones, DST, recurring events); 100+ hours of development vs 2 hours with FullCalendar |

**Best Practices**:
- **Event Data Structure**: Store events in database, pass to FullCalendar as props
- **Recurring Events**: Use RRule format (RFC 5545 standard) for recurrence patterns
  ```typescript
  // Weekly on Mondays and Wednesdays until end of year
  {
    freq: 'weekly',
    byweekday: ['mo', 'we'],
    dtstart: '2025-01-01T18:00:00',
    until: '2025-12-31T23:59:59',
  }
  ```
- **Timezone Handling**: Set `timeZone` prop to user's timezone from user preferences
- **Color Coding**: Map objective categories to colors (matches Chakra UI theme)
  ```typescript
  const categoryColors = {
    career: '#4caf50',
    health: '#ff9800',
    relationships: '#e91e63',
    skills: '#9c27b0',
  };
  ```
- **Event Status Indicators**: Visual indicators for completed/cancelled events
- **Accessibility**:
  - Add `aria-label` to custom event content
  - Ensure keyboard navigation works (test Tab, Enter, Arrow keys)
  - Screen reader announces date changes when navigating
- **Performance**:
  - Lazy load events (fetch only visible month's events)
  - Use `eventDidMount` for custom rendering instead of re-rendering all events
- **Responsive**: Hide day view on mobile, default to list view
- **Bundle Size**: FullCalendar core + plugins ~50KB gzipped (acceptable for <200KB budget)

---

## Technology Decision Matrix

| Category | Chosen | Primary Reason | Constitutional Alignment |
|----------|--------|----------------|-------------------------|
| **Language** | TypeScript 5.3+ | Type safety + full-stack code sharing | Code Quality Standards (Section I) |
| **Frontend** | React 18 + Vite | Accessibility ecosystem + performance | WCAG 2.1 AA + Web Vitals (Sections IV, V) |
| **Backend** | Node.js 20 + Express | Language consistency + <200ms reads | Performance Requirements (Section VI) |
| **Database** | PostgreSQL 16 | Relational model + ACID + zero data loss | Performance + Data Integrity (Section VI) |
| **Design System** | Chakra UI v2 | WCAG 2.1 AA built-in + 8px spacing | UX Consistency + Accessibility (Sections III, IV) |
| **Testing** | Vitest + Playwright + axe-core | <5s unit tests + E2E + a11y automation | Testing Discipline (Section II) |
| **Email** | Nodemailer + SMTP | Simplicity + free tier + migration path | N/A (functional requirement) |
| **Calendar** | FullCalendar v6 | Complete feature set + accessibility | UX Consistency + Accessibility (Sections III, IV) |

---

## Development Workflow & Tooling

### Package Manager: pnpm

**Rationale**: Faster than npm/yarn, disk-efficient, strict dependency resolution prevents phantom dependencies

### Monorepo Structure: Turborepo (optional)

**Rationale**: If frontend/backend are separate packages, Turborepo manages builds/tests efficiently

### Code Quality Tools:

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"  // Accessibility linting
  ],
  "rules": {
    "complexity": ["error", 10],           // Max cyclomatic complexity
    "max-lines-per-function": ["error", 50], // Max function length
    "@typescript-eslint/no-explicit-any": "error" // No `any` type
  }
}

// .prettierrc.json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100
}
```

### Git Hooks: Husky + lint-staged

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,md,json}": ["prettier --write"]
  }
}
```

### CI/CD: GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: '20' }
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test:unit --coverage
      - run: pnpm test:e2e
      - run: pnpm lighthouse-ci
      - run: pnpm build
```

### Performance Monitoring:

- **Development**: Vite's built-in performance overlay
- **Production**:
  - Web Vitals reporting to analytics (Google Analytics, Vercel Analytics)
  - Sentry for error tracking + performance monitoring
  - Lighthouse CI scores tracked over time

---

## Deployment Recommendations

### Hosting Options:

| Platform | Frontend | Backend | Database | Cost (Single User) |
|----------|----------|---------|----------|-------------------|
| **Vercel** | ✅ Excellent | ✅ Serverless Functions | ❌ External (Neon) | $0-20/month |
| **Railway** | ✅ Good | ✅ Good | ✅ PostgreSQL included | $5-10/month |
| **Render** | ✅ Good | ✅ Good | ✅ PostgreSQL included | $7-15/month |
| **Fly.io** | ✅ Good | ✅ Excellent | ✅ PostgreSQL included | $0-10/month |
| **Docker + VPS** | ✅ Full control | ✅ Full control | ✅ Full control | $5-10/month |

**Recommendation**: **Railway** or **Render** for simplicity (database included, automatic deployments from git)

### Environment Variables:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App
APP_URL=https://your-app.com
NODE_ENV=production
JWT_SECRET=your-secret-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

---

## Migration Path & Future Considerations

### Phase 1: MVP (Current Recommendations)
- TypeScript + React + Express + PostgreSQL
- Chakra UI + FullCalendar
- Nodemailer SMTP
- Deploy on Railway/Render

### Phase 2: Scale (If Needed)
- **High Volume Emails**: Migrate Nodemailer → SendGrid API
- **Real-time Updates**: Add Socket.io or Server-Sent Events for live dashboard updates
- **Mobile App**: React Native (shares TypeScript types and business logic with web)
- **Advanced Analytics**: Add data warehouse (Snowflake, BigQuery) for complex reporting
- **Multi-tenant**: Add organization/team features, row-level security

### Phase 3: Enterprise (If Needed)
- **Microservices**: Split monolith into services (OKR service, Calendar service, etc.)
- **Event-Driven**: Add message queue (RabbitMQ, Kafka) for async processing
- **Global Scale**: CDN for static assets, read replicas for database
- **Advanced Auth**: SSO, SAML, OAuth providers

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| **Bundle Size > 200KB** | Code-splitting, lazy loading, tree-shaking, bundle analyzer in CI |
| **API Response Time > 200ms** | Database indexing, query optimization, caching, APM monitoring |
| **Accessibility Violations** | axe-core in CI, manual testing, Chakra UI's built-in compliance |
| **Database Scalability** | PostgreSQL handles millions of rows easily; connection pooling; read replicas if needed |
| **Email Deliverability** | Start with Gmail; monitor bounce rates; migrate to SendGrid if issues arise |
| **Testing Maintenance** | Page Object Model for E2E tests; test data factories; MSW for stable API mocking |

---

## Conclusion

The recommended TypeScript + React + Express + PostgreSQL stack provides:

1. **Constitutional Compliance**: Meets all 6 core principles (Code Quality, Testing, UX, Accessibility, Web Vitals, Performance)
2. **Developer Experience**: Single language full-stack, excellent tooling, fast feedback loops
3. **Performance**: Easily achieves <200ms reads, <500ms writes, LCP ≤2.5s, Lighthouse ≥90
4. **Accessibility**: WCAG 2.1 Level AA compliance through Chakra UI and axe-core testing
5. **Maintainability**: Type safety, 80% test coverage, clear architecture
6. **Scalability**: Stateless design, horizontal scaling ready, migration path to advanced features
7. **Cost-Effectiveness**: Free/low-cost hosting, open-source stack, no vendor lock-in

This stack balances simplicity (avoiding over-engineering) with robustness (meeting all requirements), making it ideal for a single-developer personal growth planner MVP with a clear path to scale.

**Next Steps**:
1. Generate data model schema (data-model.md)
2. Define API contracts (contracts/)
3. Create quickstart guide (quickstart.md)
4. Generate task breakdown (tasks.md via `/speckit.tasks`)
