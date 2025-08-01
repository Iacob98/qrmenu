import { useEffect, useState } from "react";
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

export function useRealTimeMenu(restaurantSlug: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!restaurantSlug) return;

    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?restaurant=${encodeURIComponent(restaurantSlug)}`;
    
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('🔌 Connected to real-time menu updates for:', restaurantSlug);
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'menu_update' || 
            data.type === 'dish_updated' || 
            data.type === 'dish_created' || 
            data.type === 'dish_deleted' ||
            data.type === 'design_update' ||
            data.type === 'restaurant_update' ||
            data.type === 'connected') {
          
          console.log('📡 Received real-time menu update:', data);
          
          // Only invalidate for actual updates, not connection confirmation
          if (data.type !== 'connected') {
            
            // For design updates, apply immediately to avoid flash
            if (data.type === 'design_update' && data.design) {
              console.log('🎨 Applying real-time design update:', data.design);
              applyDesignSettings(data.design);
            }
            
            // Throttle invalidations to avoid excessive refetching
            const invalidateMenu = () => {
              if (data.type === 'restaurant_update') {
                console.log('🏢 Restaurant data updated, forcing refresh:', data);
                queryClient.removeQueries({ 
                  queryKey: ["/api/public/menu", restaurantSlug] 
                });
              }
              
              queryClient.invalidateQueries({ 
                queryKey: ["/api/public/menu", restaurantSlug] 
              });
              
              // Only invalidate admin dashboard for relevant updates
              if (data.type === 'restaurant_update' || data.type === 'design_update') {
                queryClient.invalidateQueries({ 
                  queryKey: ["/api/restaurants"] 
                });
              }
            };
            
            // Debounce multiple rapid updates
            clearTimeout((window as any).invalidateTimeout);
            (window as any).invalidateTimeout = setTimeout(invalidateMenu, 100);
            
            console.log('✅ Menu data refresh scheduled');
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onclose = () => {
      console.log('❌ Disconnected from real-time menu updates');
      setWs(null);
    };

    websocket.onerror = (error) => {
      console.error('🚨 WebSocket error:', error);
    };

    return () => {
      websocket.close();
    };
  }, [restaurantSlug, queryClient]);

  return { isConnected: !!ws };
}