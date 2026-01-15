import { RestClient } from '../utils/RestClient';
import { NewOrderRequest, Order } from '../types';

export class Trade {
  constructor(private client: RestClient) {}

  /**
   * Send in a new order.
   * @param orderRequest - The order details
   */
  async createOrder(orderRequest: NewOrderRequest): Promise<Order> {
    return this.client.post<Order>('/order', orderRequest);
  }

  /**
   * Cancel an active order.
   * @param symbol - Trading pair symbol
   * @param orderId - The order ID to cancel
   */
  async cancelOrder(symbol: string, orderId: number): Promise<Order> {
    return this.client.delete<Order>('/order', { symbol, orderId });
  }

  /**
   * Check an order's status.
   * @param symbol - Trading pair symbol
   * @param orderId - The order ID
   */
  async getOrder(symbol: string, orderId: number): Promise<Order> {
    return this.client.get<Order>('/order', { symbol, orderId });
  }

  /**
   * Get all open orders on a symbol.
   * @param symbol - Trading pair symbol (optional)
   */
  async getOpenOrders(symbol?: string): Promise<Order[]> {
    return this.client.get<Order[]>('/openOrders', { symbol });
  }
}
