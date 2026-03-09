import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Push a custom event to the dataLayer (picked up by GTM and/or GA4).
 */
export function trackEvent(
  name: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...params });
}

/**
 * Record a virtual page view (for SPA navigation).
 */
export function trackPageView(path: string, title?: string): void {
  trackEvent("virtual_pageview", {
    page_path: path,
    page_title: title || document.title,
  });
}

/**
 * React hook — automatically tracks SPA route changes via wouter.
 * Place once near the root of your component tree.
 */
export function usePageTracking(): void {
  const [location] = useLocation();
  const prev = useRef(location);

  useEffect(() => {
    if (location !== prev.current) {
      prev.current = location;
      trackPageView(location);
    }
  }, [location]);
}
