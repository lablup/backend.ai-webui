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
declare const useErrorMessageResolver: () => {
    getErrorMessage: (error: unknown, defaultMessage?: string) => string;
};
export default useErrorMessageResolver;
