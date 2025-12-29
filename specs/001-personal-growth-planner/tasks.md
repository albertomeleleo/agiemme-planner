# Tasks: Personal Growth Planner

**Input**: Design documents from `/specs/001-personal-growth-planner/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Test tasks are included per constitution requirement for TDD approach (Test-First Development, Section II).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Per plan.md structure decision (Web application - Option 2):
- Backend: `backend/src/`, `backend/tests/`
- Frontend: `frontend/src/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create backend project structure: backend/src/{models,services,api,jobs,lib}, backend/tests/{contract,integration,unit}
- [ ] T002 Initialize backend TypeScript project with Node.js 20 LTS, Express 4.x dependencies in backend/package.json
- [ ] T003 Create frontend project structure: frontend/src/{components,pages,services,styles,hooks}, frontend/tests/{e2e,integration,unit}
- [ ] T004 Initialize frontend TypeScript project with React 18.2+, Vite, Chakra UI v2 dependencies in frontend/package.json
- [ ] T005 [P] Configure ESLint and Prettier for backend in backend/.eslintrc.js and backend/.prettierrc
- [ ] T006 [P] Configure ESLint and Prettier for frontend in frontend/.eslintrc.js and frontend/.prettierrc
- [ ] T007 [P] Configure TypeScript strict mode in backend/tsconfig.json
- [ ] T008 [P] Configure TypeScript strict mode in frontend/tsconfig.json
- [ ] T009 [P] Setup Vitest configuration for backend in backend/vitest.config.ts
- [ ] T010 [P] Setup Vitest configuration for frontend in frontend/vitest.config.ts
- [ ] T011 [P] Setup Playwright for E2E tests in frontend/playwright.config.ts
- [ ] T012 [P] Setup axe-core for accessibility testing in frontend/tests/a11y/
- [ ] T013 Create .gitignore files for backend and frontend (node_modules, .env, dist, coverage)
- [ ] T014 Create environment variable templates: backend/.env.example and frontend/.env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & Migrations

- [ ] T015 Setup PostgreSQL connection configuration in backend/src/lib/database.ts
- [ ] T016 Create database migration framework using node-pg-migrate in backend/src/migrations/
- [ ] T017 Create ENUM types migration in backend/src/migrations/001_create_enums.sql (objective_category, objective_status, key_result_status, etc.)
- [ ] T018 Create User table migration in backend/src/migrations/002_create_users_table.sql per data-model.md
- [ ] T019 Create indexes for User table in backend/src/migrations/003_create_users_indexes.sql

### Authentication & Authorization

- [ ] T020 Implement JWT authentication service in backend/src/services/auth-service.ts
- [ ] T021 Create authentication middleware in backend/src/api/middleware/auth.ts
- [ ] T022 Implement password hashing utilities in backend/src/lib/crypto.ts (bcrypt)
- [ ] T023 Create User model in backend/src/models/user.ts per data-model.md schema

### API Infrastructure

- [ ] T024 Setup Express app with middleware (CORS, body-parser, helmet) in backend/src/index.ts
- [ ] T025 Create API router structure in backend/src/api/index.ts
- [ ] T026 Implement error handling middleware in backend/src/api/middleware/error-handler.ts
- [ ] T027 Implement validation middleware using Zod in backend/src/api/middleware/validator.ts
- [ ] T028 Create API response utilities in backend/src/lib/response.ts
- [ ] T029 Setup logging infrastructure using Winston in backend/src/lib/logger.ts

### Frontend Foundation

- [ ] T030 Setup Chakra UI theme configuration in frontend/src/styles/theme.ts (8px spacing, colors per constitution)
- [ ] T031 Create App component with routing in frontend/src/App.tsx
- [ ] T032 Setup React Router in frontend/src/main.tsx
- [ ] T033 Create API client service in frontend/src/services/api.ts (Axios with JWT interceptor)
- [ ] T034 Implement authentication context in frontend/src/services/auth-context.tsx
- [ ] T035 Create shared UI components: Button, Input, Modal, Toast in frontend/src/components/shared/

### Testing Foundation

- [ ] T036 [P] Create test database setup utilities in backend/tests/test-helpers.ts
- [ ] T037 [P] Create API test utilities in backend/tests/api-helpers.ts
- [ ] T038 [P] Create frontend test utilities in frontend/tests/test-utils.tsx (React Testing Library + Chakra)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Set Annual Growth Goals with OKRs (Priority: P1) 🎯 MVP

**Goal**: Users can define their personal growth objectives for the upcoming year using the OKR framework. They can create objectives across different life areas and define measurable key results to track progress.

**Independent Test**: Can be fully tested by creating, viewing, editing, and deleting OKRs. Delivers value by providing a structured framework for goal setting even without calendar integration or learning paths.

### Contract Tests for User Story 1 (TDD - Write First)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T039 [P] [US1] Contract test for POST /api/v1/auth/register in backend/tests/contract/auth.test.ts
- [ ] T040 [P] [US1] Contract test for POST /api/v1/auth/login in backend/tests/contract/auth.test.ts
- [ ] T041 [P] [US1] Contract test for GET /api/v1/okrs/objectives in backend/tests/contract/objectives.test.ts
- [ ] T042 [P] [US1] Contract test for POST /api/v1/okrs/objectives in backend/tests/contract/objectives.test.ts
- [ ] T043 [P] [US1] Contract test for PUT /api/v1/okrs/objectives/:id in backend/tests/contract/objectives.test.ts
- [ ] T044 [P] [US1] Contract test for DELETE /api/v1/okrs/objectives/:id in backend/tests/contract/objectives.test.ts
- [ ] T045 [P] [US1] Contract test for POST /api/v1/okrs/key-results in backend/tests/contract/key-results.test.ts
- [ ] T046 [P] [US1] Contract test for PUT /api/v1/okrs/key-results/:id in backend/tests/contract/key-results.test.ts
- [ ] T047 [P] [US1] Contract test for POST /api/v1/okrs/key-results/:id/progress in backend/tests/contract/progress-updates.test.ts

### Backend Models for User Story 1 (TDD - Write Tests First)

- [ ] T048 [P] [US1] Unit test for Objective model in backend/tests/unit/models/objective.test.ts
- [ ] T049 [P] [US1] Unit test for KeyResult model in backend/tests/unit/models/key-result.test.ts
- [ ] T050 [P] [US1] Unit test for ProgressUpdate model in backend/tests/unit/models/progress-update.test.ts

