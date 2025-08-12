export const initializeMonitoring = () => {
  // Initialize error monitoring (e.g., Sentry)
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    // import * as Sentry from "@sentry/react";
    // Sentry.init({
    //   dsn: import.meta.env.VITE_SENTRY_DSN,
    //   environment: import.meta.env.VITE_ENVIRONMENT,
    // });
  }

  // Initialize analytics (e.g., Google Analytics, Mixpanel)
  if (import.meta.env.PROD && import.meta.env.VITE_ANALYTICS_ID) {
    // gtag('config', import.meta.env.VITE_ANALYTICS_ID);
  }

  // Performance monitoring
  if (import.meta.env.PROD) {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Send to analytics service
        console.log(`${entry.name}: ${entry.value}`);
      }
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
  }
};