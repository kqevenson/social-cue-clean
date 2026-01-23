// Main Landing Page Component
export { default as LandingPage } from './LandingPage';

// Individual Components (for modular use)
export { default as Navigation } from './components/Navigation';
export { default as Hero } from './components/Hero';
export { default as Features } from './components/Features';
export { default as Testimonials } from './components/Testimonials';
export { default as CTA } from './components/CTA';

// Re-export all components as a single object for convenience
export * from './LandingPage';
