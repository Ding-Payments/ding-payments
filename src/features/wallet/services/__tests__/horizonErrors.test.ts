import {
  mapHorizonError,
  HorizonAccountNotFoundError,
  HorizonConnectionError,
  HorizonRateLimitError,
  HorizonUnknownError,
} from '../horizonErrors';

describe('mapHorizonError', () => {
  it('should map 404 response to HorizonAccountNotFoundError', () => {
    const error = { response: { status: 404, extras: { account_id: 'GABCDEF123' } } };
    const result = mapHorizonError(error);
    expect(result).toBeInstanceOf(HorizonAccountNotFoundError);
    expect(result.message).toContain('GABCDEF123');
  });

  it('should map 404 without extras to HorizonAccountNotFoundError', () => {
    const error = { response: { status: 404 } };
    const result = mapHorizonError(error);
    expect(result).toBeInstanceOf(HorizonAccountNotFoundError);
  });

  it('should map 429 response to HorizonRateLimitError', () => {
    const error = { response: { status: 429 } };
    const result = mapHorizonError(error);
    expect(result).toBeInstanceOf(HorizonRateLimitError);
  });

  it('should map other status codes to HorizonConnectionError', () => {
    const error = { response: { status: 500 }, message: 'Internal server error' };
    const result = mapHorizonError(error);
    expect(result).toBeInstanceOf(HorizonConnectionError);
  });

  it('should map timeout errors to HorizonConnectionError', () => {
    const error = new Error('Request timed out');
    const result = mapHorizonError(error);
    expect(result).toBeInstanceOf(HorizonConnectionError);
  });

  it('should map unknown errors to HorizonUnknownError', () => {
    const error = new Error('Something weird happened');
    const result = mapHorizonError(error);
    expect(result).toBeInstanceOf(HorizonUnknownError);
  });

  it('should handle non-Error objects', () => {
    const result = mapHorizonError('string error');
    expect(result).toBeInstanceOf(HorizonUnknownError);
  });
});
