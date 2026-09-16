import { useBAIi18n } from './useBAIi18n';
import * as _ from 'lodash-es';

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
  // The Backend.AI client attaches the raw response body here; it is either the
  // manager's problem+json error or a GraphQL error body.
  response?: ErrorResponse | GraphQLErrorResponseBody;
};

type ErrorLike = Partial<ErrorResponse & Error & ESMClientErrorResponse>;

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

const useErrorMessageResolver = () => {
  const { t } = useBAIi18n();

  const isErrorLike = (error: unknown): error is ErrorLike => {
    return typeof error === 'object' && error !== null;
  };

  /**
   * Extracts the message from a GraphQL-style error response body.
   *
   * A failed GraphQL request (e.g. an HTTP 400 from `/admin/gql`) returns
   * `{ errors: [{ message }] }`, which the Backend.AI client exposes on
   * `error.response`. The client's top-level `message`/`title` fields cannot
   * describe it — they render `"server responded failure: <status> - undefined"`
   * because the manager's `title`/`msg` fields are absent — so the real detail
   * lives only in this array.
   */
  const getGraphQLErrorMessage = (
    response: ErrorResponse | GraphQLErrorResponseBody | undefined,
  ): string | undefined => {
    const errors =
      response && 'errors' in response ? response.errors : undefined;
    if (!Array.isArray(errors)) return undefined;
    const messages = errors
      .map((entry) => entry?.message)
      .filter((message): message is string => !_.isEmpty(message));
    return messages.length > 0 ? messages.join('\n') : undefined;
  };

  /**
   * Resolves the error message for a given error object.
   * @param error - The error object to resolve.
   * @param defaultMessageOrOptions - Either a default fallback string
   *   (backwards compatible) or an options object with `defaultMessage`
   *   and `verbosity`.
   * @returns - The resolved error message (string).
   */
  const getErrorMessage = (
    error: unknown,
    defaultMessageOrOptions?: string | GetErrorMessageOptions,
  ): string => {
    const options: GetErrorMessageOptions =
      typeof defaultMessageOrOptions === 'string'
        ? { defaultMessage: defaultMessageOrOptions }
        : (defaultMessageOrOptions ?? {});
    const { defaultMessage, verbosity = 'normal' } = options;

    let errorMsg = defaultMessage || t('error.UnknownError');
    if (!error || !isErrorLike(error)) return errorMsg;

    // Prefer the GraphQL error detail when the failed response carries one,
    // since the client's `message`/`title` only say "... - undefined" for it.
    const graphQLErrorMessage = getGraphQLErrorMessage(error.response);
    if (graphQLErrorMessage) {
      errorMsg = graphQLErrorMessage;
    } else if (error.msg || error.message) {
      const integratedErrorMsg = error.msg || error.message || '';
      errorMsg = !_.includes(integratedErrorMsg, 'Traceback')
        ? integratedErrorMsg
        : errorMsg;
    } else if (error.title) {
      errorMsg = error.title;
    }

    if (verbosity === 'detail') {
      // Suffix style — aligns with the existing `(error_code)` idiom.
      // e.g. `<message> (HTTP 500, BAI_E0001)`.
      const suffixParts = _.compact([
        _.isNumber(error.statusCode) ? `HTTP ${error.statusCode}` : null,
        error.error_code || null,
      ]);
      return suffixParts.length > 0
        ? `${errorMsg} (${suffixParts.join(', ')})`
        : errorMsg;
    }

    if (error.error_code) {
      errorMsg = _.join([errorMsg, `(${error.error_code})`], ' ');
    }

    return errorMsg;
  };

  return {
    getErrorMessage,
  };
};

export default useErrorMessageResolver;
