interface StellarError {
  message?: string;
  response?: {
    status?: number;
    extras?: Record<string, unknown>;
  };
}

export class HorizonAccountNotFoundError extends Error {
  public readonly accountId: string;
  constructor(accountId: string) {
    super(`Account not found: ${accountId}`);
    this.name = 'HorizonAccountNotFoundError';
    this.accountId = accountId;
  }
}

export class HorizonConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HorizonConnectionError';
  }
}

export class HorizonRateLimitError extends Error {
  constructor() {
    super('Horizon rate limit exceeded');
    this.name = 'HorizonRateLimitError';
  }
}

export class HorizonUnknownError extends Error {
  public readonly rawError: unknown;
  constructor(message: string, rawError: unknown) {
    super(message);
    this.name = 'HorizonUnknownError';
    this.rawError = rawError;
  }
}

function extractStellarError(error: unknown): StellarError {
  if (error && typeof error === 'object') {
    const obj = error as Record<string, unknown>;
    if ('response' in obj || 'message' in obj) {
      return {
        message: typeof obj.message === 'string' ? obj.message : undefined,
        response: obj.response as StellarError['response'],
      };
    }
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return {};
}

export function mapHorizonError(error: unknown): Error {
  const stellarError = extractStellarError(error);

  if (stellarError.response?.status === 404) {
    const extras = stellarError.response.extras;
    return new HorizonAccountNotFoundError(
      (extras?.account_id as string) || 'unknown',
    );
  }
  if (stellarError.response?.status === 429) {
    return new HorizonRateLimitError();
  }
  if (stellarError.response?.status) {
    return new HorizonConnectionError(
      stellarError.message || 'Horizon request failed',
    );
  }
  if (
    stellarError.message &&
    (stellarError.message.includes('timeout') ||
      stellarError.message.includes('timed out'))
  ) {
    return new HorizonConnectionError('Request timed out');
  }

  return new HorizonUnknownError(
    error instanceof Error ? error.message : 'Unknown Horizon error',
    error,
  );
}
