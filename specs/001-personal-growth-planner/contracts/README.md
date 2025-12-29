# API Contracts: Personal Growth Planner

**Branch**: `001-personal-growth-planner` | **Date**: 2025-12-28

## Overview

This directory contains the API contract specifications for the Personal Growth Planner application, generated from the feature specification and data model.

## Contents

- **openapi.yaml**: OpenAPI 3.0.3 specification for all REST API endpoints
  - Authentication endpoints (register, login, logout)
  - OKR management endpoints (objectives, key results, progress updates)
  - Learning path endpoints (paths, resources)
  - Calendar endpoints (events, scheduling, completion)
  - Progress tracking endpoints (dashboard, reports, at-risk)
  - User profile endpoints

## API Structure

### Endpoint Organization

The API is organized into logical domains:

1. **Authentication** (`/api/v1/auth/*`)
   - User registration, login, logout
   - JWT-based authentication

2. **OKRs** (`/api/v1/okrs/*`)
   - Objective CRUD operations
   - Key result CRUD operations
   - Progress update recording and history

3. **Learning Paths** (`/api/v1/learning-paths/*`, `/api/v1/learning-resources/*`)
   - Learning path CRUD operations
   - Learning resource CRUD operations
   - Resource completion tracking

4. **Calendar** (`/api/v1/calendar/*`)
   - Calendar event CRUD operations
   - Event scheduling and recurrence
   - Event completion tracking

5. **Progress** (`/api/v1/progress/*`)
   - Overall progress dashboard
   - Custom report generation (PDF, CSV)
   - At-risk key result identification

6. **Users** (`/api/v1/users/*`)
   - User profile management
   - Notification preferences

### Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication via Bearer token (JWT):

```
Authorization: Bearer <jwt-token>
```

### Performance Targets

All API endpoints must meet constitutional performance requirements:

- **Read operations**: ≤200ms (95th percentile)
- **Write operations**: ≤500ms (95th percentile)
- **Complex queries** (reports, dashboard): ≤1000ms (95th percentile)

### Validation

All request payloads are validated against the schemas defined in the OpenAPI spec. Validation errors return:

- **HTTP 422 Unprocessable Entity**
- JSON response with field-level validation errors

### Error Handling

Standard HTTP status codes:

- **200 OK**: Successful GET/PUT request
- **201 Created**: Successful POST request
- **204 No Content**: Successful DELETE request
- **400 Bad Request**: Invalid request data (business logic violation)
- **401 Unauthorized**: Authentication required or invalid token
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation error

All error responses follow the `ErrorResponse` or `ValidationErrorResponse` schema.

## Contract Testing

Contract tests must be implemented in `backend/tests/contract/` to ensure API implementation matches this specification:

1. **Schema Validation**: Request/response schemas match OpenAPI spec
2. **Status Codes**: Correct HTTP status codes returned
3. **Error Formats**: Error responses match defined schemas
4. **Authentication**: Protected endpoints require valid JWT

Use tools like:
- **OpenAPI Validator**: Validate OpenAPI spec correctness
- **Dredd**: HTTP API testing framework for OpenAPI specs
- **Pact**: Consumer-driven contract testing (if frontend/backend developed separately)

## Versioning

API version: **v1** (included in base path: `/api/v1`)

Breaking changes require a new major version (v2). Non-breaking changes can be added to v1:
- Adding new optional fields
- Adding new endpoints
- Adding new enum values (with backward compatibility)

## Data Model Alignment

This API contract is derived from [data-model.md](../data-model.md) and maintains 1:1 alignment with:

- Entity schemas (User, Objective, KeyResult, LearningPath, LearningResource, CalendarEvent, ProgressUpdate)
- Validation rules
- Relationships
- Business logic constraints

## Development Workflow

1. **Spec-First Development**: This OpenAPI spec is the source of truth
2. **Code Generation** (optional): Generate TypeScript interfaces from OpenAPI spec
3. **Implementation**: Implement endpoints following the contract
4. **Testing**: Run contract tests to verify implementation matches spec
5. **Documentation**: API documentation auto-generated from OpenAPI spec (e.g., using Swagger UI, Redoc)

## Tools & Resources

- **Swagger UI**: Interactive API documentation (auto-generated from openapi.yaml)
- **Redoc**: Clean API documentation generator
- **OpenAPI Generator**: Generate client SDKs and server stubs
- **Postman**: Import openapi.yaml for manual API testing

## Related Documentation

- [spec.md](../spec.md): Feature specification with user stories and requirements
- [data-model.md](../data-model.md): Database schema and entity definitions
- [plan.md](../plan.md): Implementation plan and architecture
- [research.md](../research.md): Technology stack decisions
