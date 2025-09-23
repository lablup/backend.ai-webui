import _ from 'lodash';
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
};

const useErrorMessageResolver = () => {
  const { t } = useTranslation();

  /**
   * Resolves the error message for a given error object.
   * @param error - The error object to resolve.
   * @param defaultMessage - (optional) The default message to return if no specific message is found.
   * @returns - The resolved error message (string).
   */
  const getErrorMessage = (
    error: Partial<ErrorResponse & Error> | undefined | null,
    defaultMessage?: string,
  ): string => {
    let errorMsg = defaultMessage || t('error.UnknownError');
    if (!error) return errorMsg;

    // Prioritize `msg` or `message`(deprecated) field if available.
    if (error?.msg || error?.message) {
      const integratedErrorMsg = error?.msg || error?.message || '';
      errorMsg = !_.includes(integratedErrorMsg, 'Traceback')
        ? integratedErrorMsg
        : errorMsg;
    } else if (error.title) {
      errorMsg = error.title;
    }
    if (error?.error_code) {
      errorMsg = _.join([errorMsg, `(${error.error_code})`], ' ');
    }

    return errorMsg;
  };

  return {
    getErrorMessage,
  };
};

export default useErrorMessageResolver;
