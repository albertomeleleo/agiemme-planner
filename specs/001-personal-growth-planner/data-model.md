# Data Model: Personal Growth Planner

**Branch**: `001-personal-growth-planner` | **Date**: 2025-12-28 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

This document defines the core data entities for the Personal Growth Planner application, their relationships, validation rules, and state transitions. The data model supports OKR management, learning path tracking, calendar scheduling, and progress monitoring.

**Database**: PostgreSQL 16 (relational database with ACID guarantees for zero data loss per SC-009)

---

## Entity Definitions

### 1. User

Represents a person using the system for personal growth planning.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email for authentication and notifications |
| `passwordHash` | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| `firstName` | VARCHAR(100) | NOT NULL | User's first name |
| `lastName` | VARCHAR(100) | NOT NULL | User's last name |
| `timezone` | VARCHAR(50) | NOT NULL, DEFAULT 'UTC' | IANA timezone (e.g., 'America/New_York') |
| `notificationPreferences` | JSONB | NOT NULL, DEFAULT '{"email": true, "reminderHours": 24}' | Notification settings |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last profile update timestamp |

**Validation Rules**:
- Email must be valid email format (RFC 5322)
- Password must be ≥8 characters (enforced before hashing)
- Timezone must be valid IANA timezone identifier
- `notificationPreferences.reminderHours` must be positive integer (default: 24)

**Relationships**:
- One-to-many with `Objective` (user owns objectives)
- One-to-many with `LearningPath` (user owns learning paths)
- One-to-many with `CalendarEvent` (user owns calendar events)

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`

---

### 2. Objective

Represents a high-level personal growth goal using the OKR framework.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique objective identifier |
| `userId` | UUID | FOREIGN KEY (User.id), NOT NULL | Owner of this objective |
| `title` | VARCHAR(200) | NOT NULL | Objective title (e.g., "Advance my career in software engineering") |
| `description` | TEXT | NULL | Detailed description of the objective |
| `category` | ENUM | NOT NULL | Life area: 'career', 'health', 'relationships', 'skills', 'financial', 'personal' |
| `targetDate` | DATE | NOT NULL | Target completion date for this objective |
| `status` | ENUM | NOT NULL, DEFAULT 'active' | Status: 'active', 'completed', 'archived', 'abandoned' |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Objective creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Validation Rules**:
- Title length: 5-200 characters
- Target date must be in the future (at creation time)
- Each objective must have 2-5 key results (enforced via business logic per FR-002)
- Category must be one of the defined enum values

**Relationships**:
- Many-to-one with `User` (objective belongs to user)
- One-to-many with `KeyResult` (objective has multiple key results)

**State Transitions**:
```
active → completed (when all key results reach 100%)
active → archived (user manually archives)
active → abandoned (user gives up on objective)
completed → archived (user archives historical data)
archived → active (user reactivates)
```

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `userId` (for fetching user's objectives)
- INDEX on `category` (for filtering by life area)
- INDEX on `status` (for filtering active vs archived)
- INDEX on `targetDate` (for deadline proximity sorting)

**Business Logic**:
- When all key results reach 100% completion, objective status auto-transitions to 'completed'
- Deleting an objective cascades to all related key results and progress updates

---

### 3. KeyResult

Represents a measurable outcome that indicates objective achievement.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique key result identifier |
| `objectiveId` | UUID | FOREIGN KEY (Objective.id), NOT NULL | Parent objective |
| `description` | VARCHAR(300) | NOT NULL | Measurable key result (e.g., "Complete 3 certifications") |
| `targetValue` | DECIMAL(10,2) | NOT NULL | Target value to achieve (e.g., 3.00) |
| `currentValue` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Current progress value (e.g., 1.00) |
| `unit` | VARCHAR(50) | NOT NULL | Unit of measurement (e.g., "certifications", "projects", "hours", "%") |
| `deadline` | DATE | NOT NULL | Key result deadline (typically quarterly milestone) |
| `completionPercentage` | DECIMAL(5,2) | NOT NULL, DEFAULT 0, COMPUTED | Calculated: (currentValue / targetValue) * 100, capped at 100 |
| `status` | ENUM | NOT NULL, DEFAULT 'not_started' | Status: 'not_started', 'in_progress', 'completed', 'at_risk' |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Key result creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Validation Rules**:
- Description length: 10-300 characters
- `targetValue` must be > 0
- `currentValue` must be >= 0 and <= `targetValue`
- Deadline must be <= parent objective's target date
- Each objective must have 2-5 key results (enforced via business logic per FR-002)

**Relationships**:
- Many-to-one with `Objective` (key result belongs to objective)
- One-to-many with `ProgressUpdate` (key result has progress history)
- One-to-many with `LearningPath` (key results can have linked learning paths)
- One-to-many with `CalendarEvent` (calendar events can link to key results)

**State Transitions**:
```
not_started → in_progress (when currentValue > 0)
in_progress → completed (when currentValue >= targetValue)
in_progress → at_risk (when deadline approaching and progress < 50%)
completed → in_progress (if currentValue decreases)
```

**Computed Fields**:
- `completionPercentage = MIN((currentValue / targetValue) * 100, 100)`
- `status = 'at_risk'` if (days until deadline < 14) AND (completionPercentage < 50%)

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `objectiveId` (for fetching objective's key results)
- INDEX on `deadline` (for identifying at-risk key results)
- INDEX on `status` (for filtering by status)

**Business Logic**:
- When `currentValue` updated, recalculate `completionPercentage` and update `status`
- When key result reaches 100%, check if all sibling key results are 100% to mark parent objective as 'completed'
- Auto-flag as 'at_risk' if deadline approaching (configurable threshold, default 14 days) and progress < 50%

---

### 4. ProgressUpdate

Represents a point-in-time record of key result advancement.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique progress update identifier |
| `keyResultId` | UUID | FOREIGN KEY (KeyResult.id), NOT NULL | Key result being updated |
| `valueRecorded` | DECIMAL(10,2) | NOT NULL | Progress value at this point in time |
| `notes` | TEXT | NULL | Optional user notes about this progress (e.g., "Completed AWS certification") |
| `recordedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | When this progress was recorded |

