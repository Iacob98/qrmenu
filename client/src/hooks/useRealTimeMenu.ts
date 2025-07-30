import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useRealTimeMenu(restaurantSlug: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!restaurantSlug) return;

    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/menu/${restaurantSlug}`;
    
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('Connected to real-time menu updates');
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'menu_update' || data.type === 'dish_updated') {
          console.log('Received real-time menu update:', data);
          
          // Invalidate and refetch the menu data
          queryClient.invalidateQueries({ 
            queryKey: ["/api/public/menu", restaurantSlug] 
          });
          
          // Also invalidate admin dashboard if available
          queryClient.invalidateQueries({ 
            queryKey: ["/api/restaurants"] 
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onclose = () => {
      console.log('Disconnected from real-time menu updates');
      setWs(null);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      websocket.close();
    };
  }, [restaurantSlug, queryClient]);

  return { isConnected: !!ws };
}