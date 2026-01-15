import { RestClient } from '../utils/RestClient';
import { AccountInfo, Order } from '../types';

export class Account {
  constructor(private client: RestClient) {}

  /**
   * Get current account information including balances and permissions.
   */
  async getAccountInfo(): Promise<AccountInfo> {
    return this.client.get<AccountInfo>('/account');
  }

  /**
   * Get trade history (fills).
   * @param symbol - Trading pair symbol
   * @param limit - Number of trades to retrieve
   */
  async getMyTrades(symbol: string, limit: number = 500): Promise<Order[]> {
    return this.client.get<Order[]>('/myTrades', { symbol, limit });
  }
}
