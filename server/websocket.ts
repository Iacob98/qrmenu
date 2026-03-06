import { WebSocketServer, WebSocket } from 'ws';
import { Server, IncomingMessage } from 'http';
import { parse } from 'url';

const MAX_CONNECTIONS_PER_IP = 10;
const MAX_CONNECTIONS_PER_RESTAURANT = 500;
const HEARTBEAT_INTERVAL = 30_000; // 30 seconds
const CONNECTION_RATE_WINDOW = 60_000; // 1 minute
const MAX_CONNECTIONS_PER_IP_PER_WINDOW = 20;

interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
  restaurantSlug: string;
  clientIp: string;
}

export class MenuWebSocketManager {
  private wss: WebSocketServer;
  private connections: Map<string, Set<ExtWebSocket>> = new Map();
  private ipConnectionCount: Map<string, number> = new Map();
  private ipRateTracker: Map<string, number[]> = new Map();
  private heartbeatInterval: ReturnType<typeof setInterval>;

  constructor(server: Server, private allowedOrigins: string[] = []) {
    this.wss = new WebSocketServer({
      noServer: true,
      maxPayload: 1024, // Clients should not send large messages
    });

    // Handle upgrade manually for Origin validation and rate limiting
    server.on('upgrade', (request, socket, head) => {
      const url = parse(request.url || '', true);
      if (url.pathname !== '/ws') {
        return; // Not our path, let other handlers deal with it
      }

      // Validate Origin
      if (!this.validateOrigin(request)) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
      }

      // Rate limit per IP
      const clientIp = this.getClientIp(request);
      if (!this.checkRateLimit(clientIp)) {
        socket.write('HTTP/1.1 429 Too Many Requests\r\n\r\n');
        socket.destroy();
        return;
      }

      // Check per-IP concurrent connection limit
      const currentCount = this.ipConnectionCount.get(clientIp) || 0;
      if (currentCount >= MAX_CONNECTIONS_PER_IP) {
        socket.write('HTTP/1.1 429 Too Many Requests\r\n\r\n');
        socket.destroy();
        return;
      }

      // Validate restaurant slug
      const restaurantSlug = url.query?.restaurant as string;
      if (!restaurantSlug || !/^[a-zA-Z0-9_-]+$/.test(restaurantSlug)) {
        socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
        socket.destroy();
        return;
      }

      // Check per-restaurant connection limit
      const restaurantConns = this.connections.get(restaurantSlug);
      if (restaurantConns && restaurantConns.size >= MAX_CONNECTIONS_PER_RESTAURANT) {
        socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');
        socket.destroy();
        return;
      }

      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit('connection', ws, request);
      });
    });

    this.wss.on('connection', (ws: ExtWebSocket, request: IncomingMessage) => {
      const url = parse(request.url || '', true);
      const restaurantSlug = url.query?.restaurant as string;
      const clientIp = this.getClientIp(request);

      ws.isAlive = true;
      ws.restaurantSlug = restaurantSlug;
      ws.clientIp = clientIp;

      this.addConnection(restaurantSlug, ws, clientIp);

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('close', () => {
        this.removeConnection(restaurantSlug, ws, clientIp);
      });

      ws.on('error', () => {
        this.removeConnection(restaurantSlug, ws, clientIp);
      });

      // Send initial connection confirmation
      ws.send(JSON.stringify({
        type: 'connected',
        restaurantSlug,
      }));
    });

    // Heartbeat: detect and clean up dead connections
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        const extWs = ws as ExtWebSocket;
        if (!extWs.isAlive) {
          this.removeConnection(extWs.restaurantSlug, extWs, extWs.clientIp);
          return extWs.terminate();
        }
        extWs.isAlive = false;
        extWs.ping();
      });
    }, HEARTBEAT_INTERVAL);
  }

  private validateOrigin(request: IncomingMessage): boolean {
    const origin = request.headers.origin;

    // No origin header — same-origin navigation or non-browser client
    if (!origin) return true;

    const isDevelopment = process.env.NODE_ENV !== 'production';
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

    if (isDevelopment && isLocalhost) return true;

    // Check against configured allowed origins
    if (this.allowedOrigins.length > 0) {
      return this.allowedOrigins.some(
        allowed => origin === allowed.trim() ||
          origin === `https://${allowed.trim()}` ||
          origin === `http://${allowed.trim()}`
      );
    }

    // If no origins configured and in production, only allow same-origin (no origin header)
    return false;
  }

  private getClientIp(request: IncomingMessage): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return request.socket.remoteAddress || 'unknown';
  }

  private checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const timestamps = this.ipRateTracker.get(ip) || [];

    // Remove entries outside the window
    const recent = timestamps.filter(t => now - t < CONNECTION_RATE_WINDOW);

    if (recent.length >= MAX_CONNECTIONS_PER_IP_PER_WINDOW) {
      return false;
    }

    recent.push(now);
    this.ipRateTracker.set(ip, recent);
    return true;
  }

  private addConnection(restaurantSlug: string, ws: ExtWebSocket, clientIp: string) {
    if (!this.connections.has(restaurantSlug)) {
      this.connections.set(restaurantSlug, new Set());
    }
    this.connections.get(restaurantSlug)!.add(ws);

    this.ipConnectionCount.set(clientIp, (this.ipConnectionCount.get(clientIp) || 0) + 1);
  }

  private removeConnection(restaurantSlug: string, ws: ExtWebSocket, clientIp: string) {
    const connections = this.connections.get(restaurantSlug);
    if (connections) {
      connections.delete(ws);
      if (connections.size === 0) {
        this.connections.delete(restaurantSlug);
      }
    }

    const count = this.ipConnectionCount.get(clientIp) || 0;
    if (count <= 1) {
      this.ipConnectionCount.delete(clientIp);
    } else {
      this.ipConnectionCount.set(clientIp, count - 1);
    }
  }

  // Notify all clients watching a specific restaurant menu
  notifyMenuUpdate(restaurantSlug: string, updateData?: any) {
    const connections = this.connections.get(restaurantSlug);
    if (!connections || connections.size === 0) {
      return;
    }

    const message = JSON.stringify({
      type: 'menu_update',
      restaurantSlug,
      timestamp: new Date().toISOString(),
      ...updateData,
    });

    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  // Get connection count for a restaurant
  getConnectionCount(restaurantSlug: string): number {
    return this.connections.get(restaurantSlug)?.size || 0;
  }

  // Get all active restaurant slugs
  getActiveRestaurants(): string[] {
    return Array.from(this.connections.keys());
  }

  // Clean up on shutdown
  close() {
    clearInterval(this.heartbeatInterval);
    this.wss.close();
  }
}
