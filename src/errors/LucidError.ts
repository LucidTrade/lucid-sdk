export class LucidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LucidError';
    Object.setPrototypeOf(this, LucidError.prototype);
  }
}

export class AuthenticationError extends LucidError {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class PermissionError extends LucidError {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'PermissionError';
  }
}

export class RateLimitError extends LucidError {
  public retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class NetworkError extends LucidError {
  public originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

export class APIError extends LucidError {
  public code: number;
  public status: number;

  constructor(message: string, code: number, status: number) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.status = status;
  }
}
