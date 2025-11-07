/**
 * Safely add CSS classes to an element's classList
 * Prevents errors from empty or undefined class names
 * @param {HTMLElement} element - The DOM element
 * @param {...string} classNames - CSS class names to add
 */
export const safeAddClass = (element, ...classNames) => {
  if (!element || !element.classList) {
    console.warn('safeAddClass: Invalid element provided');
    return;
  }
  
  classNames.forEach(className => {
    if (className && typeof className === 'string' && className.trim()) {
      element.classList.add(className.trim());
    }
  });
};

/**
 * Safely remove CSS classes from an element's classList
 * @param {HTMLElement} element - The DOM element
 * @param {...string} classNames - CSS class names to remove
 */
export const safeRemoveClass = (element, ...classNames) => {
  if (!element || !element.classList) {
    console.warn('safeRemoveClass: Invalid element provided');
    return;
  }
  
  classNames.forEach(className => {
    if (className && typeof className === 'string' && className.trim()) {
      element.classList.remove(className.trim());
    }
  });
};

/**
 * Safely toggle CSS classes on an element's classList
 * @param {HTMLElement} element - The DOM element
 * @param {string} className - CSS class name to toggle
 * @param {boolean} force - Force add (true) or remove (false)
 */
export const safeToggleClass = (element, className, force) => {
  if (!element || !element.classList) {
    console.warn('safeToggleClass: Invalid element provided');
    return;
  }
  
  if (className && typeof className === 'string' && className.trim()) {
    element.classList.toggle(className.trim(), force);
  }
};

/**
 * Build a safe className string from multiple class names
 * Filters out empty, undefined, or null values
 * @param {...string} classNames - CSS class names
 * @returns {string} Combined className string
 */
export const buildClassName = (...classNames) => {
  return classNames
    .filter(className => className && typeof className === 'string' && className.trim())
    .map(className => className.trim())
    .join(' ');
};
