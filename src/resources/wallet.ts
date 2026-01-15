import { RestClient } from '../utils/RestClient';

export interface DepositAddress {
    address: string;
    coin: string;
    tag: string;
    url: string;
}

export interface WithdrawHistory {
    id: string;
    amount: string;
    transactionFee: string;
    coin: string;
    status: number;
    address: string;
    txId: string;
    applyTime: string;
}

export class Wallet {
    constructor(private client: RestClient) {}

    /**
     * Get deposit address for a coin.
     * @param coin Asset symbol (e.g., BTC)
     * @param network Network (optional)
     */
    async getDepositAddress(coin: string, network?: string): Promise<DepositAddress> {
        return this.client.get<DepositAddress>('/capital/deposit/address', { coin, network });
    }

    /**
     * Get withdrawal history.
     */
    async getWithdrawHistory(options?: { coin?: string; startTime?: number; endTime?: number }): Promise<WithdrawHistory[]> {
        return this.client.get<WithdrawHistory[]>('/capital/withdraw/history', options);
    }

    /**
     * Submit a withdrawal request.
     */
    async withdraw(coin: string, address: string, amount: string, network?: string): Promise<{ id: string }> {
        return this.client.post('/capital/withdraw/apply', { coin, address, amount, network });
    }
}
