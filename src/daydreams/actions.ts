import { action, Action } from '@daydreamsai/core';
import { z } from 'zod';
import { Lucid } from '../client';
import { OrderSide, OrderType, TimeInForce } from '../types';

/**
 * Helper to define actions that have access to the Lucid client in their context.
 */
function createAction<T extends z.ZodType>(
    name: string,
    schema: T,
    handler: (params: z.infer<T>, client: Lucid) => Promise<any>
): Action<any, any> { // Using any for context type for flexibility
    return action({
        name,
        schema,
        handler: async (params, ctx: any) => {
            // Assume the context has a 'lucid' property which is the Lucid client
            if (!ctx.lucid || !(ctx.lucid instanceof Lucid)) {
                throw new Error('Lucid client not found in context. Ensure you are using createLucidContext.');
            }
            return handler(params, ctx.lucid);
        }
    });
}

// --- Market Actions ---

export const getTicker = createAction(
    'market:ticker',
    z.object({
        symbol: z.string().describe('The trading pair symbol, e.g., BTCUSDT'),
    }),
    async ({ symbol }, client) => {
        return client.market.getTicker(symbol);
    }
);

export const getOrderBook = createAction(
    'market:orderBook',
    z.object({
        symbol: z.string().describe('The trading pair symbol'),
        limit: z.number().optional().describe('Depth of the order book'),
    }),
    async ({ symbol, limit }, client) => {
        return client.market.getOrderBook(symbol, limit);
    }
);

// --- Trade Actions ---

export const createOrder = createAction(
    'trade:createOrder',
    z.object({
        symbol: z.string(),
        side: z.nativeEnum(OrderSide),
        type: z.nativeEnum(OrderType),
        quantity: z.string(),
        price: z.string().optional(),
        timeInForce: z.nativeEnum(TimeInForce).optional(),
    }),
    async (params, client) => {
        return client.trade.createOrder(params);
    }
);

export const cancelOrder = createAction(
    'trade:cancelOrder',
    z.object({
        symbol: z.string(),
        orderId: z.number(),
    }),
    async ({ symbol, orderId }, client) => {
        return client.trade.cancelOrder(symbol, orderId);
    }
);

// --- Account Actions ---

export const getAccountInfo = createAction(
    'account:info',
    z.object({}),
    async (_, client) => {
        return client.account.getAccountInfo();
    }
);

export const getOpenOrders = createAction(
    'trade:getOpenOrders',
    z.object({
        symbol: z.string().optional(),
    }),
    async ({ symbol }, client) => {
        return client.trade.getOpenOrders(symbol);
    }
);

export const allActions = [
    getTicker,
    getOrderBook,
    createOrder,
    cancelOrder,
    getAccountInfo,
    getOpenOrders
];