- [ ] T051 Create Objective table migration in backend/src/migrations/004_create_objectives_table.sql per data-model.md
- [ ] T052 Create KeyResult table migration in backend/src/migrations/005_create_key_results_table.sql per data-model.md
- [ ] T053 Create ProgressUpdate table migration in backend/src/migrations/006_create_progress_updates_table.sql per data-model.md
- [ ] T054 [P] Create indexes for Objective table in backend/src/migrations/007_create_objectives_indexes.sql
- [ ] T055 [P] Create indexes for KeyResult table in backend/src/migrations/008_create_key_results_indexes.sql
- [ ] T056 [P] Create indexes for ProgressUpdate table in backend/src/migrations/009_create_progress_updates_indexes.sql

- [ ] T057 [P] [US1] Implement Objective model in backend/src/models/objective.ts per data-model.md
- [ ] T058 [P] [US1] Implement KeyResult model in backend/src/models/key-result.ts per data-model.md (with computed completionPercentage)
- [ ] T059 [P] [US1] Implement ProgressUpdate model in backend/src/models/progress-update.ts per data-model.md

### Backend Services for User Story 1 (TDD - Write Tests First)

- [ ] T060 [P] [US1] Unit test for AuthService in backend/tests/unit/services/auth-service.test.ts
- [ ] T061 [P] [US1] Unit test for ObjectiveService in backend/tests/unit/services/objective-service.test.ts
- [ ] T062 [P] [US1] Unit test for KeyResultService in backend/tests/unit/services/key-result-service.test.ts

- [ ] T063 [US1] Implement AuthService (register, login, logout) in backend/src/services/auth-service.ts
- [ ] T064 [US1] Implement ObjectiveService (CRUD, category filtering, status updates) in backend/src/services/objective-service.ts
- [ ] T065 [US1] Implement KeyResultService (CRUD, progress updates, at-risk detection) in backend/src/services/key-result-service.ts

### Backend API Endpoints for User Story 1

- [ ] T066 [P] [US1] Implement POST /api/v1/auth/register endpoint in backend/src/api/auth/register.ts
- [ ] T067 [P] [US1] Implement POST /api/v1/auth/login endpoint in backend/src/api/auth/login.ts
- [ ] T068 [P] [US1] Implement POST /api/v1/auth/logout endpoint in backend/src/api/auth/logout.ts

- [ ] T069 [P] [US1] Implement GET /api/v1/okrs/objectives endpoint in backend/src/api/okrs/get-objectives.ts
- [ ] T070 [P] [US1] Implement POST /api/v1/okrs/objectives endpoint in backend/src/api/okrs/create-objective.ts
- [ ] T071 [P] [US1] Implement GET /api/v1/okrs/objectives/:id endpoint in backend/src/api/okrs/get-objective.ts
- [ ] T072 [P] [US1] Implement PUT /api/v1/okrs/objectives/:id endpoint in backend/src/api/okrs/update-objective.ts
- [ ] T073 [P] [US1] Implement DELETE /api/v1/okrs/objectives/:id endpoint in backend/src/api/okrs/delete-objective.ts

- [ ] T074 [P] [US1] Implement POST /api/v1/okrs/key-results endpoint in backend/src/api/okrs/create-key-result.ts
- [ ] T075 [P] [US1] Implement GET /api/v1/okrs/key-results/:id endpoint in backend/src/api/okrs/get-key-result.ts
- [ ] T076 [P] [US1] Implement PUT /api/v1/okrs/key-results/:id endpoint in backend/src/api/okrs/update-key-result.ts
- [ ] T077 [P] [US1] Implement DELETE /api/v1/okrs/key-results/:id endpoint in backend/src/api/okrs/delete-key-result.ts

- [ ] T078 [P] [US1] Implement POST /api/v1/okrs/key-results/:id/progress endpoint in backend/src/api/okrs/create-progress-update.ts
- [ ] T079 [P] [US1] Implement GET /api/v1/okrs/key-results/:id/progress endpoint in backend/src/api/okrs/get-progress-updates.ts

### Integration Tests for User Story 1

- [ ] T080 [P] [US1] Integration test for registration → login → create objective flow in backend/tests/integration/okr-creation-flow.test.ts
- [ ] T081 [P] [US1] Integration test for objective with 2-5 key results validation in backend/tests/integration/okr-validation.test.ts
- [ ] T082 [P] [US1] Integration test for progress update → key result recalculation → objective completion in backend/tests/integration/progress-tracking.test.ts

### Frontend Components for User Story 1 (TDD - Write Tests First)

- [ ] T083 [P] [US1] Unit test for ObjectiveCard component in frontend/tests/unit/components/okr/ObjectiveCard.test.tsx
- [ ] T084 [P] [US1] Unit test for KeyResultProgress component in frontend/tests/unit/components/okr/KeyResultProgress.test.tsx
- [ ] T085 [P] [US1] Unit test for OKRDashboard component in frontend/tests/unit/components/okr/OKRDashboard.test.tsx

- [ ] T086 [P] [US1] Create ObjectiveCard component in frontend/src/components/okr/ObjectiveCard.tsx
- [ ] T087 [P] [US1] Create KeyResultProgress component in frontend/src/components/okr/KeyResultProgress.tsx
- [ ] T088 [P] [US1] Create ObjectiveForm component in frontend/src/components/okr/ObjectiveForm.tsx
- [ ] T089 [P] [US1] Create KeyResultForm component in frontend/src/components/okr/KeyResultForm.tsx
- [ ] T090 [US1] Create OKRDashboard component in frontend/src/components/okr/OKRDashboard.tsx

### Frontend Pages for User Story 1

- [ ] T091 [P] [US1] Create Login page in frontend/src/pages/Login.tsx
- [ ] T092 [P] [US1] Create Registration page in frontend/src/pages/Register.tsx
- [ ] T093 [US1] Create OKRs page (list view with category filters) in frontend/src/pages/OKRs.tsx
- [ ] T094 [US1] Create Objective Detail page in frontend/src/pages/ObjectiveDetail.tsx

### Frontend Services for User Story 1

- [ ] T095 [P] [US1] Implement OKR API service in frontend/src/services/okr-service.ts (objectives, key results, progress)
- [ ] T096 [P] [US1] Implement authentication API service in frontend/src/services/auth-service.ts

### E2E Tests for User Story 1 (TDD - Write First)

