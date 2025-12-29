<!--
Sync Impact Report:
- Version change: initial → 1.0.0
- New constitution created with 6 core principles
- Added principles:
  1. Code Quality Standards
  2. Testing Discipline
  3. User Experience Consistency
  4. WCAG 2.1 Level AA Accessibility
  5. Web Vitals Performance
  6. Performance Requirements
- Added sections: Development Workflow, Quality Gates
- Templates status:
  ✅ plan-template.md - aligned (Constitution Check section)
  ✅ spec-template.md - aligned (requirements structure)
  ✅ tasks-template.md - aligned (test-driven approach, performance validation)
- No deferred items
-->

# Agiemme Planner Constitution

## Core Principles

### I. Code Quality Standards

**MUST Requirements**:
- All code MUST follow language-specific style guides (ESLint/Prettier for JS/TS, Black/Pylint for Python, etc.)
- Code MUST be self-documenting through clear naming and structure; comments only for non-obvious business logic
- Functions MUST have single responsibility and remain under 50 lines where feasible
- Cyclomatic complexity MUST NOT exceed 10 per function without explicit justification
- Code duplication (DRY violations) MUST be eliminated; maximum 3 lines of repeated logic before requiring abstraction
- All public APIs MUST have TypeScript interfaces or equivalent type definitions
- No use of `any` type or equivalent escape hatches without explicit TODO comment and tracking

**Rationale**: Maintainability and long-term velocity depend on consistent, readable code. Technical debt accumulates when quality standards are optional.

### II. Testing Discipline (NON-NEGOTIABLE)

**MUST Requirements**:
- **Test-First Development**: Tests MUST be written before implementation for all new features
- **Red-Green-Refactor**: Tests MUST fail initially, then pass after implementation, then be refactored for clarity
- **Coverage Thresholds**:
  - Unit tests: Minimum 80% code coverage for business logic
  - Integration tests: All API contracts and cross-boundary interactions
  - E2E tests: All critical user journeys (priority P1 user stories)
- **Test Structure**:
  - Unit tests in `tests/unit/` or colocated with source
  - Integration tests in `tests/integration/`
  - Contract tests in `tests/contract/`
  - E2E tests in `tests/e2e/`
- **Test Quality**: Tests MUST be deterministic, fast (<5s for unit suites), and independent (no shared state)
- **Breaking Tests**: No code may be merged if tests are failing; no disabling tests without creating tracked issue

**Rationale**: Testing is not optional. It protects against regressions, documents behavior, and enables confident refactoring. Test-first development catches design issues early.

### III. User Experience Consistency

**MUST Requirements**:
- **Design System**: All UI components MUST use the established design system/component library
- **Interaction Patterns**: Common interactions (forms, navigation, feedback) MUST follow documented UX patterns
- **Visual Consistency**:
  - Typography: Maximum 3 font families, defined type scale
  - Color palette: Defined primary, secondary, semantic colors (error, warning, success, info)
  - Spacing: 8px base unit system (multiples of 8: 8, 16, 24, 32, etc.)
  - Responsive breakpoints: Standardized (mobile: 320-767px, tablet: 768-1023px, desktop: 1024px+)
- **User Feedback**: All async operations MUST provide loading states, success confirmations, and error messages
- **Error States**: User-facing errors MUST be actionable and written in plain language (no stack traces, technical jargon)
- **Empty States**: Lists, dashboards, and content areas MUST have designed empty states with clear calls-to-action

**Rationale**: Consistency reduces cognitive load, increases user confidence, and creates a professional impression. Users should never feel lost or confused about how to interact with the application.

### IV. WCAG 2.1 Level AA Accessibility (NON-NEGOTIABLE)

**MUST Requirements**:
- **Perceivable**:
  - Color contrast minimum 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt+ bold)
  - All images MUST have meaningful alt text; decorative images with alt=""
  - Text MUST be resizable up to 200% without loss of functionality
  - No information conveyed by color alone; MUST have secondary indicator (icon, text, pattern)
- **Operable**:
  - All functionality MUST be keyboard accessible
  - Focus indicators MUST be visible (minimum 2px outline, 3:1 contrast)
  - Tab order MUST be logical and match visual flow
  - No keyboard traps; ESC key cancels modals/overlays
  - Skip links MUST be provided to main content
- **Understandable**:
  - Page titles MUST be descriptive and unique
  - Form labels MUST be explicitly associated with inputs
  - Error identification MUST be programmatic and descriptive
  - HTML lang attribute MUST be set
- **Robust**:
  - Valid HTML5/semantic markup MUST be used
  - ARIA attributes MUST be correct; prefer native HTML over ARIA when possible
  - Screen reader testing MUST be performed for critical flows (NVDA, JAWS, or VoiceOver)

**Validation**:
- Automated testing with axe-core or similar MUST pass before merge
- Manual keyboard navigation MUST be verified
- Screen reader testing MUST be performed on P1 user stories

**Rationale**: Accessibility is a legal requirement, ethical obligation, and expands market reach. WCAG 2.1 Level AA is the internationally recognized standard for web accessibility.

### V. Web Vitals Performance (NON-NEGOTIABLE)

**MUST Requirements**:
- **Largest Contentful Paint (LCP)**: ≤ 2.5 seconds (75th percentile)
  - Optimize largest image/text block visibility
  - Implement lazy loading for below-fold content
  - Use CDN for static assets
