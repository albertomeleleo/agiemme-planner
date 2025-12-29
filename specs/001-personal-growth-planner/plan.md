# Implementation Plan: Personal Growth Planner

**Branch**: `001-personal-growth-planner` | **Date**: 2025-12-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-personal-growth-planner/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

A comprehensive personal growth planning application that enables users to plan their annual development using the OKR (Objectives and Key Results) framework, create structured learning paths with resources and milestones, schedule growth activities on an integrated calendar, and track progress through dashboards and analytics. The system helps users translate high-level personal goals across multiple life areas (career, health, relationships, skills, financial, personal) into actionable plans with measurable outcomes.

## Technical Context

**Language/Version**: TypeScript 5.3+ (full-stack: frontend + backend)
**Primary Dependencies**:
- Frontend: React 18.2+ with Vite, Chakra UI v2 (design system), FullCalendar v6 (calendar UI)
- Backend: Node.js 20 LTS with Express 4.x, Nodemailer (email notifications)
**Storage**: PostgreSQL 16 (relational database for OKRs, learning paths, calendar events with ACID guarantees)
**Testing**: Vitest (unit/integration, <5s execution), Playwright (E2E for P1 user stories), axe-core (accessibility automation)
**Target Platform**: Web application (desktop-focused initially, per Out of Scope: no mobile apps in v1)
**Project Type**: Web (requires frontend + backend based on functional requirements for API, calendar, notifications)
**Performance Goals**: Dashboard load <3s per SC-004, OKR creation <30min per SC-001, Learning path creation <15min per SC-002, Progress report generation <2min per SC-008
**Constraints**: <200ms API read operations, <500ms write operations per constitution; email notification capability required per FR-020; data persistence with zero data loss per SC-009; performance budgets: JS <200KB initial (gzipped), CSS <50KB (gzipped)
**Scale/Scope**: Single-user focused initially (per Assumptions: individual use, not team), ~10-15 main screens (OKR dashboard, learning paths, calendar views, progress tracking), estimated ~50-100 API endpoints

**Technology Stack Rationale**: See [research.md](./research.md) for detailed technology selection decisions, alternatives considered, and best practices.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Quality Standards
- [ ] Style guides configured (ESLint/Prettier or language equivalent)
- [ ] TypeScript interfaces defined for all entities (or equivalent type system)
- [ ] Function complexity limits enforced (≤10 cyclomatic complexity, ≤50 lines)
- [ ] No `any` types without tracking
- **Status**: ✅ PASS - Standard requirements, no violations expected

### II. Testing Discipline (NON-NEGOTIABLE)
- [ ] Test-first development approach planned
- [ ] Test structure defined: unit/, integration/, contract/, e2e/
- [ ] Coverage targets: 80% unit coverage, all API contracts tested, all P1 user stories (4 stories) have E2E tests
- [ ] Performance: Unit test suites <5s
- **Status**: ✅ PASS - Will follow TDD approach per constitution

### III. User Experience Consistency
- [ ] Design system planned (component library selection needed in research)
- [ ] Typography: max 3 font families, defined type scale
- [ ] Color palette: primary, secondary, semantic colors defined
- [ ] Spacing: 8px base unit system
- [ ] Responsive breakpoints: mobile 320-767px, tablet 768-1023px, desktop 1024px+
- [ ] Loading states, error messages, empty states for all async operations
- **Status**: ✅ PASS - Design system selection needed in Phase 0 research

### IV. WCAG 2.1 Level AA Accessibility (NON-NEGOTIABLE)
- [ ] Color contrast: 4.5:1 normal text, 3:1 large text
- [ ] Keyboard accessible (all functionality, visible focus, logical tab order)
- [ ] Screen reader compatible (semantic HTML, proper ARIA, alt text)
- [ ] axe-core automated testing configured
- [ ] Manual keyboard navigation and screen reader testing for P1 stories
- **Status**: ✅ PASS - All P1 user stories will be accessibility tested

### V. Web Vitals Performance (NON-NEGOTIABLE)
- [ ] LCP ≤ 2.5s (optimize largest image/text, lazy loading, CDN)
- [ ] FID ≤ 100ms (minimize JS blocking, code-split bundles)
- [ ] CLS ≤ 0.1 (reserve space for images, avoid layout shifts)
- [ ] INP ≤ 200ms (optimize event handlers, break up long tasks)
- [ ] Lighthouse CI score ≥90
- [ ] Performance budgets: JS <200KB initial (gzipped), CSS <50KB (gzipped)
- **Status**: ✅ PASS - Targets align with SC-004 (dashboard <3s)

