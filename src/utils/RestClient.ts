import axios, { AxiosInstance, Method, InternalAxiosRequestConfig } from 'axios';
import * as CryptoJS from 'crypto-js';
import { ILogger, ConsoleLogger } from './Logger';
import { AuthenticationError, APIError, NetworkError, RateLimitError } from '../errors/LucidError';

export interface RestClientOptions {
  apiKey?: string;
  apiSecret?: string;
  baseURL?: string;
  timeout?: number;
  logger?: ILogger;
  syncTime?: boolean; // Enable auto-sync with server time
}

export class RestClient {
  private axiosInstance: AxiosInstance;
  private apiKey: string;
  private apiSecret: string;
  private logger: ILogger;
  private timeOffset: number = 0;
  private syncTime: boolean;

  constructor(options: RestClientOptions = {}) {
    this.apiKey = options.apiKey || '';
    this.apiSecret = options.apiSecret || '';
    this.logger = options.logger || new ConsoleLogger();
    this.syncTime = options.syncTime ?? true;

    this.axiosInstance = axios.create({
      baseURL: options.baseURL || 'https://api.lucidtrade.com/v1',
      timeout: options.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'lucid-sdk-ts/0.1.0',
      },
    });

    this.initializeInterceptors();
    if (this.syncTime) {
        this.synchronizeTime().catch(err => this.logger.warn('Failed to sync time:', err));
    }
  }

  private async synchronizeTime() {
    try {
        const start = Date.now();
        const response = await this.axiosInstance.get('/time');
        const serverTime = response.data.serverTime;
        const end = Date.now();
        const rtt = end - start;
        this.timeOffset = serverTime - (end - rtt / 2);
        this.logger.info(`Time synchronized. Offset: ${this.timeOffset}ms`);
    } catch (e) {
        this.logger.warn('Could not synchronize time with server.');
    }
  }

  private initializeInterceptors() {
    this.axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
      if (this.apiKey && this.apiSecret) {
        await this.signRequest(config);
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
        response => response,
        error => {
            if (error.response) {
                const { status, data } = error.response;
                this.logger.error(`API Error ${status}:`, data);

                if (status === 401) throw new AuthenticationError(data.msg || 'Invalid credentials');
                if (status === 429) throw new RateLimitError('Too many requests', error.response.headers['retry-after']);
                
                throw new APIError(data.msg || 'Unknown API Error', data.code || -1, status);
            } else if (error.request) {
                throw new NetworkError('No response received from server', error);
            } else {
                throw new NetworkError(error.message, error);
            }
        }
    );
  }

  private async signRequest(config: InternalAxiosRequestConfig) {
    // If auto-sync is enabled and offset is 0, we might want to wait or just proceed. 
    // For now, we apply the offset.
    const timestamp = (Date.now() + this.timeOffset).toString();
    const method = config.method?.toUpperCase() || 'GET';
    const path = config.url || '';
    
    let payload = `${timestamp}${method}${path}`;
    
    if (config.params) {
        const sortedQuery = Object.keys(config.params)
            .sort()
            .map(key => `${key}=${config.params[key]}`)
            .join('&');
        if (sortedQuery) payload += `?${sortedQuery}`;
    }

    if (config.data) {
       payload += typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
    }

    const signature = CryptoJS.HmacSHA256(payload, this.apiSecret).toString(CryptoJS.enc.Hex);

    config.headers.set('X-LUCID-API-KEY', this.apiKey);
    config.headers.set('X-LUCID-TIMESTAMP', timestamp);
    config.headers.set('X-LUCID-SIGNATURE', signature);
  }

  public async request<T>(method: Method, url: string, params?: any, data?: any): Promise<T> {
      const response = await this.axiosInstance.request<T>({
        method,
        url,
        params,
        data,
      });
      return response.data;
  }
  
  // ... Proxy methods (get, post, etc.) can remain or be used directly via request
  public get<T>(url: string, params?: any): Promise<T> { return this.request<T>('GET', url, params); }
  public post<T>(url: string, data?: any): Promise<T> { return this.request<T>('POST', url, undefined, data); }
  public put<T>(url: string, data?: any): Promise<T> { return this.request<T>('PUT', url, undefined, data); }
  public delete<T>(url: string, params?: any): Promise<T> { return this.request<T>('DELETE', url, params); }
}