- **First Input Delay (FID)**: ≤ 100 milliseconds (75th percentile)
  - Minimize JavaScript blocking time
  - Code-split large bundles
  - Defer non-critical scripts
- **Cumulative Layout Shift (CLS)**: ≤ 0.1 (75th percentile)
  - Reserve space for images/embeds with width/height attributes
  - Avoid inserting content above existing content (except user interaction)
  - Use transform animations instead of layout-changing properties
- **Interaction to Next Paint (INP)**: ≤ 200 milliseconds (75th percentile)
  - Optimize event handlers
  - Break up long tasks (>50ms)
  - Use requestIdleCallback for non-urgent work

**Monitoring**:
- Lighthouse CI MUST run on every PR (target score: 90+)
- Real User Monitoring (RUM) MUST track Core Web Vitals in production
- Performance budgets MUST be defined:
  - JavaScript: <200KB initial bundle (gzipped)
  - CSS: <50KB (gzipped)
  - Images: WebP/AVIF format preferred, lazy loading required

**Rationale**: Core Web Vitals directly impact user experience, SEO rankings, and conversion rates. Google uses these as ranking signals. Poor performance drives users away.

### VI. Performance Requirements

**MUST Requirements**:
- **API Response Times** (95th percentile):
  - Read operations: ≤ 200ms
  - Write operations: ≤ 500ms
  - Search/complex queries: ≤ 1000ms
- **Database**:
  - All queries MUST be indexed appropriately (no full table scans on tables >1000 rows)
  - N+1 query patterns MUST be eliminated (use batch loading, eager loading)
  - Connection pooling MUST be configured
- **Caching**:
  - Static assets MUST have cache headers (1 year for versioned files)
  - API responses MUST implement appropriate caching (ETags, Cache-Control)
  - Cache invalidation strategy MUST be documented
- **Scalability**:
  - Stateless application design (horizontal scaling ready)
  - Background jobs for operations >5 seconds
  - Rate limiting MUST be implemented on all public APIs
- **Monitoring**:
  - Application Performance Monitoring (APM) MUST be configured
  - Error tracking MUST be implemented (Sentry, Rollbar, or equivalent)
  - Alerting MUST be configured for performance degradation

**Benchmarking**:
- Load testing MUST be performed before production releases
- Performance regression tests MUST be part of CI/CD
- Baseline metrics MUST be documented and tracked

**Rationale**: Performance is a feature, not an afterthought. Slow applications frustrate users, waste resources, and damage brand reputation. Performance requirements ensure the application scales.

## Development Workflow

### Code Review Requirements

- All code changes MUST go through pull request review
- Minimum one approval required; two approvals for architecture changes
- PR description MUST reference related issue/spec and explain the approach
- Reviewers MUST verify:
  - Constitution compliance (all principles above)
  - Test coverage and quality
  - Accessibility requirements met
  - Performance impact considered

### Branch Strategy

- `main` branch is protected; requires PR approval and passing CI
- Feature branches: `###-feature-name` (matches spec directory)
- Hotfix branches: `hotfix-description`
- All branches MUST be up-to-date with `main` before merge

### Commit Standards

- Conventional Commits format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore, perf, a11y
- Breaking changes MUST include `BREAKING CHANGE:` in commit body
- Commits MUST be atomic (single logical change)

## Quality Gates

### Pre-Merge Requirements (CI/CD Pipeline)

All checks MUST pass before merge:

1. **Linting & Formatting**: Zero violations
2. **Type Checking**: No TypeScript/type errors
3. **Unit Tests**: All passing, ≥80% coverage
4. **Integration Tests**: All passing
5. **Accessibility**: axe-core automated checks passing
6. **Performance**: Lighthouse CI score ≥90
7. **Security**: No high/critical vulnerabilities in dependencies
8. **Build**: Production build successful

### Pre-Release Requirements

Before deploying to production:

1. **E2E Tests**: All critical user journeys passing
2. **Load Testing**: Performance benchmarks met
3. **Security Scan**: No unresolved vulnerabilities
4. **Accessibility Audit**: Manual review of new features
5. **Performance Budget**: Bundle size within limits
6. **Database Migrations**: Tested and reversible
7. **Documentation**: User-facing changes documented
8. **Rollback Plan**: Documented and tested

## Governance

### Amendment Process

1. Proposed amendments MUST be documented with rationale
2. Team discussion/approval required (majority vote)
3. Version number MUST be incremented per semantic versioning:
   - **MAJOR**: Backward-incompatible changes (principle removal/redefinition)
   - **MINOR**: New principles or sections added
   - **PATCH**: Clarifications, wording improvements, typo fixes
4. All templates (plan, spec, tasks) MUST be updated to reflect changes
5. Migration plan required for breaking changes

### Compliance

- All PRs MUST verify constitution compliance
- Violations MUST be flagged during code review
- Complexity/exceptions MUST be justified in writing (Complexity Tracking table in plan.md)
- Quarterly constitution review to assess effectiveness

### Living Document

- This constitution evolves with project needs
- Feedback from development team informs improvements
- Principles are non-negotiable unless formally amended
- Templates and tooling MUST stay aligned with constitution

**Version**: 1.0.0 | **Ratified**: 2025-12-28 | **Last Amended**: 2025-12-28
