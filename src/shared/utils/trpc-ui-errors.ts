import type { TRPCClientErrorLike } from '@trpc/client';

import type { AppRouter } from '@/infrastructure/trpc/root';

export type UiErrorType =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'bad_request'
  | 'conflict'
  | 'rate_limit'
  | 'internal'
  | 'unknown';

export interface UiError {
  type: UiErrorType;
  message: string;
  // optional raw details for debugging
  details?: unknown;
}

type TrpcErrorShape = TRPCClientErrorLike<AppRouter> | (Error & { code?: string; data?: unknown });

export function mapTrpcError(error: unknown): UiError {
  const err = error as TrpcErrorShape | undefined;
  // Try top-level .code, then nested .data.code (tRPC client error)
  const topLevelCode =
    typeof err === 'object' && err && 'code' in err ? (err as { code?: string }).code : undefined;
  const dataCode =
    typeof err === 'object' && err && 'data' in err
      ? (err as { data?: { code?: string } }).data?.code
      : undefined;
  const code = topLevelCode ?? dataCode;

  const data =
    typeof err === 'object' && err && 'data' in err ? (err as { data?: unknown }).data : undefined;
  const message = (typeof err === 'object' && err && 'message' in err && err.message) || '';

  // Prefer zod validation message if present
  const zodMessage =
    data && typeof data === 'object' && 'zodError' in data
      ? String((data as { zodError: unknown }).zodError)
      : undefined;

  switch (code) {
    case 'UNAUTHORIZED':
      return { type: 'unauthorized', message: 'Access denied', details: error };
    case 'FORBIDDEN':
      return { type: 'forbidden', message: 'Action not allowed', details: error };
    case 'NOT_FOUND':
      return { type: 'not_found', message: 'Resource not found', details: error };
    case 'BAD_REQUEST':
      return {
        type: 'bad_request',
        message: zodMessage || message || 'Invalid request',
        details: error,
      };
    case 'CONFLICT':
      return { type: 'conflict', message: 'Conflict', details: error };
    case 'TOO_MANY_REQUESTS':
      return { type: 'rate_limit', message: 'Too many requests', details: error };
    case 'INTERNAL_SERVER_ERROR':
      return { type: 'internal', message: 'Something went wrong', details: error };
    default: {
      // Try to infer from message if no code (very defensive)
      const msg = String(message || 'Unexpected error');
      if (/unauthorized|access denied/i.test(msg))
        return { type: 'unauthorized', message: 'Access denied', details: error };
      if (/not\s*found/i.test(msg))
        return { type: 'not_found', message: 'Resource not found', details: error };
      if (/invalid|bad\s*request/i.test(msg))
        return { type: 'bad_request', message: zodMessage || msg, details: error };
      return { type: 'unknown', message: msg, details: error };
    }
  }
}

// Create an Error suitable for Next.js error boundaries with a stable name
export function toUiErrorForBoundary(ui: UiError): Error {
  const e = new Error(ui.message);
  e.name = `UI_${ui.type.toUpperCase()}`;
  return e;
}
