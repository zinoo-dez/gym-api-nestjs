# Accessibility Testing Checklist

## Overview

This checklist provides a comprehensive guide for testing the accessibility features of the Gym Management Frontend application. Use this checklist to ensure WCAG 2.1 AA compliance before releasing new features or updates.

## Automated Testing

### Tools Required

- [ ] axe DevTools browser extension installed
- [ ] Lighthouse in Chrome DevTools
- [ ] WAVE browser extension installed

### Automated Tests

- [ ] Run axe DevTools on all major pages (login, dashboard, members list, etc.)
- [ ] Run Lighthouse accessibility audit (target score: 90+)
- [ ] Run WAVE on all forms and interactive components
- [ ] Check for any critical or serious issues
- [ ] Document and fix all automated findings

## Keyboard Navigation Testing

### General Navigation

- [ ] Tab key moves focus forward through all interactive elements
- [ ] Shift+Tab moves focus backward
- [ ] Focus indicators are clearly visible on all elements
- [ ] Tab order follows logical reading order
- [ ] No keyboard traps (can always move focus away)

### Skip Navigation

- [ ] Skip to main content link appears on first Tab press
- [ ] Skip to navigation link appears on second Tab press
- [ ] Skip links work correctly and move focus to target
- [ ] Skip links are visually hidden until focused

### Forms

- [ ] All form fields are keyboard accessible
- [ ] Tab order through form fields is logical
- [ ] Enter key submits forms
- [ ] Error messages are announced when validation fails
- [ ] Focus moves to first error field on validation failure
- [ ] Can navigate through radio buttons with arrow keys
- [ ] Can open and navigate dropdowns with keyboard

### Buttons and Links

- [ ] All buttons activate with Enter or Space
- [ ] All links activate with Enter
- [ ] Button states (disabled, loading) are keyboard accessible
- [ ] Focus visible on all buttons and links

### Modals

- [ ] Modal opens and focus moves to modal
- [ ] Tab cycles through focusable elements within modal
- [ ] Escape key closes modal
- [ ] Focus returns to trigger element when modal closes
- [ ] Cannot tab to elements behind modal (focus trap)

### Navigation Menu

- [ ] Can navigate through all menu items with Tab
- [ ] Active page is indicated in navigation
- [ ] Mobile menu opens/closes with keyboard
- [ ] Dropdown menus work with keyboard

### Tables

- [ ] Can navigate through table cells with Tab
- [ ] Pagination controls are keyboard accessible
- [ ] Sort controls (if present) work with keyboard

## Screen Reader Testing

### Tools Required

- [ ] NVDA (Windows) or VoiceOver (macOS) installed
- [ ] Basic screen reader commands learned

### General Screen Reader Tests

- [ ] Page title is announced on page load
- [ ] Headings are properly announced (h1, h2, h3)
- [ ] Landmark regions are announced (navigation, main, etc.)
- [ ] Links are announced with descriptive text
- [ ] Buttons are announced with descriptive labels

### Forms

- [ ] Form labels are announced for each input
- [ ] Required fields are announced as required
- [ ] Error messages are announced when validation fails
- [ ] Field descriptions (help text) are announced
- [ ] Placeholder text is not relied upon for labels

### Interactive Elements

- [ ] Button states (disabled, loading) are announced
- [ ] Loading spinners announce "Loading..."
- [ ] Notifications are announced when they appear
- [ ] Modal opening is announced
- [ ] Table headers are announced when navigating cells

### Images and Icons

- [ ] Decorative images have empty alt text or aria-hidden
- [ ] Informative images have descriptive alt text
- [ ] Icon-only buttons have aria-label

### Live Regions

- [ ] Success notifications are announced (polite)
- [ ] Error notifications are announced (assertive)
- [ ] Loading states are announced
- [ ] Pagination status is announced

## Visual Testing

### Color Contrast

- [ ] Body text meets 4.5:1 contrast ratio
- [ ] Large text (18pt+) meets 3:1 contrast ratio
- [ ] UI components meet 3:1 contrast ratio
- [ ] Focus indicators meet 3:1 contrast ratio
- [ ] Error messages meet 4.5:1 contrast ratio
- [ ] Use WebAIM Contrast Checker to verify

### Color Independence

- [ ] Information not conveyed by color alone
- [ ] Form errors have icon + text + color
- [ ] Success states have icon + text + color
- [ ] Required fields have asterisk + label
- [ ] Links are distinguishable without color (underline on hover)

### Focus Indicators

- [ ] Focus indicators visible on all interactive elements
- [ ] Focus indicators have sufficient contrast (3:1)
- [ ] Focus indicators are not obscured by other elements
- [ ] Focus indicators are consistent across the application

### Text and Typography

- [ ] Text can be resized to 200% without loss of content
- [ ] Line height is at least 1.5 for body text
- [ ] Paragraph spacing is at least 2x font size
- [ ] Text is not justified
- [ ] Font size is at least 16px for body text