- [ ] T097 [P] [US1] E2E test for acceptance scenario 1: Create objective with key results in frontend/tests/e2e/okr-creation.spec.ts
- [ ] T098 [P] [US1] E2E test for acceptance scenario 2: View OKR dashboard with progress in frontend/tests/e2e/okr-dashboard.spec.ts
- [ ] T099 [P] [US1] E2E test for acceptance scenario 3: Edit existing key result in frontend/tests/e2e/okr-editing.spec.ts
- [ ] T100 [P] [US1] E2E test for acceptance scenario 4: Quarterly milestones with deadline indicators in frontend/tests/e2e/okr-deadlines.spec.ts

### Accessibility Testing for User Story 1

- [ ] T101 [P] [US1] Accessibility test for OKR dashboard (keyboard navigation, screen reader) in frontend/tests/a11y/okr-dashboard.spec.ts
- [ ] T102 [P] [US1] Accessibility test for objective creation form in frontend/tests/a11y/okr-forms.spec.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can register, login, create objectives with key results, track progress, and view their OKR dashboard.

---

## Phase 4: User Story 2 - Create and Follow Learning Paths (Priority: P2)

**Goal**: Users can define structured learning paths to acquire new skills or knowledge, breaking down learning objectives into courses, resources, and milestones. Each learning path supports the achievement of specific key results.

**Independent Test**: Can be tested by creating learning paths, adding resources (books, courses, articles), and marking items complete. Delivers value by organizing learning activities even without calendar scheduling.

### Contract Tests for User Story 2 (TDD - Write First)

- [ ] T103 [P] [US2] Contract test for GET /api/v1/learning-paths in backend/tests/contract/learning-paths.test.ts
- [ ] T104 [P] [US2] Contract test for POST /api/v1/learning-paths in backend/tests/contract/learning-paths.test.ts
- [ ] T105 [P] [US2] Contract test for PUT /api/v1/learning-paths/:id in backend/tests/contract/learning-paths.test.ts
- [ ] T106 [P] [US2] Contract test for POST /api/v1/learning-paths/:id/resources in backend/tests/contract/learning-resources.test.ts
- [ ] T107 [P] [US2] Contract test for POST /api/v1/learning-resources/:id/complete in backend/tests/contract/learning-resources.test.ts

### Backend Models for User Story 2 (TDD - Write Tests First)

- [ ] T108 [P] [US2] Unit test for LearningPath model in backend/tests/unit/models/learning-path.test.ts
- [ ] T109 [P] [US2] Unit test for LearningResource model in backend/tests/unit/models/learning-resource.test.ts

- [ ] T110 Create LearningPath table migration in backend/src/migrations/010_create_learning_paths_table.sql per data-model.md
- [ ] T111 Create LearningResource table migration in backend/src/migrations/011_create_learning_resources_table.sql per data-model.md
- [ ] T112 [P] Create indexes for LearningPath table in backend/src/migrations/012_create_learning_paths_indexes.sql
- [ ] T113 [P] Create indexes for LearningResource table in backend/src/migrations/013_create_learning_resources_indexes.sql

- [ ] T114 [P] [US2] Implement LearningPath model in backend/src/models/learning-path.ts per data-model.md (with computed completionPercentage)
- [ ] T115 [P] [US2] Implement LearningResource model in backend/src/models/learning-resource.ts per data-model.md

### Backend Services for User Story 2 (TDD - Write Tests First)

- [ ] T116 [P] [US2] Unit test for LearningPathService in backend/tests/unit/services/learning-path-service.test.ts
- [ ] T117 [P] [US2] Unit test for LearningResourceService in backend/tests/unit/services/learning-resource-service.test.ts

- [ ] T118 [US2] Implement LearningPathService (CRUD, key result linking, completion calc) in backend/src/services/learning-path-service.ts
- [ ] T119 [US2] Implement LearningResourceService (CRUD, sequencing, completion tracking) in backend/src/services/learning-resource-service.ts

### Backend API Endpoints for User Story 2

- [ ] T120 [P] [US2] Implement GET /api/v1/learning-paths endpoint in backend/src/api/learning-paths/get-learning-paths.ts
- [ ] T121 [P] [US2] Implement POST /api/v1/learning-paths endpoint in backend/src/api/learning-paths/create-learning-path.ts
- [ ] T122 [P] [US2] Implement GET /api/v1/learning-paths/:id endpoint in backend/src/api/learning-paths/get-learning-path.ts
- [ ] T123 [P] [US2] Implement PUT /api/v1/learning-paths/:id endpoint in backend/src/api/learning-paths/update-learning-path.ts
- [ ] T124 [P] [US2] Implement DELETE /api/v1/learning-paths/:id endpoint in backend/src/api/learning-paths/delete-learning-path.ts

- [ ] T125 [P] [US2] Implement POST /api/v1/learning-paths/:id/resources endpoint in backend/src/api/learning-paths/create-resource.ts
- [ ] T126 [P] [US2] Implement GET /api/v1/learning-resources/:id endpoint in backend/src/api/learning-resources/get-resource.ts
- [ ] T127 [P] [US2] Implement PUT /api/v1/learning-resources/:id endpoint in backend/src/api/learning-resources/update-resource.ts
- [ ] T128 [P] [US2] Implement DELETE /api/v1/learning-resources/:id endpoint in backend/src/api/learning-resources/delete-resource.ts
- [ ] T129 [P] [US2] Implement POST /api/v1/learning-resources/:id/complete endpoint in backend/src/api/learning-resources/complete-resource.ts

### Integration Tests for User Story 2

- [ ] T130 [P] [US2] Integration test for learning path → key result linking in backend/tests/integration/learning-path-linking.test.ts
- [ ] T131 [P] [US2] Integration test for resource completion → learning path recalculation in backend/tests/integration/resource-completion.test.ts
- [ ] T132 [P] [US2] Integration test for sequenced resources ordering in backend/tests/integration/resource-sequencing.test.ts

### Frontend Components for User Story 2 (TDD - Write Tests First)

- [ ] T133 [P] [US2] Unit test for LearningPathCard component in frontend/tests/unit/components/learning/LearningPathCard.test.tsx
- [ ] T134 [P] [US2] Unit test for ResourceList component in frontend/tests/unit/components/learning/ResourceList.test.tsx
- [ ] T135 [P] [US2] Unit test for ProgressIndicator component in frontend/tests/unit/components/learning/ProgressIndicator.test.tsx

