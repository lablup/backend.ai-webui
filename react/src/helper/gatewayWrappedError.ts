/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

interface GraphQLResult {
  data?: Record<string, unknown> | null;
  errors?: ReadonlyArray<{
    message?: string;
    extensions?: {
      response?: {
        status?: number;
        statusText?: string;
        body?: { msg?: string; [key: string]: unknown };
      };
    };
  }>;
}

// A gateway reports an upstream HTTP failure as a 200 with all-null root fields;
// returns it shaped like `_wrapWithPromise`'s HTTP error, else null.
export function gatewayWrappedError(result: GraphQLResult | undefined) {
  if (!result?.errors?.length) return null;
  if (Object.values(result.data ?? {}).some((v) => v != null)) return null;
  const upstream = result.errors.find(
    (e) => (e.extensions?.response?.status ?? 0) >= 400,
  )?.extensions?.response;
  if (!upstream) return null;
  const detail = upstream.body?.msg ?? result.errors[0].message;
  return {
    isError: true as const,
    ...upstream.body,
    statusCode: upstream.status,
    statusText: upstream.statusText,
    message: detail,
    description: detail,
    response: result,
  };
}
