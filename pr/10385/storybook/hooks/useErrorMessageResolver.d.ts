export type GraphQLErrorEntry = {
    message?: string | null;
};
export type ErrorResponse = {
    type: string;
    title: string;
    msg?: string;
    error_code?: string;
    traceback?: string;
};
/**
 * A failed GraphQL request (non-2xx response from `/admin/gql`) returns its
 * detail in a top-level `errors` array instead of the manager's `title`/`msg`.
 * This is a distinct body shape from {@link ErrorResponse}, so it gets its own
 * type rather than being conflated with the problem+json shape.
 */
export type GraphQLErrorResponseBody = {
    errors?: GraphQLErrorEntry[];
};
export type ESMClientErrorResponse = {
    isError: true;
    timestamp: string;
    type: string;
    requestUrl: string;
    requestMethod: string;
    requestParameters: any;
    statusCode: number;
    statusText: string;
    title: string;
    message: string;
    description: string;
    error_code?: string;
    traceback?: string;
    response?: ErrorResponse | GraphQLErrorResponseBody;
};
export type GetErrorMessageOptions = {
    defaultMessage?: string;
    /**
     * 'normal' (default) returns just the human-readable message, appending
     * `(error_code)` when present — suitable for end-user surfaces.
     *
     * 'detail' additionally appends the HTTP `statusCode` and `error_code`
     * in the existing parenthesized suffix style, e.g.
     * `message text (HTTP 500, BAI_E0001)`. Use this on operator-facing
     * failure surfaces (e.g. SFTP session creation) where classifying the
     * failure (4xx policy/quota vs 5xx agent/storage) matters more than a
     * clean copy.
     */
    verbosity?: 'normal' | 'detail';
};
declare const useErrorMessageResolver: () => {
    getErrorMessage: (error: unknown, defaultMessageOrOptions?: string | GetErrorMessageOptions) => string;
};
export default useErrorMessageResolver;