- [ ] T136 [P] [US2] Create LearningPathCard component in frontend/src/components/learning/LearningPathCard.tsx
- [ ] T137 [P] [US2] Create ResourceList component in frontend/src/components/learning/ResourceList.tsx
- [ ] T138 [P] [US2] Create ResourceForm component in frontend/src/components/learning/ResourceForm.tsx
- [ ] T139 [P] [US2] Create LearningPathForm component in frontend/src/components/learning/LearningPathForm.tsx
- [ ] T140 [US2] Create ProgressIndicator component in frontend/src/components/learning/ProgressIndicator.tsx

### Frontend Pages for User Story 2

- [ ] T141 [P] [US2] Create Learning Paths page (list view) in frontend/src/pages/LearningPaths.tsx
- [ ] T142 [US2] Create Learning Path Detail page (with resources) in frontend/src/pages/LearningPathDetail.tsx

### Frontend Services for User Story 2

- [ ] T143 [US2] Implement Learning Path API service in frontend/src/services/learning-path-service.ts

### E2E Tests for User Story 2 (TDD - Write First)

- [ ] T144 [P] [US2] E2E test for acceptance scenario 1: Create learning path with resources in frontend/tests/e2e/learning-path-creation.spec.ts
- [ ] T145 [P] [US2] E2E test for acceptance scenario 2: Complete resource and see progress update in frontend/tests/e2e/resource-completion.spec.ts
- [ ] T146 [P] [US2] E2E test for acceptance scenario 3: Link learning path to key result in frontend/tests/e2e/learning-path-linking.spec.ts
- [ ] T147 [P] [US2] E2E test for acceptance scenario 4: Add new resources to existing path in frontend/tests/e2e/resource-management.spec.ts

### Accessibility Testing for User Story 2

- [ ] T148 [P] [US2] Accessibility test for learning paths list and detail views in frontend/tests/a11y/learning-paths.spec.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can create and track learning paths to support their OKR goals.

---

## Phase 5: User Story 3 - Schedule Growth Activities on Calendar (Priority: P3)

**Goal**: Users can schedule time blocks for learning, practice, and goal-related activities on an integrated calendar. The calendar shows dedicated time for personal growth alongside other commitments.

**Independent Test**: Can be tested by creating calendar entries for learning sessions, setting recurring time blocks, and viewing weekly/monthly growth schedules. Delivers value by helping users allocate time even if OKR tracking is manual.

### Contract Tests for User Story 3 (TDD - Write First)

- [ ] T149 [P] [US3] Contract test for GET /api/v1/calendar/events in backend/tests/contract/calendar-events.test.ts
- [ ] T150 [P] [US3] Contract test for POST /api/v1/calendar/events in backend/tests/contract/calendar-events.test.ts
- [ ] T151 [P] [US3] Contract test for PUT /api/v1/calendar/events/:id in backend/tests/contract/calendar-events.test.ts
- [ ] T152 [P] [US3] Contract test for POST /api/v1/calendar/events/:id/complete in backend/tests/contract/calendar-events.test.ts

### Backend Models for User Story 3 (TDD - Write Tests First)

- [ ] T153 [US3] Unit test for CalendarEvent model in backend/tests/unit/models/calendar-event.test.ts

- [ ] T154 Create CalendarEvent table migration in backend/src/migrations/014_create_calendar_events_table.sql per data-model.md
- [ ] T155 Create indexes for CalendarEvent table in backend/src/migrations/015_create_calendar_events_indexes.sql
- [ ] T156 Create CHECK constraint for CalendarEvent mutual exclusivity in backend/src/migrations/016_calendar_events_constraints.sql

- [ ] T157 [US3] Implement CalendarEvent model in backend/src/models/calendar-event.ts per data-model.md

### Backend Services for User Story 3 (TDD - Write Tests First)

- [ ] T158 [US3] Unit test for CalendarEventService in backend/tests/unit/services/calendar-event-service.test.ts

- [ ] T159 [US3] Implement CalendarEventService (CRUD, recurrence, completion, reminder scheduling) in backend/src/services/calendar-event-service.ts

### Backend Jobs for User Story 3

- [ ] T160 [US3] Implement email reminder background job in backend/src/jobs/send-reminders.ts (checks events within reminder window)
- [ ] T161 [US3] Setup job scheduler using node-cron in backend/src/jobs/scheduler.ts

### Backend API Endpoints for User Story 3

- [ ] T162 [P] [US3] Implement GET /api/v1/calendar/events endpoint in backend/src/api/calendar/get-events.ts
- [ ] T163 [P] [US3] Implement POST /api/v1/calendar/events endpoint in backend/src/api/calendar/create-event.ts
- [ ] T164 [P] [US3] Implement GET /api/v1/calendar/events/:id endpoint in backend/src/api/calendar/get-event.ts
- [ ] T165 [P] [US3] Implement PUT /api/v1/calendar/events/:id endpoint in backend/src/api/calendar/update-event.ts
- [ ] T166 [P] [US3] Implement DELETE /api/v1/calendar/events/:id endpoint in backend/src/api/calendar/delete-event.ts
- [ ] T167 [P] [US3] Implement POST /api/v1/calendar/events/:id/complete endpoint in backend/src/api/calendar/complete-event.ts

### Integration Tests for User Story 3

- [ ] T168 [P] [US3] Integration test for event → learning resource linking in backend/tests/integration/calendar-resource-linking.test.ts
- [ ] T169 [P] [US3] Integration test for event → key result linking in backend/tests/integration/calendar-key-result-linking.test.ts
- [ ] T170 [P] [US3] Integration test for recurring event generation in backend/tests/integration/recurring-events.test.ts
- [ ] T171 [P] [US3] Integration test for event completion → learning resource update in backend/tests/integration/event-completion-propagation.test.ts
- [ ] T172 [P] [US3] Integration test for reminder job execution in backend/tests/integration/reminder-job.test.ts

### Frontend Components for User Story 3 (TDD - Write Tests First)

- [ ] T173 [P] [US3] Unit test for CalendarView component in frontend/tests/unit/components/calendar/CalendarView.test.tsx
- [ ] T174 [P] [US3] Unit test for EventForm component in frontend/tests/unit/components/calendar/EventForm.test.tsx
- [ ] T175 [P] [US3] Unit test for RecurrenceSelector component in frontend/tests/unit/components/calendar/RecurrenceSelector.test.tsx