**Validation Rules**:
- `valueRecorded` must be >= 0 and <= parent key result's `targetValue`
- Notes max length: 1000 characters

**Relationships**:
- Many-to-one with `KeyResult` (progress update belongs to key result)

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `keyResultId` (for fetching progress history)
- INDEX on `recordedAt` (for timeline queries and trend analysis)

**Business Logic**:
- Creating a `ProgressUpdate` automatically updates the parent `KeyResult.currentValue` to `valueRecorded`
- Maintains immutable historical record for trend analysis (per FR-025)
- Used for progress reports and charts showing advancement over time

---

### 5. LearningPath

Represents a structured approach to acquiring knowledge or skills.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique learning path identifier |
| `userId` | UUID | FOREIGN KEY (User.id), NOT NULL | Owner of this learning path |
| `keyResultId` | UUID | FOREIGN KEY (KeyResult.id), NULL | Optional: linked key result this path supports |
| `name` | VARCHAR(200) | NOT NULL | Learning path name (e.g., "Master React Development") |
| `description` | TEXT | NULL | Detailed description of learning goals |
| `estimatedDurationHours` | INTEGER | NOT NULL | Estimated total hours to complete (sum of resources) |
| `completionPercentage` | DECIMAL(5,2) | NOT NULL, DEFAULT 0, COMPUTED | Calculated: (completed resources / total resources) * 100 |
| `status` | ENUM | NOT NULL, DEFAULT 'not_started' | Status: 'not_started', 'in_progress', 'completed' |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Learning path creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Validation Rules**:
- Name length: 5-200 characters
- `estimatedDurationHours` must be > 0
- If `keyResultId` is set, must reference valid existing key result

**Relationships**:
- Many-to-one with `User` (learning path belongs to user)
- Many-to-one with `KeyResult` (optional: learning path supports key result per FR-011)
- One-to-many with `LearningResource` (learning path contains resources)

