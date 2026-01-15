import { RestClient } from '../utils/RestClient';

export interface FuturesPosition {
    symbol: string;
    positionAmt: string;
    entryPrice: string;
    markPrice: string;
    unRealizedProfit: string;
    liquidationPrice: string;
    leverage: number;
    marginType: 'isolated' | 'cross';
}

export class Futures {
    constructor(private client: RestClient) {}

    /**
     * Get current futures positions.
     */
    async getPositions(): Promise<FuturesPosition[]> {
        return this.client.get<FuturesPosition[]>('/futures/positionRisk');
    }

    /**
     * Change leverage for a symbol.
     * @param symbol Trading pair
     * @param leverage Target leverage (1-125)
     */
    async changeLeverage(symbol: string, leverage: number): Promise<{ symbol: string; leverage: number }> {
        return this.client.post('/futures/leverage', { symbol, leverage });
    }

    /**
     * Change margin type (ISOLATED or CROSS).
     */
    async changeMarginType(symbol: string, marginType: 'ISOLATED' | 'CROSS'): Promise<any> {
        return this.client.post('/futures/marginType', { symbol, marginType });
    }
}