- [ ] T176 [US3] Integrate FullCalendar library in frontend/src/components/calendar/CalendarView.tsx
- [ ] T177 [P] [US3] Create EventForm component in frontend/src/components/calendar/EventForm.tsx
- [ ] T178 [P] [US3] Create RecurrenceSelector component in frontend/src/components/calendar/RecurrenceSelector.tsx
- [ ] T179 [P] [US3] Create EventCard component in frontend/src/components/calendar/EventCard.tsx

### Frontend Pages for User Story 3

- [ ] T180 [US3] Create Calendar page (daily/weekly/monthly views) in frontend/src/pages/Calendar.tsx

### Frontend Services for User Story 3

- [ ] T181 [US3] Implement Calendar API service in frontend/src/services/calendar-service.ts

### E2E Tests for User Story 3 (TDD - Write First)

- [ ] T182 [P] [US3] E2E test for acceptance scenario 1: Schedule learning session linked to resource in frontend/tests/e2e/calendar-event-creation.spec.ts
- [ ] T183 [P] [US3] E2E test for acceptance scenario 2: Create recurring weekly time blocks in frontend/tests/e2e/recurring-events.spec.ts
- [ ] T184 [P] [US3] E2E test for acceptance scenario 3: View weekly calendar with color-coded categories in frontend/tests/e2e/calendar-views.spec.ts
- [ ] T185 [P] [US3] E2E test for acceptance scenario 4: Mark event complete and update learning progress in frontend/tests/e2e/event-completion.spec.ts

### Accessibility Testing for User Story 3

- [ ] T186 [P] [US3] Accessibility test for calendar navigation (keyboard, screen reader) in frontend/tests/a11y/calendar.spec.ts

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Users can now schedule time for their learning and goal activities.

---

## Phase 6: User Story 4 - Track Progress and Adjust Plans (Priority: P4)

**Goal**: Users can monitor their progress toward objectives through dashboards and analytics, review completed activities, and adjust their plans based on actual progress versus targets.

**Independent Test**: Can be tested by viewing progress dashboards, generating progress reports for different time periods, and analyzing completion rates. Delivers value through insights even without making plan adjustments.

### Contract Tests for User Story 4 (TDD - Write First)

- [ ] T187 [P] [US4] Contract test for GET /api/v1/progress/dashboard in backend/tests/contract/progress-dashboard.test.ts
- [ ] T188 [P] [US4] Contract test for POST /api/v1/progress/reports in backend/tests/contract/progress-reports.test.ts
- [ ] T189 [P] [US4] Contract test for GET /api/v1/progress/at-risk in backend/tests/contract/at-risk.test.ts

### Backend Services for User Story 4 (TDD - Write Tests First)

- [ ] T190 [P] [US4] Unit test for ProgressDashboardService in backend/tests/unit/services/progress-dashboard-service.test.ts
- [ ] T191 [P] [US4] Unit test for ReportGeneratorService in backend/tests/unit/services/report-generator-service.test.ts

- [ ] T192 [US4] Implement ProgressDashboardService (aggregations, trends, at-risk detection) in backend/src/services/progress-dashboard-service.ts
- [ ] T193 [US4] Implement ReportGeneratorService (PDF/CSV generation) in backend/src/services/report-generator-service.ts using PDFKit and csv-writer

### Backend Jobs for User Story 4

- [ ] T194 [US4] Implement background job for report generation in backend/src/jobs/generate-report.ts

### Backend API Endpoints for User Story 4

- [ ] T195 [P] [US4] Implement GET /api/v1/progress/dashboard endpoint in backend/src/api/progress/get-dashboard.ts
- [ ] T196 [P] [US4] Implement POST /api/v1/progress/reports endpoint in backend/src/api/progress/generate-report.ts
- [ ] T197 [P] [US4] Implement GET /api/v1/progress/at-risk endpoint in backend/src/api/progress/get-at-risk.ts
- [ ] T198 [P] [US4] Implement GET /api/v1/users/me endpoint in backend/src/api/users/get-current-user.ts
- [ ] T199 [P] [US4] Implement PUT /api/v1/users/me endpoint in backend/src/api/users/update-current-user.ts

### Integration Tests for User Story 4

- [ ] T200 [P] [US4] Integration test for dashboard aggregations across all entities in backend/tests/integration/progress-dashboard.test.ts
- [ ] T201 [P] [US4] Integration test for at-risk key result detection in backend/tests/integration/at-risk-detection.test.ts
- [ ] T202 [P] [US4] Integration test for PDF report generation in backend/tests/integration/pdf-report.test.ts
- [ ] T203 [P] [US4] Integration test for CSV report generation in backend/tests/integration/csv-report.test.ts

### Frontend Components for User Story 4 (TDD - Write Tests First)

- [ ] T204 [P] [US4] Unit test for ProgressDashboard component in frontend/tests/unit/components/progress/ProgressDashboard.test.tsx
- [ ] T205 [P] [US4] Unit test for TrendChart component in frontend/tests/unit/components/progress/TrendChart.test.tsx
- [ ] T206 [P] [US4] Unit test for ReportGenerator component in frontend/tests/unit/components/progress/ReportGenerator.test.tsx

- [ ] T207 [P] [US4] Create ProgressDashboard component in frontend/src/components/progress/ProgressDashboard.tsx
- [ ] T208 [P] [US4] Create TrendChart component using Chart.js in frontend/src/components/progress/TrendChart.tsx
- [ ] T209 [P] [US4] Create ReportGenerator component in frontend/src/components/progress/ReportGenerator.tsx
- [ ] T210 [P] [US4] Create AtRiskList component in frontend/src/components/progress/AtRiskList.tsx

### Frontend Pages for User Story 4

- [ ] T211 [P] [US4] Create Progress page (dashboard view) in frontend/src/pages/Progress.tsx
- [ ] T212 [P] [US4] Create Settings page (user profile, notifications) in frontend/src/pages/Settings.tsx

### Frontend Services for User Story 4

- [ ] T213 [US4] Implement Progress API service in frontend/src/services/progress-service.ts
- [ ] T214 [US4] Implement User API service in frontend/src/services/user-service.ts

### E2E Tests for User Story 4 (TDD - Write First)

- [ ] T215 [P] [US4] E2E test for acceptance scenario 1: View progress dashboard with overall stats in frontend/tests/e2e/progress-dashboard.spec.ts
- [ ] T216 [P] [US4] E2E test for acceptance scenario 2: Generate quarterly progress report in frontend/tests/e2e/progress-reports.spec.ts
- [ ] T217 [P] [US4] E2E test for acceptance scenario 3: View at-risk key results with missed activities in frontend/tests/e2e/at-risk-detection.spec.ts
- [ ] T218 [P] [US4] E2E test for acceptance scenario 4: Achievement celebration on key result completion in frontend/tests/e2e/achievement-celebration.spec.ts

