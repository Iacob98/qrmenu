// Performance utilities for optimization

import React, { useMemo, useCallback } from 'react';

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoized search filter
export const useSearchFilter = (items: any[], searchQuery: string, searchFields: string[]) => {
  return useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        if (Array.isArray(value)) {
          return value.some(v => String(v).toLowerCase().includes(query));
        }
        return false;
      })
    );
  }, [items, searchQuery, searchFields]);
};

// Memoized tag filter
export const useTagFilter = (dishes: any[], activeTags: string[]) => {
  return useMemo(() => {
    if (activeTags.length === 0) return dishes;
    
    return dishes.filter(dish => 
      dish.tags && activeTags.every(tag => dish.tags.includes(tag))
    );
  }, [dishes, activeTags]);
};

// Debounced search hook
export const useDebouncedSearch = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

// Image lazy loading utility
export const useImageLazyLoad = () => {
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);
  
  return { imageRef, isLoaded, isInView, handleImageLoad };
};

// Cache key generator for consistent memoization
export const createCacheKey = (...args: (string | number | boolean | null | undefined)[]) => {
  return args.filter(arg => arg !== null && arg !== undefined).join(':');
};