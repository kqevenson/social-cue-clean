/**
 * Accessibility Service for Social Cue App
 * Provides accessibility checking, optimization, and compliance monitoring
 */

import { config } from '../config/appConfig.js';
import { trackEvent } from './analyticsService.js';

class AccessibilityService {
  constructor() {
    this.checks = new Map();
    this.violations = [];
    this.isMonitoring = false;
    this.observers = new Map();
  }

  /**
   * Initialize accessibility service
   */
  initialize() {
    // Check initial accessibility
    this.runAccessibilityChecks();
    
    // Monitor for changes
    this.startMonitoring();
    
    // Track accessibility initialization
    trackEvent('accessibility_initialized', {
      violations: this.violations.length,
      checks: this.checks.size
    });

    console.log('♿ Accessibility service initialized');
  }

  /**
   * Run comprehensive accessibility checks
   */
  runAccessibilityChecks() {
    this.checks.clear();
    this.violations = [];

    // Check color contrast
    this.checkColorContrast();
    
    // Check keyboard navigation
    this.checkKeyboardNavigation();
    
    // Check ARIA labels
    this.checkAriaLabels();
    
    // Check focus indicators
    this.checkFocusIndicators();
    
    // Check alt text
    this.checkAltText();
    
    // Check heading structure
    this.checkHeadingStructure();
    
    // Check form labels
    this.checkFormLabels();
    
    // Check voice practice specific accessibility
    this.checkVoicePracticeAccessibility();

    return {
      checks: Object.fromEntries(this.checks),
      violations: this.violations,
      score: this.calculateAccessibilityScore()
    };
  }

