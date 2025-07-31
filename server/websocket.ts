import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { parse } from 'url';

interface MenuConnection {
  ws: WebSocket;
  restaurantSlug: string;
}

export class MenuWebSocketManager {
  private wss: WebSocketServer;
  private connections: Map<string, Set<WebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', (ws, request) => {
      const url = parse(request.url || '', true);
      console.log('WebSocket connection attempt with query:', url.query);
      
      // Extract restaurant slug from query parameter
      const restaurantSlug = url.query?.restaurant as string;
      if (!restaurantSlug) {
        console.log('Missing restaurant parameter, closing connection');
        ws.close(1008, 'Missing restaurant parameter');
        return;
      }


      this.addConnection(restaurantSlug, ws);

      ws.on('close', () => {
        this.removeConnection(restaurantSlug, ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.removeConnection(restaurantSlug, ws);
      });

      // Send initial connection confirmation
      ws.send(JSON.stringify({
        type: 'connected',
        restaurantSlug
      }));
    });
  }

  private addConnection(restaurantSlug: string, ws: WebSocket) {
    if (!this.connections.has(restaurantSlug)) {
      this.connections.set(restaurantSlug, new Set());
    }
    this.connections.get(restaurantSlug)!.add(ws);
    console.log(`Client connected to menu updates for: ${restaurantSlug}`);
  }

  private removeConnection(restaurantSlug: string, ws: WebSocket) {
    const connections = this.connections.get(restaurantSlug);
    if (connections) {
      connections.delete(ws);
      if (connections.size === 0) {
        this.connections.delete(restaurantSlug);
      }
    }
    console.log(`Client disconnected from menu updates for: ${restaurantSlug}`);
  }

  // Notify all clients watching a specific restaurant menu
  notifyMenuUpdate(restaurantSlug: string, updateData?: any) {
    const connections = this.connections.get(restaurantSlug);
    if (!connections || connections.size === 0) {
      console.log(`⚠️  No WebSocket connections found for restaurant: ${restaurantSlug}`);
      return;
    }

    const message = JSON.stringify({
      type: 'menu_update',
      restaurantSlug,
      timestamp: new Date().toISOString(),
      ...updateData
    });

    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });

    console.log(`📡 Notified ${connections.size} clients about menu update for: ${restaurantSlug}`);
    console.log(`📦 Update data:`, updateData);
  }

  // Get connection count for a restaurant
  getConnectionCount(restaurantSlug: string): number {
    return this.connections.get(restaurantSlug)?.size || 0;
  }

  // Get all active restaurant slugs
  getActiveRestaurants(): string[] {
    return Array.from(this.connections.keys());
  }
}