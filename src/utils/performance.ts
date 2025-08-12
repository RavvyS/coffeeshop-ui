// src/utils/performance.ts
import { useCallback, useRef, useEffect, useMemo } from 'react';

// Debounce hook for API calls
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Throttle hook for frequent updates
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef<number>(0);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
};

// Memoized API response cache
const apiCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export const getCachedData = (key: string, ttl: number = 300000): any | null => {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  if (cached) {
    apiCache.delete(key);
  }
  return null;
};

export const setCachedData = (key: string, data: any, ttl: number = 300000): void => {
  apiCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
};

export const clearCache = (pattern?: string): void => {
  if (pattern) {
    for (const key of apiCache.keys()) {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    }
  } else {
    apiCache.clear();
  }
};

// Performance monitoring utilities
export const performanceMonitor = {
  startTiming: (label: string) => {
    if (import.meta.env.DEV) {
      performance.mark(`${label}-start`);
    }
  },

  endTiming: (label: string) => {
    if (import.meta.env.DEV) {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      const measure = performance.getEntriesByName(label)[0];
      console.log(`⏱️ ${label}: ${measure.duration.toFixed(2)}ms`);
    }
  },

  logApiCall: (endpoint: string, duration: number, success: boolean) => {
    if (import.meta.env.DEV) {
      console.log(`🌐 API ${endpoint}: ${duration.toFixed(2)}ms ${success ? '✅' : '❌'}`);
    }
    
    // In production, send to analytics
    if (import.meta.env.PROD) {
      // Example: Send to analytics service
      // analytics.track('api_call', { endpoint, duration, success });
    }
  }
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const elementRef = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return { elementRef, isIntersecting };
};

// Image optimization utilities
export const optimizeImageUrl = (url: string, width?: number, quality: number = 80): string => {
  if (!url) return '';
  
  // If using a CDN like Cloudinary, append optimization parameters
  if (url.includes('cloudinary.com')) {
    const baseUrl = url.split('/upload/')[0] + '/upload/';
    const imagePath = url.split('/upload/')[1];
    let params = [`q_${quality}`, 'f_auto'];
    
    if (width) {
      params.push(`w_${width}`);
    }
    
    return `${baseUrl}${params.join(',')}/${imagePath}`;
  }
  
  // For other CDNs or custom image optimization
  return url;
};

// Bundle size optimization - lazy load components
export const lazyLoad = (componentImport: () => Promise<{ default: React.ComponentType<any> }>) => {
  return React.lazy(componentImport);
};

// src/utils/config.ts
interface AppConfig {
  apiUrl: string;
  wsUrl: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    emotionalSupport: boolean;
    virtualQueue: boolean;
    analytics: boolean;
    notifications: boolean;
  };
  cache: {
    menuTtl: number;
    analyticsTtl: number;
  };
  performance: {
    apiTimeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
}

const defaultConfig: AppConfig = {
  apiUrl: 'http://localhost:8000',
  wsUrl: 'ws://localhost:8000',
  environment: 'development',
  features: {
    emotionalSupport: true,
    virtualQueue: true,
    analytics: true,
    notifications: true,
  },
  cache: {
    menuTtl: 300000, // 5 minutes
    analyticsTtl: 60000, // 1 minute
  },
  performance: {
    apiTimeout: 10000, // 10 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
};

const getConfig = (): AppConfig => {
  const config = { ...defaultConfig };
  
  // Override with environment variables
  if (import.meta.env.VITE_API_URL) {
    config.apiUrl = import.meta.env.VITE_API_URL;
  }
  
  if (import.meta.env.VITE_WS_URL) {
    config.wsUrl = import.meta.env.VITE_WS_URL;
  }
  
  if (import.meta.env.VITE_ENVIRONMENT) {
    config.environment = import.meta.env.VITE_ENVIRONMENT as AppConfig['environment'];
  }

  // Production optimizations
  if (config.environment === 'production') {
    config.cache.menuTtl = 600000; // 10 minutes
    config.cache.analyticsTtl = 300000; // 5 minutes
    config.performance.apiTimeout = 15000; // 15 seconds
  }

  return config;
};

export const appConfig = getConfig();

// Feature flags
export const isFeatureEnabled = (feature: keyof AppConfig['features']): boolean => {
  return appConfig.features[feature];
};

// Environment checks
export const isDevelopment = () => appConfig.environment === 'development';
export const isProduction = () => appConfig.environment === 'production';
export const isStaging = () => appConfig.environment === 'staging';