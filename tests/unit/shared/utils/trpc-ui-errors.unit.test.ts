import { describe, it, expect } from 'vitest';

import { mapTrpcError, toUiErrorForBoundary, type UiError } from '@shared/utils/trpc-ui-errors';

describe('TRPC UI Errors', () => {
  describe('mapTrpcError', () => {
    it('maps known top-level codes', () => {
      expect(mapTrpcError({ code: 'UNAUTHORIZED', message: 'x' })).toMatchObject({
        type: 'unauthorized',
        message: 'Access denied',
      });
      expect(mapTrpcError({ code: 'FORBIDDEN', message: 'x' })).toMatchObject({
        type: 'forbidden',
        message: 'Action not allowed',
      });
      expect(mapTrpcError({ code: 'NOT_FOUND', message: 'x' })).toMatchObject({
        type: 'not_found',
        message: 'Resource not found',
      });
      expect(mapTrpcError({ code: 'CONFLICT', message: 'x' })).toMatchObject({
        type: 'conflict',
        message: 'Conflict',
      });
      expect(mapTrpcError({ code: 'TOO_MANY_REQUESTS', message: 'x' })).toMatchObject({
        type: 'rate_limit',
        message: 'Too many requests',
      });
      expect(mapTrpcError({ code: 'INTERNAL_SERVER_ERROR', message: 'x' })).toMatchObject({
        type: 'internal',
        message: 'Something went wrong',
      });
    });

    it('maps BAD_REQUEST preferring zodError when present', () => {
      const withZod = mapTrpcError({
        code: 'BAD_REQUEST',
        message: 'fallback message',
        data: { zodError: 'Zod validation failed' },
      });
      expect(withZod).toMatchObject({ type: 'bad_request', message: 'Zod validation failed' });

      const withMessage = mapTrpcError({ code: 'BAD_REQUEST', message: 'Bad input' });
      expect(withMessage).toMatchObject({ type: 'bad_request', message: 'Bad input' });
    });

    it('reads code from nested data.code (tRPC client shape)', () => {
      const ui = mapTrpcError({ message: 'x', data: { code: 'UNAUTHORIZED' } });
      expect(ui).toMatchObject({ type: 'unauthorized' });
    });

    it('infers type from message when no code', () => {
      expect(mapTrpcError(new Error('Access denied: token missing'))).toMatchObject({
        type: 'unauthorized',
      });
      expect(mapTrpcError(new Error('User not found'))).toMatchObject({ type: 'not_found' });
      expect(mapTrpcError(new Error('Invalid payload'))).toMatchObject({ type: 'bad_request' });
      const unknown = mapTrpcError(new Error('Totally unexpected'));
      expect(unknown.type).toBe('unknown');
      expect(unknown.message).toContain('Totally unexpected');
    });
  });

  describe('toUiErrorForBoundary', () => {
    it('sets error name to UI_<TYPE>', () => {
      const ui: UiError = { type: 'forbidden', message: 'Nope' };
      const err = toUiErrorForBoundary(ui);
      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe('UI_FORBIDDEN');
      expect(err.message).toBe('Nope');
    });
  });
});
