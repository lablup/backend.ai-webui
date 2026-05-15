import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';

export type ErrorResponse = {
  type: string;
  title: string;
  msg?: string;
  error_code?: string;
  traceback?: string;
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
  response?: ErrorResponse;
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
  const { t } = useTranslation();

  const isErrorLike = (error: unknown): error is ErrorLike => {
    return typeof error === 'object' && error !== null;
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

    // Prioritize `msg` or `message`(deprecated) field if available.
    if (error.msg || error.message) {
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
