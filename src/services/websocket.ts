// src/services/websocket.ts
import { apiService } from './api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'appointment' | 'order' | 'emotional_support';
  metadata?: {
    emotion?: string;
    confidence?: number;
    order_id?: string;
    queue_position?: number;
  };
}

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'error' | 'connected' | 'queue_update' | 'order_update';
  data: any;
  session_id?: string;
  timestamp?: string;
}

type MessageHandler = (message: ChatMessage) => void;
type StatusHandler = (status: { type: string; data: any }) => void;
type ErrorHandler = (error: string) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private messageHandlers: MessageHandler[] = [];
  private statusHandlers: StatusHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private isReconnecting = false;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = apiService.getWebSocketURL(this.sessionId);
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.reconnectAttempts = 0;
          this.isReconnecting = false;
          this.notifyStatusHandlers({ type: 'connected', data: { sessionId: this.sessionId } });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const wsMessage: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(wsMessage);
          } catch (error) {
            console.error('❌ Failed to parse WebSocket message:', error);
            this.notifyErrorHandlers('Failed to parse server message');
          }
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason);
          this.notifyStatusHandlers({ type: 'disconnected', data: { code: event.code, reason: event.reason } });
          
          if (!this.isReconnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.notifyErrorHandlers('Connection error occurred');
          reject(new Error('WebSocket connection failed'));
        };

        // Connection timeout
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            this.ws?.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(wsMessage: WebSocketMessage) {
    switch (wsMessage.type) {
      case 'message':
        const chatMessage: ChatMessage = {
          id: wsMessage.data.id || Date.now().toString(),
          role: wsMessage.data.role,
          content: wsMessage.data.content,
          timestamp: new Date(wsMessage.timestamp || Date.now()),
          type: wsMessage.data.type || 'text',
          metadata: wsMessage.data.metadata
        };
        this.notifyMessageHandlers(chatMessage);
        break;

      case 'typing':
        this.notifyStatusHandlers({ type: 'typing', data: wsMessage.data });
        break;

      case 'queue_update':
        this.notifyStatusHandlers({ type: 'queue_update', data: wsMessage.data });
        break;

      case 'order_update':
        this.notifyStatusHandlers({ type: 'order_update', data: wsMessage.data });
        break;

      case 'error':
        this.notifyErrorHandlers(wsMessage.data.message || 'Server error');
        break;

      default:
        console.warn('Unknown WebSocket message type:', wsMessage.type);
    }
  }

  sendMessage(content: string, metadata?: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.notifyErrorHandlers('Not connected to server');
      return;
    }

    const message: WebSocketMessage = {
      type: 'message',
      data: {
        role: 'user',
        content,
        metadata
      },
      session_id: this.sessionId,
      timestamp: new Date().toISOString()
    };

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      this.notifyErrorHandlers('Failed to send message');
    }
  }

  private scheduleReconnect() {
    if (this.isReconnecting) return;
    
    this.isReconnecting = true;
    this.reconnectAttempts++;
    
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect().catch(() => {
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          } else {
            this.notifyErrorHandlers('Maximum reconnection attempts reached');
          }
        });
      }
    }, delay);
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler);
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  onStatus(handler: StatusHandler) {
    this.statusHandlers.push(handler);
    return () => {
      const index = this.statusHandlers.indexOf(handler);
      if (index > -1) {
        this.statusHandlers.splice(index, 1);
      }
    };
  }

  onError(handler: ErrorHandler) {
    this.errorHandlers.push(handler);
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  private notifyMessageHandlers(message: ChatMessage) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('❌ Message handler error:', error);
      }
    });
  }

  private notifyStatusHandlers(status: { type: string; data: any }) {
    this.statusHandlers.forEach(handler => {
      try {
        handler(status);
      } catch (error) {
        console.error('❌ Status handler error:', error);
      }
    });
  }

  private notifyErrorHandlers(error: string) {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (error) {
        console.error('❌ Error handler error:', error);
      }
    });
  }

  disconnect() {
    this.isReconnecting = false;
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export { WebSocketManager };