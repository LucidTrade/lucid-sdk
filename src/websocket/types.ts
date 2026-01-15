export enum WebSocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  RECONNECT = 'reconnect',
  MESSAGE = 'message',
  
  // Data Events
  TICKER = 'ticker',
  ORDER_BOOK = 'orderBook',
  TRADE = 'trade',
  KLINE = 'kline',
  ACCOUNT_UPDATE = 'accountUpdate',
  ORDER_UPDATE = 'orderUpdate',
}

export interface WsRequest {
  method: 'SUBSCRIBE' | 'UNSUBSCRIBE';
  params: string[];
  id: number;
}

export interface WsResponse {
  id: number;
  result: any;
  error?: {
    code: number;
    msg: string;
  };
}

export interface WsTickerEvent {
  s: string; // Symbol
  p: string; // Price Change
  P: string; // Price Change Percent
  c: string; // Last Price
  // ... more fields
}
// ... define other event types as needed
