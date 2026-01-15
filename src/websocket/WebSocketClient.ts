import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { ILogger, ConsoleLogger } from '../utils/Logger';
import { WebSocketEvent, WsRequest, WsResponse } from './types';

export interface WebSocketClientOptions {
  wsUrl?: string;
  logger?: ILogger;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private logger: ILogger;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private reconnectCount: number = 0;
  private pingInterval: NodeJS.Timeout | null = null;
  private subscriptions: Set<string> = new Set();
  private isClosing: boolean = false;

  constructor(options: WebSocketClientOptions = {}) {
    super();
    this.url = options.wsUrl || 'wss://ws.lucidtrade.com/v1';
    this.logger = options.logger || new ConsoleLogger();
    this.reconnectInterval = options.reconnectInterval || 5000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;

    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.url);

    this.ws.on('open', () => {
      this.logger.info('WebSocket connected');
      this.reconnectCount = 0;
      this.emit(WebSocketEvent.CONNECT);
      this.startHeartbeat();
      this.resubscribe();
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      this.handleMessage(data);
    });

    this.ws.on('close', () => {
      this.logger.warn('WebSocket disconnected');
      this.cleanup();
      this.emit(WebSocketEvent.DISCONNECT);
      if (!this.isClosing) {
        this.reconnect();
      }
    });

    this.ws.on('error', (err) => {
      this.logger.error('WebSocket error', err);
      this.emit(WebSocketEvent.ERROR, err);
    });
  }

  private handleMessage(data: WebSocket.Data) {
    try {
      const parsed = JSON.parse(data.toString());
      
      // Handle Ping/Pong if necessary, though WS usually handles control frames.
      // Dispatch events based on payload structure
      if (parsed.e) { // 'e' is typically event type
        this.emit(parsed.e, parsed);
        // Also emit generic message
        this.emit(WebSocketEvent.MESSAGE, parsed);
        
        // Map specific business events
        if (parsed.e === '24hrTicker') this.emit(WebSocketEvent.TICKER, parsed);
        if (parsed.e === 'depthUpdate') this.emit(WebSocketEvent.ORDER_BOOK, parsed);
        if (parsed.e === 'trade') this.emit(WebSocketEvent.TRADE, parsed);
      }
      
    } catch (e) {
      this.logger.error('Failed to parse WebSocket message', e);
    }
  }

  private reconnect() {
    if (this.reconnectCount < this.maxReconnectAttempts) {
      this.reconnectCount++;
      this.logger.info(`Attempting to reconnect (${this.reconnectCount}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectInterval);
      this.emit(WebSocketEvent.RECONNECT, this.reconnectCount);
    } else {
      this.logger.error('Max reconnect attempts reached');
    }
  }

  private startHeartbeat() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, 30000);
  }

  private cleanup() {
    if (this.pingInterval) clearInterval(this.pingInterval);
  }

  private resubscribe() {
      // Logic to re-send subscription messages upon reconnection
      if (this.subscriptions.size > 0) {
          const params = Array.from(this.subscriptions);
          this.send({
              method: 'SUBSCRIBE',
              params,
              id: Date.now()
          });
      }
  }

  public send(data: WsRequest) {
      if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(data));
      } else {
          this.logger.warn('WebSocket not open, cannot send message');
      }
  }

  public subscribe(channels: string[]) {
      channels.forEach(ch => this.subscriptions.add(ch));
      this.send({
          method: 'SUBSCRIBE',
          params: channels,
          id: Date.now()
      });
  }

  public unsubscribe(channels: string[]) {
      channels.forEach(ch => this.subscriptions.delete(ch));
      this.send({
          method: 'UNSUBSCRIBE',
          params: channels,
          id: Date.now()
      });
  }

  public close() {
    this.isClosing = true;
    this.ws?.close();
  }
}
