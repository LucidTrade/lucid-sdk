import { context, Context } from '@daydreamsai/core';
import { z } from 'zod';
import { Lucid } from '../client';
import { allActions } from './actions';

export interface LucidContextState {
    lucid: Lucid;
}

/**
 * Creates a Daydreams context pre-configured with the LucidTrade SDK and actions.
 * 
 * @param client An initialized Lucid client instance.
 * @returns A Daydreams Context object ready to be used in an agent.
 */
export function createLucidContext(client: Lucid): Context<LucidContextState, any> {
    return context({
        type: 'lucidtrade',
        schema: z.object({}), // No specific input args required for the context itself
        create: () => ({
            lucid: client, // Inject the client into the state
        }),
    }).setActions(allActions);
}
