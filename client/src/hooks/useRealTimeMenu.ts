import { useEffect, useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Helper function to apply design settings immediately
function applyDesignSettings(design: any) {
  const root = document.documentElement;

  if (design.primaryColor) {
    root.style.setProperty('--primary', design.primaryColor);
    root.style.setProperty('--primary-600', design.primaryColor);
    root.style.setProperty('--primary-700', design.primaryColor);
  }
  if (design.accentColor) {
    root.style.setProperty('--accent', design.accentColor);
    root.style.setProperty('--accent-600', design.accentColor);
    root.style.setProperty('--accent-700', design.accentColor);
  }
  if (design.backgroundColor) {
    root.style.setProperty('--background', design.backgroundColor);
  }
  if (design.textColor) {
    root.style.setProperty('--foreground', design.textColor);
  }
  if (design.fontFamily) {
    root.style.setProperty('--font-family', design.fontFamily);
    document.body.style.fontFamily = design.fontFamily;
  }
  if (design.fontSize) {
    const fontSizeMap: Record<string, string> = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    const fontSize = fontSizeMap[design.fontSize as string] || '16px';
    root.style.setProperty('--font-size', fontSize);
    document.body.style.fontSize = fontSize;
  }
  if (design.cardRadius) {
    root.style.setProperty('--card-radius', `${design.cardRadius}px`);
  }
  if (design.cardSpacing) {
    const spacingMap: Record<string, string> = {
      compact: '8px',
      normal: '12px',
      spacious: '16px'
    };
    const spacing = spacingMap[design.cardSpacing as string] || '12px';
    root.style.setProperty('--card-spacing', spacing);
  }
}

const MAX_RECONNECT_DELAY = 30_000; // 30 seconds
const BASE_RECONNECT_DELAY = 1_000; // 1 second

export function useRealTimeMenu(restaurantSlug: string) {
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const invalidateTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const unmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (unmountedRef.current || !restaurantSlug) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?restaurant=${encodeURIComponent(restaurantSlug)}`;

    const websocket = new WebSocket(wsUrl);
    wsRef.current = websocket;

    websocket.onopen = () => {
      setIsConnected(true);
      reconnectAttemptRef.current = 0;
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'connected') return;

        if (data.type === 'menu_update' ||
            data.type === 'dish_updated' ||
            data.type === 'dish_created' ||
            data.type === 'dish_deleted' ||
            data.type === 'design_update' ||
            data.type === 'restaurant_update') {

          // For design updates, apply immediately to avoid flash
          if (data.type === 'design_update' && data.design) {
            applyDesignSettings(data.design);
          }

          // Debounce query invalidation
          clearTimeout(invalidateTimerRef.current);
          invalidateTimerRef.current = setTimeout(async () => {
            try {
              if (data.type === 'restaurant_update') {
                queryClient.removeQueries({
                  queryKey: ["/api/public/menu", restaurantSlug]
                });
              }

              await queryClient.invalidateQueries({
                queryKey: ["/api/public/menu", restaurantSlug]
              });

              if (data.type === 'restaurant_update' || data.type === 'design_update') {
                await queryClient.invalidateQueries({
                  queryKey: ["/api/restaurants"]
                });
              }
            } catch (error) {
              console.error('Error invalidating queries:', error);
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onclose = (event) => {
      setIsConnected(false);
      wsRef.current = null;

      // Don't reconnect if intentionally closed or component unmounted
      if (unmountedRef.current || event.code === 1000) return;

      // Exponential backoff reconnect
      const delay = Math.min(
        BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptRef.current),
        MAX_RECONNECT_DELAY
      );
      reconnectAttemptRef.current++;

      reconnectTimerRef.current = setTimeout(connect, delay);
    };

    websocket.onerror = () => {
      // onclose will fire after onerror, reconnection handled there
      setIsConnected(false);
    };
  }, [restaurantSlug, queryClient]);

  useEffect(() => {
    unmountedRef.current = false;
    connect();

    return () => {
      unmountedRef.current = true;
      clearTimeout(reconnectTimerRef.current);
      clearTimeout(invalidateTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000); // Normal closure
      }
    };
  }, [connect]);

  return { isConnected };
}
