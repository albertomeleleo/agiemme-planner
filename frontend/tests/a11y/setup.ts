/**
 * Accessibility Testing Setup
 * Uses axe-core for automated WCAG 2.1 Level AA compliance testing
 * Per Constitution Section IV (NON-NEGOTIABLE)
 */

import { test as base } from '@playwright/test';
import { injectAxe, checkA11y, getViolations, reportViolations } from 'axe-playwright';

/**
 * Extended Playwright test with axe-core integration
 * Automatically injects axe-core and provides accessibility testing utilities
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Inject axe-core into every page
    await page.goto('/');
    await injectAxe(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';

/**
 * Accessibility test helper - checks WCAG 2.1 Level AA compliance
 * @param page - Playwright page object
 * @param context - Optional context selector to test specific regions
 * @param options - axe-core options
 */
export async function checkAccessibility(
  page: any,
  context?: string,
  options?: any
): Promise<void> {
  await checkA11y(page, context, {
    detailedReport: true,
    detailedReportOptions: {
      html: true,
    },
    ...options,
  });
}

/**
 * Get and report violations for custom handling
 */
export async function getAccessibilityViolations(page: any, context?: string): Promise<any[]> {
  const violations = await getViolations(page, context);
  if (violations.length > 0) {
    reportViolations(violations);
  }
  return violations;
}

/**
 * Default axe-core rules configuration
 * Aligned with WCAG 2.1 Level AA requirements
 */
export const defaultAxeConfig = {
  rules: {
    // Perceivable
    'color-contrast': { enabled: true }, // 4.5:1 normal text, 3:1 large text
    'image-alt': { enabled: true }, // Alt text for images
    'label': { enabled: true }, // Form labels

    // Operable
    'button-name': { enabled: true }, // Accessible names for buttons
    'link-name': { enabled: true }, // Accessible names for links
    'focus-order-semantics': { enabled: true }, // Logical focus order

    // Understandable
    'html-has-lang': { enabled: true }, // HTML lang attribute
    'valid-lang': { enabled: true }, // Valid language codes

    // Robust
    'aria-valid-attr': { enabled: true }, // Valid ARIA attributes
    'aria-valid-attr-value': { enabled: true }, // Valid ARIA values
    'duplicate-id': { enabled: true }, // No duplicate IDs
  },
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'], // WCAG 2.1 Level AA
  },
};