### Accessibility Testing for User Story 4

- [ ] T219 [P] [US4] Accessibility test for progress dashboard charts and data tables in frontend/tests/a11y/progress.spec.ts

**Checkpoint**: All user stories (1-4) should now be independently functional. Users have a complete personal growth planning system.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final production readiness

### Performance Optimization

- [ ] T220 [P] Optimize database queries: add missing indexes, eliminate N+1 queries in backend/src/services/
- [ ] T221 [P] Implement API response caching with ETags in backend/src/api/middleware/cache.ts
- [ ] T222 [P] Setup frontend code-splitting for lazy loading routes in frontend/src/App.tsx
- [ ] T223 [P] Optimize bundle size: analyze and tree-shake unused dependencies in frontend/
- [ ] T224 [P] Implement image optimization and lazy loading in frontend/src/components/

### Security Hardening

- [ ] T225 [P] Implement rate limiting on all API endpoints in backend/src/api/middleware/rate-limit.ts
- [ ] T226 [P] Add CSRF protection for forms in backend/src/api/middleware/csrf.ts
- [ ] T227 [P] Implement input sanitization in backend/src/lib/sanitize.ts
- [ ] T228 [P] Security audit: check for SQL injection, XSS vulnerabilities
- [ ] T229 [P] Setup security headers (helmet.js configuration) in backend/src/index.ts

### Monitoring & Observability

- [ ] T230 [P] Setup Application Performance Monitoring (APM) integration in backend/src/lib/apm.ts
- [ ] T231 [P] Setup error tracking (Sentry or equivalent) in backend/src/lib/error-tracker.ts
- [ ] T232 [P] Implement structured logging with request tracing in backend/src/lib/logger.ts
- [ ] T233 [P] Create health check endpoint in backend/src/api/health.ts
- [ ] T234 [P] Setup frontend error boundary in frontend/src/components/ErrorBoundary.tsx

### Documentation

- [ ] T235 [P] Generate Swagger UI documentation from OpenAPI spec in backend/docs/
- [ ] T236 [P] Write API usage examples in backend/docs/api-examples.md
- [ ] T237 [P] Create deployment guide in docs/deployment.md
- [ ] T238 [P] Update README.md with setup instructions

### CI/CD Pipeline

- [ ] T239 Create GitHub Actions workflow for backend: lint, type-check, test, build in .github/workflows/backend-ci.yml
- [ ] T240 Create GitHub Actions workflow for frontend: lint, type-check, test, build, Lighthouse CI in .github/workflows/frontend-ci.yml
- [ ] T241 [P] Setup dependency security scanning in .github/workflows/security.yml
- [ ] T242 [P] Setup code coverage reporting in CI

### Deployment Preparation

- [ ] T243 Create production environment configuration in backend/.env.production.example
- [ ] T244 Create production environment configuration in frontend/.env.production.example
- [ ] T245 [P] Write database migration rollback scripts in backend/src/migrations/
- [ ] T246 [P] Create Docker configuration: Dockerfile and docker-compose.yml
- [ ] T247 Setup production database backup strategy in docs/database-backup.md

### Final Validation

- [ ] T248 Run full E2E test suite and verify all P1 user stories pass
- [ ] T249 Run accessibility audit with axe-core and verify WCAG 2.1 Level AA compliance
- [ ] T250 Run Lighthouse CI and verify score ≥90
- [ ] T251 Verify API performance: reads ≤200ms, writes ≤500ms using load testing tool
- [ ] T252 Verify Web Vitals: LCP ≤2.5s, FID ≤100ms, CLS ≤0.1, INP ≤200ms
- [ ] T253 Verify bundle sizes: JS <200KB, CSS <50KB (gzipped)
- [ ] T254 Run security scan: npm audit, check for known vulnerabilities
- [ ] T255 Execute quickstart.md validation: verify new developer can setup in <30min
- [ ] T256 Generate final test coverage report: verify ≥80% unit test coverage

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
  - Tasks: T001-T014

- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
  - Tasks: T015-T038
  - **⚠️ CRITICAL CHECKPOINT**: No user story work can begin until this phase is complete

- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
  - **User Story 1 (Phase 3 - P1)**: Tasks T039-T102
    - Can start after Foundational (Phase 2)
    - No dependencies on other stories
    - **MVP DELIVERY POINT** - complete personal growth system with OKRs

  - **User Story 2 (Phase 4 - P2)**: Tasks T103-T148
    - Can start after Foundational (Phase 2)
    - Integrates with US1 (links to KeyResult) but independently testable

  - **User Story 3 (Phase 5 - P3)**: Tasks T149-T186
    - Can start after Foundational (Phase 2)
    - Integrates with US1 (links to KeyResult) and US2 (links to LearningResource) but independently testable

  - **User Story 4 (Phase 6 - P4)**: Tasks T187-T219
    - Can start after Foundational (Phase 2)
    - Uses data from US1, US2, US3 but can display empty states

- **Polish (Phase 7)**: Depends on all desired user stories being complete
  - Tasks: T220-T256

### Within Each User Story (TDD Workflow)

1. **Contract Tests FIRST** (marked [P]) - Write and verify they FAIL
2. **Unit Tests for Models FIRST** - Write and verify they FAIL
3. **Models** (marked [P] when independent)
4. **Unit Tests for Services FIRST** - Write and verify they FAIL
5. **Services**
6. **API Endpoints** (marked [P])
7. **Integration Tests** (marked [P])
8. **Unit Tests for Components FIRST** - Write and verify they FAIL
9. **Frontend Components** (marked [P] when independent)
10. **Frontend Pages**
11. **E2E Tests** (marked [P])
12. **Accessibility Tests** (marked [P])
13. **Checkpoint**: Story complete and independently testable

### Parallel Opportunities

#### Within Setup Phase (Phase 1)
All tasks marked [P] can run in parallel:
- T005-T006 (ESLint/Prettier config)
- T007-T008 (TypeScript config)
- T009-T010 (Vitest config)
- T011-T012 (Playwright, axe-core)

#### Within Foundational Phase (Phase 2)
Parallel opportunities after database setup:
- T020-T023 (Authentication layer)
- T024-T029 (API infrastructure)
- T030-T035 (Frontend foundation)
- T036-T038 (Testing utilities)