### Responsive Design

- [ ] Application works at 320px width (mobile)
- [ ] Application works at 1920px width (desktop)
- [ ] No horizontal scrolling at any viewport size
- [ ] Touch targets are at least 44x44px on mobile
- [ ] Content reflows properly at different sizes

## Touch and Mobile Testing

### Touch Targets

- [ ] All interactive elements are at least 44x44px on mobile
- [ ] Adequate spacing between touch targets (8px minimum)
- [ ] Buttons are easy to tap without zooming

### Mobile Navigation

- [ ] Hamburger menu works correctly
- [ ] Mobile menu is keyboard accessible
- [ ] Swipe gestures work (if implemented)
- [ ] Orientation changes work correctly (portrait/landscape)

### Forms on Mobile

- [ ] Form inputs are large enough to tap
- [ ] Keyboard type is appropriate (email, tel, number)
- [ ] Autocomplete works correctly
- [ ] Error messages are visible without scrolling

## Motion and Animation Testing

### Reduced Motion

- [ ] Detect prefers-reduced-motion setting
- [ ] Animations disabled when reduced motion preferred
- [ ] Page transitions are instant with reduced motion
- [ ] Modal animations disabled with reduced motion
- [ ] Loading spinners still visible (not animated)

### Animation Testing

- [ ] Animations are smooth and not jarring
- [ ] Animations do not cause content to jump
- [ ] Animations do not interfere with reading
- [ ] No auto-playing animations longer than 5 seconds

## Form Testing

### Form Structure

- [ ] All inputs have associated labels
- [ ] Labels are visible (not placeholder-only)
- [ ] Required fields are clearly marked
- [ ] Field groups use fieldset and legend
- [ ] Form has clear submit button

### Validation

- [ ] Client-side validation provides immediate feedback
- [ ] Error messages are clear and specific
- [ ] Error messages appear near the field
- [ ] Errors are announced to screen readers
- [ ] Can correct errors and resubmit

### Error Handling

- [ ] Error summary at top of form (if multiple errors)
- [ ] Focus moves to first error on submission
- [ ] Errors persist until corrected
- [ ] Success messages are announced

## Page-Specific Testing

### Login Page

- [ ] Form is keyboard accessible
- [ ] Labels are properly associated
- [ ] Error messages are announced
- [ ] Password field has show/hide toggle
- [ ] Autocomplete works for email and password

### Dashboard

- [ ] All widgets are keyboard accessible
- [ ] Data visualizations have text alternatives
- [ ] Quick actions are keyboard accessible

### Members List

- [ ] Table is keyboard navigable
- [ ] Search field is keyboard accessible
- [ ] Pagination is keyboard accessible
- [ ] Sort controls work with keyboard
- [ ] Action buttons are keyboard accessible

### Member Create/Edit Form

- [ ] All fields are keyboard accessible
- [ ] Validation errors are announced
- [ ] Date picker is keyboard accessible
- [ ] Submit and cancel buttons work with keyboard

### Class Schedule

- [ ] Calendar is keyboard navigable
- [ ] Date filters work with keyboard
- [ ] Book/cancel buttons are keyboard accessible
- [ ] Class details are announced to screen readers

## Documentation

### Accessibility Statement

- [ ] Accessibility statement page exists
- [ ] Statement includes WCAG level (AA)
- [ ] Contact information for accessibility issues
- [ ] Known limitations documented

### User Documentation

- [ ] Keyboard shortcuts documented
- [ ] Screen reader instructions provided
- [ ] Alternative access methods documented

## Regression Testing

### After Updates

- [ ] Run automated tests after each update
- [ ] Test keyboard navigation on modified pages
- [ ] Test screen reader on modified components
- [ ] Verify color contrast on new elements
- [ ] Test new forms for accessibility

## Issue Tracking

### When Issues Found

- [ ] Document the issue with screenshots
- [ ] Note the severity (critical, serious, moderate, minor)
- [ ] Assign to developer for fixing
- [ ] Retest after fix is implemented
- [ ] Update this checklist if needed

## Sign-Off

### Before Release

- [ ] All critical issues resolved
- [ ] All serious issues resolved or documented
- [ ] Automated tests pass with 90+ score
- [ ] Manual keyboard testing complete
- [ ] Manual screen reader testing complete
- [ ] Color contrast verified
- [ ] Mobile testing complete
- [ ] Documentation updated

### Tested By

- Name: ************\_\_\_************
- Date: ************\_\_\_************
- Version: ************\_\_\_************
- Notes: ************\_\_\_************

## Resources

### Testing Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Screen Readers

- [NVDA Download](https://www.nvaccess.org/download/)
- [VoiceOver Guide](https://www.apple.com/accessibility/voiceover/)

### Guidelines

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