### VI. Performance Requirements
- [ ] API response times: reads ≤200ms, writes ≤500ms, complex queries ≤1000ms (95th percentile)
- [ ] Database queries indexed (no full table scans on tables >1000 rows)
- [ ] N+1 queries eliminated
- [ ] Caching strategy: static assets (1 year), API responses (ETags, Cache-Control)
- [ ] Stateless design for horizontal scaling
- [ ] Background jobs for operations >5s
- [ ] Rate limiting on public APIs
- [ ] APM and error tracking configured
- **Status**: ✅ PASS - API targets defined in Technical Context; progress report generation (<2min per SC-008) may need background job

### Quality Gates Alignment
- [ ] CI/CD pipeline: linting, type checking, tests, accessibility (axe-core), Lighthouse CI, security scan, build
- [ ] Pre-release: E2E tests, load testing, accessibility audit, performance budget, documentation
- **Status**: ✅ PASS - Standard CI/CD requirements

### Overall Gate Status: ✅ PASS (Re-evaluated Post-Design)
**Initial Justification**: No constitution violations identified. Standard web application following all required principles. Design system and technology stack selection needed in Phase 0 research to resolve NEEDS CLARIFICATION items.

**Post-Design Re-evaluation (Phase 1 Complete)**:
- ✅ All NEEDS CLARIFICATION items resolved via [research.md](./research.md)
- ✅ Technology stack selected: TypeScript 5.3+, React 18.2+/Vite, Node.js 20/Express, PostgreSQL 16, Chakra UI v2
- ✅ Data model defined in [data-model.md](./data-model.md) with proper indexes, constraints, validation rules
- ✅ API contracts specified in [contracts/openapi.yaml](./contracts/openapi.yaml) with performance targets (<200ms reads, <500ms writes)
- ✅ Testing strategy confirmed: Vitest (unit), Playwright (E2E), axe-core (accessibility)
- ✅ Design system selected: Chakra UI v2 with built-in WCAG 2.1 Level AA compliance
- ✅ All 6 constitutional principles remain satisfied with concrete implementation plan
- ✅ No new violations introduced during design phase
- ✅ Performance budgets defined and achievable with selected stack (see research.md benchmarks)

**Final Gate Status**: PASS - Ready for Phase 2 (tasks.md generation via /speckit.tasks command)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/              # Data models: User, Objective, KeyResult, LearningPath, LearningResource, CalendarEvent, ProgressUpdate
│   ├── services/            # Business logic: OKR management, learning path operations, calendar scheduling, progress tracking
│   ├── api/                 # REST API endpoints organized by domain (okrs/, learning-paths/, calendar/, progress/)
│   ├── jobs/                # Background jobs for notifications, report generation
│   └── lib/                 # Shared utilities: email service, date/time helpers, validation
└── tests/
    ├── contract/            # API contract tests (OpenAPI validation)
    ├── integration/         # Cross-service integration tests (e.g., calendar event completion updates learning path)
    └── unit/                # Unit tests for models, services, jobs

frontend/
├── src/
│   ├── components/          # Reusable UI components from design system
│   │   ├── okr/            # OKR-specific: ObjectiveCard, KeyResultProgress, OKRDashboard
│   │   ├── learning/       # Learning-specific: LearningPathCard, ResourceList, ProgressIndicator
│   │   ├── calendar/       # Calendar-specific: CalendarView, EventForm, RecurrenceSelector
│   │   ├── progress/       # Progress-specific: ProgressDashboard, TrendChart, ReportGenerator
│   │   └── shared/         # Shared: Button, Input, Modal, Toast, Loading, EmptyState
│   ├── pages/              # Main views: Dashboard, OKRs, LearningPaths, Calendar, Progress, Settings
│   ├── services/           # API client, state management, utilities
│   ├── styles/             # Design system tokens: colors, typography, spacing
│   └── hooks/              # Custom React hooks (or Vue composables, depending on tech choice)
└── tests/
    ├── e2e/                # End-to-end tests for all P1 user stories (4 stories)
    ├── integration/        # Component integration tests
    └── unit/               # Component unit tests
```

**Structure Decision**: Web application (Option 2) selected. This feature requires a full-stack web app with:
- **Backend**: RESTful API for data persistence (OKRs, learning paths, calendar events), email notifications, and report generation
- **Frontend**: Interactive dashboard, calendar views, and progress tracking interfaces
- Clear separation enables independent scaling and testing of frontend/backend concerns per constitution's stateless design requirement

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. This section is empty.