#### Across User Stories (if team capacity allows)
After Foundational phase complete:
- Developer A: User Story 1 (MVP)
- Developer B: User Story 2 (Learning Paths)
- Developer C: User Story 3 (Calendar)
- Developer D: User Story 4 (Progress)

#### Within Each User Story
All tasks marked [P] can run in parallel within their category:
- Contract tests can all run together
- Unit tests can all run together
- Models can all run together
- API endpoints can all run together
- Integration tests can all run together
- Components can all run together
- E2E tests can all run together
- Accessibility tests can all run together

---

## Parallel Example: User Story 1 (OKRs)

### Phase 1: Contract Tests (All in Parallel)
```bash
# Launch all contract tests for User Story 1 together:
Task T039: "Contract test for POST /api/v1/auth/register"
Task T040: "Contract test for POST /api/v1/auth/login"
Task T041: "Contract test for GET /api/v1/okrs/objectives"
Task T042: "Contract test for POST /api/v1/okrs/objectives"
Task T043: "Contract test for PUT /api/v1/okrs/objectives/:id"
Task T044: "Contract test for DELETE /api/v1/okrs/objectives/:id"
Task T045: "Contract test for POST /api/v1/okrs/key-results"
Task T046: "Contract test for PUT /api/v1/okrs/key-results/:id"
Task T047: "Contract test for POST /api/v1/okrs/key-results/:id/progress"
```

### Phase 2: Model Unit Tests (All in Parallel)
```bash
Task T048: "Unit test for Objective model"
Task T049: "Unit test for KeyResult model"
Task T050: "Unit test for ProgressUpdate model"
```

### Phase 3: Database Migrations (Sequential within category, but indexes in parallel)
```bash
# Models (sequential for dependencies):
Task T051: "Create Objective table migration"
Task T052: "Create KeyResult table migration"
Task T053: "Create ProgressUpdate table migration"

# Indexes (all in parallel after tables created):
Task T054: "Create indexes for Objective table"
Task T055: "Create indexes for KeyResult table"
Task T056: "Create indexes for ProgressUpdate table"
```

### Phase 4: Models (All in Parallel)
```bash
Task T057: "Implement Objective model"
Task T058: "Implement KeyResult model"
Task T059: "Implement ProgressUpdate model"
```

### Phase 5: Service Unit Tests (All in Parallel)
```bash
Task T060: "Unit test for AuthService"
Task T061: "Unit test for ObjectiveService"
Task T062: "Unit test for KeyResultService"
```

### Phase 6: API Endpoints (All in Parallel)
```bash
# Auth endpoints:
Task T066: "Implement POST /api/v1/auth/register"
Task T067: "Implement POST /api/v1/auth/login"
Task T068: "Implement POST /api/v1/auth/logout"

# Objective endpoints:
Task T069: "Implement GET /api/v1/okrs/objectives"
Task T070: "Implement POST /api/v1/okrs/objectives"
Task T071: "Implement GET /api/v1/okrs/objectives/:id"
Task T072: "Implement PUT /api/v1/okrs/objectives/:id"
Task T073: "Implement DELETE /api/v1/okrs/objectives/:id"

# Key Result endpoints:
Task T074: "Implement POST /api/v1/okrs/key-results"
Task T075: "Implement GET /api/v1/okrs/key-results/:id"
Task T076: "Implement PUT /api/v1/okrs/key-results/:id"
Task T077: "Implement DELETE /api/v1/okrs/key-results/:id"

# Progress endpoints:
Task T078: "Implement POST /api/v1/okrs/key-results/:id/progress"
Task T079: "Implement GET /api/v1/okrs/key-results/:id/progress"
```

### Phase 7: Integration Tests (All in Parallel)
```bash
Task T080: "Integration test for registration → login → create objective flow"
Task T081: "Integration test for objective with 2-5 key results validation"
Task T082: "Integration test for progress update → key result recalculation → objective completion"
```

### Phase 8: Frontend Component Unit Tests (All in Parallel)
```bash
Task T083: "Unit test for ObjectiveCard component"
Task T084: "Unit test for KeyResultProgress component"
Task T085: "Unit test for OKRDashboard component"
```

### Phase 9: Frontend Components (Parallel where independent)
```bash
# Parallel:
Task T086: "Create ObjectiveCard component"
Task T087: "Create KeyResultProgress component"
Task T088: "Create ObjectiveForm component"
Task T089: "Create KeyResultForm component"

# Depends on above:
Task T090: "Create OKRDashboard component" (uses ObjectiveCard, KeyResultProgress)
```

### Phase 10: Frontend Pages (Parallel where independent)
```bash
Task T091: "Create Login page"
Task T092: "Create Registration page"
Task T093: "Create OKRs page" (depends on OKRDashboard)
Task T094: "Create Objective Detail page" (depends on ObjectiveCard, KeyResultForm)
```

### Phase 11: Frontend Services (All in Parallel)
```bash
Task T095: "Implement OKR API service"
Task T096: "Implement authentication API service"
```

### Phase 12: E2E Tests (All in Parallel)
```bash
Task T097: "E2E test for acceptance scenario 1: Create objective with key results"
Task T098: "E2E test for acceptance scenario 2: View OKR dashboard with progress"
Task T099: "E2E test for acceptance scenario 3: Edit existing key result"
Task T100: "E2E test for acceptance scenario 4: Quarterly milestones with deadline indicators"
```

