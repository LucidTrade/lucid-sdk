import { RestClient, RestClientOptions } from './utils/RestClient';
import { WebSocketClient, WebSocketClientOptions } from './websocket/WebSocketClient';
import { Market } from './resources/market';
import { Trade } from './resources/trade';
import { Account } from './resources/account';
import { Futures } from './resources/futures';
import { Wallet } from './resources/wallet';

export interface LucidOptions extends RestClientOptions {
  wsOptions?: WebSocketClientOptions;
}

export class Lucid {
  public market: Market;
  public trade: Trade;
  public account: Account;
  public futures: Futures;
  public wallet: Wallet;
  public ws: WebSocketClient;
  
  private client: RestClient;

  /**
   * Create a new Lucid SDK instance.
   * @param options Configuration options including apiKey and apiSecret.
   */
  constructor(options: LucidOptions = {}) {
    this.client = new RestClient(options);
    
    // Initialize REST resources
    this.market = new Market(this.client);
    this.trade = new Trade(this.client);
    this.account = new Account(this.client);
    this.futures = new Futures(this.client);
    this.wallet = new Wallet(this.client);

    // Initialize WebSocket client
    this.ws = new WebSocketClient({
        ...options.wsOptions,
        logger: options.logger
    });
  }
}