  /**
   * Check color contrast ratios
   */
  checkColorContrast() {
    const elements = document.querySelectorAll('*');
    const violations = [];

    elements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = this.calculateContrastRatio(color, backgroundColor);
        
        if (contrast < 4.5) {
          violations.push({
            element: element,
            type: 'color_contrast',
            severity: 'error',
            message: `Color contrast ratio ${contrast.toFixed(2)} is below WCAG AA standard (4.5:1)`,
            contrast: contrast
          });
        } else if (contrast < 7) {
          violations.push({
            element: element,
            type: 'color_contrast',
            severity: 'warning',
            message: `Color contrast ratio ${contrast.toFixed(2)} meets WCAG AA but not AAA standard (7:1)`,
            contrast: contrast
          });
        }
      }
    });

    this.checks.set('color_contrast', {
      passed: violations.length === 0,
      violations: violations,
      score: violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 10)
    });

    this.violations.push(...violations);
  }

  /**
   * Check keyboard navigation
   */
  checkKeyboardNavigation() {
    const violations = [];
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
    
    interactiveElements.forEach(element => {
      // Check if element is focusable
      if (element.tabIndex === -1 && !element.hasAttribute('tabindex')) {
        violations.push({
          element: element,
          type: 'keyboard_navigation',
          severity: 'warning',
          message: 'Interactive element may not be keyboard accessible'
        });
      }
      
      // Check for keyboard event handlers
      const hasKeyboardHandlers = element.onkeydown || element.onkeyup || element.onkeypress;
      const hasClickHandler = element.onclick;
      
      if (hasClickHandler && !hasKeyboardHandlers) {
        violations.push({
          element: element,
          type: 'keyboard_navigation',
          severity: 'warning',
          message: 'Element has click handler but no keyboard handler'
        });
      }
    });

    this.checks.set('keyboard_navigation', {
      passed: violations.length === 0,
      violations: violations,
      score: violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 5)
    });

    this.violations.push(...violations);
  }

  /**
   * Check ARIA labels and roles
   */
  checkAriaLabels() {
    const violations = [];
    
    // Check for missing ARIA labels on interactive elements
    const interactiveElements = document.querySelectorAll('button, input, select, textarea');
    
    interactiveElements.forEach(element => {
      const hasLabel = element.hasAttribute('aria-label') || 
                      element.hasAttribute('aria-labelledby') ||
                      element.closest('label') ||
                      element.getAttribute('placeholder');
      
      if (!hasLabel) {
        violations.push({
          element: element,
          type: 'aria_labels',
          severity: 'error',
          message: 'Interactive element missing accessible label'
        });
      }
    });

    // Check for proper ARIA roles
    const elementsWithRoles = document.querySelectorAll('[role]');
    elementsWithRoles.forEach(element => {
      const role = element.getAttribute('role');
      const validRoles = this.getValidAriaRoles();
      
      if (!validRoles.includes(role)) {
        violations.push({
          element: element,
          type: 'aria_roles',
          severity: 'warning',
          message: `Invalid ARIA role: ${role}`
        });
      }
    });

    this.checks.set('aria_labels', {
      passed: violations.length === 0,
      violations: violations,
      score: violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 8)
    });

    this.violations.push(...violations);
  }

  /**
   * Check focus indicators
   */
  checkFocusIndicators() {
    const violations = [];
    
    // Check if focus indicators are visible
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
    
    interactiveElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const outline = styles.outline;
      const boxShadow = styles.boxShadow;
      
      if (outline === 'none' && !boxShadow.includes('inset')) {
        violations.push({
          element: element,
          type: 'focus_indicators',
          severity: 'warning',
          message: 'Element may not have visible focus indicator'
        });
      }
    });

    this.checks.set('focus_indicators', {
      passed: violations.length === 0,
      violations: violations,
      score: violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 5)
    });

    this.violations.push(...violations);
  }

  /**
   * Check alt text for images
   */
  checkAltText() {
    const violations = [];
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      const alt = img.getAttribute('alt');
      
      if (alt === null) {
        violations.push({
          element: img,
          type: 'alt_text',
          severity: 'error',
          message: 'Image missing alt attribute'
        });
      } else if (alt === '') {
        // Empty alt is acceptable for decorative images
        const isDecorative = img.getAttribute('role') === 'presentation' || 
                            img.getAttribute('aria-hidden') === 'true';
        if (!isDecorative) {
          violations.push({
            element: img,
            type: 'alt_text',
            severity: 'warning',
            message: 'Image has empty alt text - ensure it is decorative'
          });
        }
      }
    });

    this.checks.set('alt_text', {
      passed: violations.length === 0,
      violations: violations,
      score: violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 10)
    });

    this.violations.push(...violations);
  }

  /**
   * Check heading structure
   */
  checkHeadingStructure() {
    const violations = [];
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (level > lastLevel + 1) {
        violations.push({
          element: heading,
          type: 'heading_structure',
          severity: 'warning',
          message: `Heading level ${level} skips level ${lastLevel + 1}`
        });
      }
      
      lastLevel = level;
    });

    this.checks.set('heading_structure', {
      passed: violations.length === 0,
      violations: violations,
      score: violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 5)
    });

    this.violations.push(...violations);
  }

  /**
   * Check form labels
   */
  checkFormLabels() {
    const violations = [];
    const formElements = document.querySelectorAll('input, select, textarea');
    
    formElements.forEach(element => {
      const hasLabel = element.hasAttribute('aria-label') || 
                      element.hasAttribute('aria-labelledby') ||
                      element.closest('label') ||
                      element.getAttribute('placeholder');
      
      if (!hasLabel) {
        violations.push({
          element: element,
          type: 'form_labels',
          severity: 'error',
          message: 'Form element missing accessible label'
        });
      }
    });

    this.checks.set('form_labels', {
      passed: violations.length === 0,
      violations: violations,
      score: violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 10)
    });

    this.violations.push(...violations);
  }

  /**
   * Check voice practice specific accessibility
   */
  checkVoicePracticeAccessibility() {
    const violations = [];
    
    // Check voice practice components
    const voiceComponents = document.querySelectorAll('[class*="voice"], [class*="Voice"]');
    
    voiceComponents.forEach(component => {
      // Check for proper ARIA labels
      if (!component.hasAttribute('aria-label') && !component.hasAttribute('aria-labelledby')) {
        violations.push({
          element: component,
          type: 'voice_accessibility',
          severity: 'warning',
          message: 'Voice component missing accessible label'
        });
      }
      
      // Check for status announcements
      const statusElements = component.querySelectorAll('[aria-live]');
      if (statusElements.length === 0) {
        violations.push({
          element: component,
          type: 'voice_accessibility',
          severity: 'info',
          message: 'Voice component should have status announcements for screen readers'
        });
      }
    });

    this.checks.set('voice_accessibility', {
      passed: violations.length === 0,
      violations: violations,
      score: violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 5)
    });

    this.violations.push(...violations);
  }

  /**
   * Start monitoring for accessibility changes
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Monitor DOM changes
    if ('MutationObserver' in window) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            // Re-run checks for new elements
            setTimeout(() => {
              this.runAccessibilityChecks();
            }, 100);
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      this.observers.set('mutation', observer);
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
    
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  /**
   * Get accessibility recommendations
   */
  getRecommendations() {
    const recommendations = [];
    
    this.violations.forEach(violation => {
      recommendations.push({
        type: violation.severity,
        category: violation.type,
        message: violation.message,
        element: violation.element,
        fix: this.getFixSuggestion(violation)
      });
    });
    
    return recommendations;
  }

  /**
   * Calculate overall accessibility score
   */
  calculateAccessibilityScore() {
    if (this.checks.size === 0) return 0;
    
    const scores = Array.from(this.checks.values()).map(check => check.score);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return Math.round(averageScore);
  }

  // Private methods

  calculateContrastRatio(color1, color2) {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    const lum1 = this.getLuminance(rgb1);
    const lum2 = this.getLuminance(rgb2);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  getLuminance(rgb) {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  getValidAriaRoles() {
    return [
      'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
      'cell', 'checkbox', 'columnheader', 'combobox', 'complementary',
      'contentinfo', 'definition', 'dialog', 'directory', 'document',
      'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading',
      'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main',
      'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox',
      'menuitemradio', 'navigation', 'none', 'note', 'option', 'presentation',
      'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup',
      'rowheader', 'scrollbar', 'search', 'separator', 'slider', 'spinbutton',
      'status', 'switch', 'tab', 'table', 'tablist', 'tabpanel', 'textbox',
      'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'
    ];
  }

  getFixSuggestion(violation) {
    const fixes = {
      'color_contrast': 'Increase color contrast by using darker/lighter colors',
      'keyboard_navigation': 'Add keyboard event handlers or ensure element is focusable',
      'aria_labels': 'Add aria-label, aria-labelledby, or wrap in label element',
      'focus_indicators': 'Add visible focus styles using CSS outline or box-shadow',
      'alt_text': 'Add descriptive alt text for images',
      'heading_structure': 'Use proper heading hierarchy (h1, h2, h3, etc.)',
      'form_labels': 'Add labels for form elements',
      'voice_accessibility': 'Add ARIA labels and status announcements for voice components'
    };
    
    return fixes[violation.type] || 'Review accessibility guidelines for this element';
  }
}

// Create singleton instance
const accessibilityService = new AccessibilityService();

// Export convenience functions
export const initializeAccessibility = () => accessibilityService.initialize();
export const runAccessibilityChecks = () => accessibilityService.runAccessibilityChecks();
export const getAccessibilityScore = () => accessibilityService.calculateAccessibilityScore();
export const getRecommendations = () => accessibilityService.getRecommendations();
export const getViolations = () => accessibilityService.violations;
export const startMonitoring = () => accessibilityService.startMonitoring();
export const stopMonitoring = () => accessibilityService.stopMonitoring();

export default accessibilityService;