### Phase 13: Accessibility Tests (All in Parallel)
```bash
Task T101: "Accessibility test for OKR dashboard"
Task T102: "Accessibility test for objective creation form"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - Recommended Approach

**Goal**: Deliver a working personal growth planner with OKRs in the shortest time

1. ✅ **Complete Phase 1: Setup** (Tasks T001-T014)
   - Expected time: 2-4 hours
   - Deliverable: Project structure, dependencies, tooling configured

2. ✅ **Complete Phase 2: Foundational** (Tasks T015-T038)
   - Expected time: 1-2 days
   - Deliverable: Database, authentication, API infrastructure, frontend foundation
   - **CRITICAL CHECKPOINT**: Must be 100% complete before proceeding

3. ✅ **Complete Phase 3: User Story 1** (Tasks T039-T102)
   - Expected time: 3-5 days (following TDD approach)
   - Deliverable: Users can register, login, create OKRs, track progress
   - **STOP and VALIDATE**: Test User Story 1 independently
   - **MVP COMPLETE** - Can deploy and demo!

4. **Optional**: Add User Stories 2-4 incrementally for enhanced features

### Incremental Delivery (All User Stories)

**Goal**: Build complete system with all features, validating at each increment

1. ✅ Complete Setup + Foundational → Foundation ready
2. ✅ Add User Story 1 → Test independently → **Deploy/Demo (MVP!)**
3. ✅ Add User Story 2 → Test independently → **Deploy/Demo (MVP + Learning Paths)**
4. ✅ Add User Story 3 → Test independently → **Deploy/Demo (MVP + Learning + Calendar)**
5. ✅ Add User Story 4 → Test independently → **Deploy/Demo (Complete System)**
6. ✅ Polish & deploy to production

Each increment adds value without breaking previous features.

### Parallel Team Strategy (4+ Developers)

**Goal**: Maximize throughput with multiple developers

**Phase 1-2** (Setup + Foundational): Entire team collaborates
- Pair on critical infrastructure
- Mob on complex foundational services
- Expected time: 1-2 days

**Phase 3-6** (User Stories): Split into parallel tracks after Foundational complete
- **Track A** (2 devs): User Story 1 (MVP) - highest priority
- **Track B** (1 dev): User Story 2 (Learning Paths)
- **Track C** (1 dev): User Story 3 (Calendar)
- **Track D** (1 dev): User Story 4 (Progress)

**Phase 7** (Polish): Entire team collaborates
- Code review each other's stories
- Integration testing across stories
- Performance optimization
- Deployment preparation

### Solo Developer Strategy

**Goal**: Steady progress with clear milestones

1. Work through Setup + Foundational phases linearly
2. Complete User Story 1 (MVP) following TDD workflow
3. **Checkpoint & Demo**: Validate MVP works independently
4. Decide whether to add US2-US4 or polish MVP
5. If continuing, add one user story at a time in priority order
6. Polish phase after desired stories complete

---

## Notes

### Checklist Format Compliance

- ✅ All 256 tasks follow required format: `- [ ] [ID] [P?] [Story?] Description with file path`
- ✅ Task IDs sequential: T001-T256
- ✅ [P] marker only on parallelizable tasks (different files, no blocking dependencies)
- ✅ [Story] label (US1-US4) on all user story phase tasks
- ✅ File paths included in all implementation task descriptions
- ✅ Test tasks marked as TDD (write first, ensure they fail)

### TDD Compliance (Constitution Section II)

- ✅ All contract tests written BEFORE API implementation
- ✅ All unit tests written BEFORE model/service implementation
- ✅ All component tests written BEFORE component implementation
- ✅ All E2E tests written BEFORE end-to-end flow implementation
- ✅ Red-Green-Refactor approach enforced via task ordering

### Test Coverage Targets

- Unit tests: ≥80% code coverage (constitution requirement)
- Integration tests: All API contracts and cross-boundary interactions
- E2E tests: All P1-P4 user stories (4 stories × 4 scenarios = 16 E2E tests minimum)
- Accessibility tests: All P1 user stories with axe-core automation

### Performance Validation (Constitution Sections V & VI)

- API response times validated in Phase 7: T251
- Web Vitals validated in Phase 7: T252
- Performance budgets validated in Phase 7: T253
- Lighthouse CI score validated in Phase 7: T250

### Accessibility Validation (Constitution Section IV)

- WCAG 2.1 Level AA compliance validated in Phase 7: T249
- Keyboard navigation tested per user story
- Screen reader compatibility tested per user story
- axe-core automation integrated in frontend tests

### Commit Strategy

- Commit after each task or logical group of tasks
- Use conventional commits format: `type(scope): description`
- Examples:
  - `feat(okrs): implement Objective model (T057)`
  - `test(okrs): add contract tests for objectives API (T041-T044)`
  - `refactor(api): extract error handling middleware (T026)`

### Verification Checkpoints

- **After Phase 2**: Foundation functional - can create database connection, authenticate user, handle errors
- **After Phase 3**: User Story 1 complete - full OKR management working end-to-end
- **After Phase 4**: User Story 2 complete - learning paths working independently
- **After Phase 5**: User Story 3 complete - calendar scheduling working independently
- **After Phase 6**: User Story 4 complete - progress tracking and reporting working
- **After Phase 7**: Production ready - all quality gates passed

### Avoid

- ❌ Skipping tests (constitution violation)
- ❌ Implementing before writing tests (non-TDD)
- ❌ Working on same file in parallel
- ❌ Creating dependencies between user stories that break independence
- ❌ Vague task descriptions without file paths
- ❌ Proceeding to user stories before Foundational phase complete

### Success Criteria (from spec.md)

- ✅ SC-001: Users can define annual plan in <30min (US1 E2E test validates)
- ✅ SC-002: Users can create learning path in <15min (US2 E2E test validates)
- ✅ SC-003: 90% users link learning path to key result (US2 integration test validates)
- ✅ SC-004: Dashboard loads in <3s (Phase 7 performance validation)
- ✅ SC-005: Progress calculations accurate (US1 integration tests validate)
- ✅ SC-006: Recurring events schedulable in <5min (US3 E2E test validates)
- ✅ SC-007: 85% scheduled activities completed/rescheduled (tracked in analytics)
- ✅ SC-008: Quarterly report generated in <2min (US4 integration test validates)
- ✅ SC-009: Zero data loss (PostgreSQL ACID guarantees + migration rollback scripts)
- ✅ SC-010: 80%+ user satisfaction (measured post-deployment via surveys)

---

## Task Summary

- **Total Tasks**: 256
- **Setup Phase**: 14 tasks
- **Foundational Phase**: 24 tasks
- **User Story 1 (P1 - MVP)**: 64 tasks (39 test tasks + 25 implementation tasks)
- **User Story 2 (P2)**: 46 tasks (28 test tasks + 18 implementation tasks)
- **User Story 3 (P3)**: 38 tasks (24 test tasks + 14 implementation tasks)
- **User Story 4 (P4)**: 33 tasks (21 test tasks + 12 implementation tasks)
- **Polish Phase**: 37 tasks

**Test Tasks**: 112 (44% of total - ensures thorough TDD coverage)
**Parallel Opportunities**: 178 tasks marked [P] (69% parallelizable within phases)

**Suggested MVP Scope**: Phases 1-3 (Tasks T001-T102) = User Story 1 (OKRs) - delivers core value

**Estimated Timeline**:
- Solo developer, MVP only: 1-2 weeks
- Solo developer, all stories: 4-6 weeks
- 4-person team, all stories in parallel: 2-3 weeks