**State Transitions**:
```
not_started → in_progress (when first resource marked complete)
in_progress → completed (when all resources marked complete)
completed → in_progress (if a resource is un-marked)
```

**Computed Fields**:
- `completionPercentage = (COUNT(completed resources) / COUNT(total resources)) * 100`
- `estimatedDurationHours = SUM(LearningResource.estimatedTimeHours)` (updated when resources added/removed)

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `userId` (for fetching user's learning paths)
- INDEX on `keyResultId` (for fetching learning paths linked to key result)
- INDEX on `status` (for filtering by status)

**Business Logic**:
- When a `LearningResource` is marked complete, recalculate learning path `completionPercentage` and update `status`
- When linked to a `KeyResult`, completing the learning path may trigger progress update suggestions to the user

---

### 6. LearningResource

Represents individual learning materials or activities within a learning path.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique learning resource identifier |
| `learningPathId` | UUID | FOREIGN KEY (LearningPath.id), NOT NULL | Parent learning path |
| `name` | VARCHAR(200) | NOT NULL | Resource name (e.g., "React Hooks Tutorial - Udemy") |
| `type` | ENUM | NOT NULL | Resource type: 'book', 'course', 'article', 'video', 'practice_project', 'other' |
| `reference` | VARCHAR(500) | NULL | URL or reference (e.g., "https://udemy.com/...") |
| `estimatedTimeHours` | DECIMAL(5,2) | NOT NULL | Estimated hours to complete this resource |
| `sequenceOrder` | INTEGER | NOT NULL | Order in learning path (1, 2, 3, ...) |
| `completionStatus` | ENUM | NOT NULL, DEFAULT 'not_started' | Status: 'not_started', 'in_progress', 'completed' |
| `completedAt` | TIMESTAMP | NULL | When resource was marked complete |
| `notes` | TEXT | NULL | User notes/reflections after completion (per FR-013) |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Resource creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Validation Rules**:
- Name length: 5-200 characters
- `estimatedTimeHours` must be > 0
- `reference` max length: 500 characters (should be valid URL if provided)
- `sequenceOrder` must be unique within learning path and > 0
- Notes max length: 2000 characters

**Relationships**:
- Many-to-one with `LearningPath` (resource belongs to learning path)
- One-to-many with `CalendarEvent` (calendar events can link to resources per FR-019)

**State Transitions**:
```
not_started → in_progress (user starts working on resource)
not_started → completed (user marks complete directly)
in_progress → completed (user finishes resource)
completed → in_progress (user un-marks if they need to revisit)
```

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `learningPathId` (for fetching path's resources)
- INDEX on `sequenceOrder` within `learningPathId` (for ordered display)
- INDEX on `completionStatus` (for filtering)

**Business Logic**:
- When marked `completed`, set `completedAt` timestamp and trigger learning path recalculation
- `sequenceOrder` should auto-increment when new resources added (e.g., max(sequenceOrder) + 1)
- Deleting a resource recalculates parent learning path's `estimatedDurationHours` and `completionPercentage`

---

### 7. CalendarEvent

Represents scheduled time for growth activities.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique calendar event identifier |
| `userId` | UUID | FOREIGN KEY (User.id), NOT NULL | Owner of this event |
| `learningResourceId` | UUID | FOREIGN KEY (LearningResource.id), NULL | Optional: linked learning resource |
| `keyResultId` | UUID | FOREIGN KEY (KeyResult.id), NULL | Optional: linked key result for general goal work |
| `title` | VARCHAR(200) | NOT NULL | Event title (e.g., "React Tutorial - Components") |
| `description` | TEXT | NULL | Event description or agenda |
| `startDateTime` | TIMESTAMP | NOT NULL | Event start date and time (UTC) |
| `durationMinutes` | INTEGER | NOT NULL | Event duration in minutes |
| `recurrenceRule` | VARCHAR(200) | NULL | iCalendar RRULE format (e.g., "FREQ=WEEKLY;BYDAY=FR") for recurring events |
| `recurrenceEndDate` | DATE | NULL | End date for recurring series (if applicable) |
| `category` | ENUM | NOT NULL | Matches Objective categories: 'career', 'health', 'relationships', 'skills', 'financial', 'personal' |
| `completionStatus` | ENUM | NOT NULL, DEFAULT 'scheduled' | Status: 'scheduled', 'in_progress', 'completed', 'cancelled' |
| `completedAt` | TIMESTAMP | NULL | When event was marked complete |
| `reminderSent` | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether email reminder was sent |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Event creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Validation Rules**:
- Title length: 5-200 characters
- `durationMinutes` must be > 0 and <= 1440 (24 hours)
- Either `learningResourceId` OR `keyResultId` can be set, not both (enforced via CHECK constraint or application logic)
- If `recurrenceRule` is set, `recurrenceEndDate` should be set
- `recurrenceRule` must be valid iCalendar RRULE format
- `startDateTime` should be in the future (at creation time)

**Relationships**:
- Many-to-one with `User` (event belongs to user)
- Many-to-one with `LearningResource` (optional: event scheduled for learning resource per FR-019)
- Many-to-one with `KeyResult` (optional: event scheduled for general key result work per FR-019)

**State Transitions**:
```
scheduled → in_progress (user starts working on scheduled activity)
scheduled → completed (user marks event complete)
scheduled → cancelled (user cancels event)
in_progress → completed (user finishes activity)
completed → scheduled (user un-marks if they didn't actually complete)
```

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `userId` (for fetching user's calendar)
- INDEX on `startDateTime` (for date range queries and sorting)
- INDEX on `category` (for filtering by life area)
- INDEX on `completionStatus` (for filtering)
- INDEX on `learningResourceId` (for finding events linked to resource)
- INDEX on `keyResultId` (for finding events linked to key result)

**Business Logic**:
- When marked `completed`:
  - Set `completedAt` timestamp
  - If linked to `learningResourceId`, optionally mark that resource as complete (with user confirmation)
  - If linked to `keyResultId`, optionally prompt user to update key result progress
- Recurring events: Store as single record with `recurrenceRule`, generate instances on-the-fly for display
- Reminder emails: Background job checks events with `startDateTime` within reminder window (default 24h) and `reminderSent = FALSE`
- Color-coding by `category` for visual differentiation (per FR-017)

---

## Entity Relationship Diagram

```
User (1) ──────< (N) Objective
               │
               └──< (N) KeyResult ──< (N) ProgressUpdate
                      │
                      └──< (N) LearningPath
                               │
                               └──< (N) LearningResource
                                        │
                                        └──< (N) CalendarEvent

User (1) ──────< (N) LearningPath
User (1) ──────< (N) CalendarEvent

CalendarEvent (N) >──── (1) LearningResource [optional]
CalendarEvent (N) >──── (1) KeyResult [optional]
```

**Key Relationships**:
1. **User → Objective (1:N)**: Users create multiple objectives across life areas
2. **Objective → KeyResult (1:N, 2-5)**: Each objective has 2-5 measurable key results
3. **KeyResult → ProgressUpdate (1:N)**: Key results have historical progress records
4. **KeyResult → LearningPath (1:N)**: Key results can have supporting learning paths
5. **LearningPath → LearningResource (1:N)**: Learning paths contain ordered resources
6. **LearningResource → CalendarEvent (1:N)**: Resources can have scheduled study sessions
7. **KeyResult → CalendarEvent (1:N)**: General goal work can be scheduled
8. **User → LearningPath (1:N)**: Users own learning paths
9. **User → CalendarEvent (1:N)**: Users own calendar events

---

## Database Schema Notes

### Cascade Delete Behavior
- Deleting `User` → CASCADE delete all owned `Objective`, `LearningPath`, `CalendarEvent`
- Deleting `Objective` → CASCADE delete all `KeyResult` → CASCADE delete all `ProgressUpdate`
- Deleting `KeyResult` → SET NULL on `LearningPath.keyResultId`, CASCADE delete `ProgressUpdate`, SET NULL on `CalendarEvent.keyResultId`
- Deleting `LearningPath` → CASCADE delete all `LearningResource`
- Deleting `LearningResource` → SET NULL on `CalendarEvent.learningResourceId`

### ENUM Types
Create PostgreSQL ENUM types:
```sql
CREATE TYPE objective_category AS ENUM ('career', 'health', 'relationships', 'skills', 'financial', 'personal');
CREATE TYPE objective_status AS ENUM ('active', 'completed', 'archived', 'abandoned');
CREATE TYPE key_result_status AS ENUM ('not_started', 'in_progress', 'completed', 'at_risk');
CREATE TYPE learning_path_status AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE learning_resource_type AS ENUM ('book', 'course', 'article', 'video', 'practice_project', 'other');
CREATE TYPE learning_resource_status AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE calendar_event_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
```

### Constraints
- UNIQUE constraint on `(LearningPath.id, LearningResource.sequenceOrder)` to prevent duplicate sequence orders
- CHECK constraint on `CalendarEvent` to ensure only one of `learningResourceId` or `keyResultId` is set:
  ```sql
  CHECK ((learningResourceId IS NULL) OR (keyResultId IS NULL))
  ```
- CHECK constraint on `KeyResult.currentValue <= KeyResult.targetValue`

### Computed Fields Implementation
- `KeyResult.completionPercentage`: Computed in application layer on read, or use PostgreSQL GENERATED COLUMN if supported
- `LearningPath.completionPercentage`: Computed via JOIN query in application layer
- `LearningPath.estimatedDurationHours`: Computed via SUM query in application layer

---

## Validation Summary

All validation rules align with functional requirements (FR-001 through FR-029) and success criteria (SC-001 through SC-010). Key validations include:

1. **Data Integrity**: Foreign keys, NOT NULL constraints, UNIQUE constraints
2. **Business Rules**: 2-5 key results per objective, targetValue > 0, currentValue <= targetValue
3. **Date Logic**: Deadlines must be valid, target dates in future
4. **String Lengths**: Prevent overly long or short inputs
5. **Enum Values**: Category and status fields constrained to defined values
6. **Mutual Exclusivity**: Calendar events link to either learning resource OR key result, not both

---

## Indexes Strategy

Indexes are designed to support the following query patterns from user stories:

1. **Dashboard view (US-1)**: Fetch all objectives by `userId`, filter by `category`, sort by `targetDate`
2. **Progress tracking (US-4)**: Fetch key results by `objectiveId`, fetch progress updates by `keyResultId` ordered by `recordedAt`
3. **Learning path view (US-2)**: Fetch learning paths by `userId`, fetch resources by `learningPathId` ordered by `sequenceOrder`
4. **Calendar view (US-3)**: Fetch events by `userId` within date range (`startDateTime`), filter by `category` and `completionStatus`
5. **At-risk identification**: Filter key results by `status = 'at_risk'` and `deadline`

All indexes align with constitution's performance requirements (<200ms reads, <500ms writes, no full table scans on tables >1000 rows).

---

## Migration Strategy

**Initial Schema Creation**:
1. Create ENUM types
2. Create `User` table
3. Create `Objective` table with foreign key to `User`
4. Create `KeyResult` table with foreign key to `Objective`
5. Create `ProgressUpdate` table with foreign key to `KeyResult`
6. Create `LearningPath` table with foreign keys to `User` and `KeyResult`
7. Create `LearningResource` table with foreign key to `LearningPath`
8. Create `CalendarEvent` table with foreign keys to `User`, `LearningResource`, and `KeyResult`
9. Add all indexes
10. Add CHECK constraints

**Seed Data** (for testing):
- Create sample user with email/password
- Create 3-5 sample objectives across different categories
- Create 2-3 key results per objective
- Create 2 learning paths linked to key results
- Create 5+ learning resources per path
- Create sample calendar events

**Zero Data Loss** (per SC-009):
- All migrations use transactions
- Backup before migration
- Test migrations on copy of production data
- Rollback script for each migration
