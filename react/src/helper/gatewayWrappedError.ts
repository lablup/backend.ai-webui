/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

interface UpstreamResponse {
  status?: number;
  statusText?: string;
  body?: { msg?: string; [key: string]: unknown };
}

interface GraphQLResult {
  data?: Record<string, unknown> | null;
  errors?: ReadonlyArray<{
    message?: string;
    extensions?: { response?: UpstreamResponse; [key: string]: unknown };
  }>;
}

/**
 * A gateway reports an upstream HTTP failure (e.g. the manager's 401 for a
 * disallowed client IP) as a 200 whose root fields are all null. Returns the
 * error to throw for such a result — shaped like `_wrapWithPromise`'s HTTP
 * error, or an `AuthorizationError` for 401 — and `null` otherwise.
 */
export function getGatewayWrappedError(result: GraphQLResult): unknown {
  if (!result?.errors?.length) return null;
  const hasData = Object.values(result.data ?? {}).some((v) => v != null);
  if (hasData) return null;
  const upstream = result.errors.find(
    (e) => (e?.extensions?.response?.status ?? 0) >= 400,
  )?.extensions?.response;
  if (!upstream) return null;

  const detail = upstream.body?.msg ?? result.errors[0]?.message;
  if (upstream.status === 401) {
    const error = new Error(detail || 'GraphQL Authorization Error');
    error.name = 'AuthorizationError';
    return error;
  }
  return {
    isError: true,
    ...upstream.body,
    statusCode: upstream.status,
    statusText: upstream.statusText,
    message: detail,
    description: detail,
    response: result,
  };
}
