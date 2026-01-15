import { RestClient } from '../utils/RestClient';
import { Ticker, OrderBook, Candle, Interval, PublicTrade } from '../types';

export class Market {
  constructor(private client: RestClient) {}

  /**
   * Get 24hr ticker price change statistics.
   * @param symbol - Trading pair symbol (e.g., 'BTCUSDT')
   */
  async getTicker(symbol: string): Promise<Ticker> {
    return this.client.get<Ticker>('/market/ticker', { symbol });
  }

  /**
   * Get order book depth.
   * @param symbol - Trading pair symbol
   * @param limit - Depth limit (default 100)
   */
  async getOrderBook(symbol: string, limit: number = 100): Promise<OrderBook> {
    return this.client.get<OrderBook>('/market/depth', { symbol, limit });
  }

  /**
   * Get candlestick data.
   * @param symbol - Trading pair symbol
   * @param interval - Time interval (e.g., '1h', '1d')
   * @param limit - Number of candles (default 500)
   */
  async getCandles(symbol: string, interval: Interval, limit: number = 500): Promise<Candle[]> {
    return this.client.get<Candle[]>('/market/klines', { symbol, interval, limit });
  }

  /**
   * Get recent public trades.
   * @param symbol - Trading pair symbol
   * @param limit - Number of trades (default 100)
   */
  async getRecentTrades(symbol: string, limit: number = 100): Promise<PublicTrade[]> {
    return this.client.get<PublicTrade[]>('/market/trades', { symbol, limit });
  }
}
