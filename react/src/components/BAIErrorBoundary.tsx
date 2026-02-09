import { isLoginSessionExpiredState } from './LoginSessionExtendButton';
import { ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Result, theme, Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import type { GraphQLFormattedError } from 'graphql';
import { useAtomValue } from 'jotai';
import React from 'react';
import {
  ErrorBoundary,
  ErrorBoundaryPropsWithRender,
} from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

/**
 * Extended Error with GraphQL error information
 */
interface ErrorWithGraphQL extends Error {
  source?: {
    errors?: ReadonlyArray<GraphQLFormattedError>;
    variables?: any;
    operation?: {
      name?: string;
    };
  };
  errors?: ReadonlyArray<GraphQLFormattedError>;
}

/**
 * Type guard to check if error has GraphQL source errors
 */
function hasGraphQLSourceErrors(error: unknown): error is ErrorWithGraphQL & {
  source: { errors: ReadonlyArray<GraphQLFormattedError> };
} {
  if (!(error instanceof Error) || !('source' in error)) {
    return false;
  }

  const err = error as ErrorWithGraphQL;
  return (
    typeof err.source === 'object' &&
    err.source !== null &&
    'errors' in err.source &&
    Array.isArray(err.source.errors) &&
    err.source.errors.length > 0
  );
}

/**
 * Type guard to check if error has errors array
 */
function hasErrorsArray(error: unknown): error is ErrorWithGraphQL & {
  errors: ReadonlyArray<GraphQLFormattedError>;
} {
  return (
    error instanceof Error &&
    'errors' in error &&
    Array.isArray((error as ErrorWithGraphQL).errors)
  );
}

interface BAIErrorBoundaryProps extends Omit<
  ErrorBoundaryPropsWithRender,
  'fallbackRender'
> {
  style?: React.CSSProperties;
}

const BAIErrorBoundary: React.FC<BAIErrorBoundaryProps> = ({
  style,
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const isExpiredLoginSession = useAtomValue(isLoginSessionExpiredState);
  return (
    <ErrorBoundary
      {...props}
      fallbackRender={({ error, resetErrorBoundary }) => {
        const isLoginSessionExpiredError =
          isExpiredLoginSession ||
          (error as Error)?.name === 'AuthorizationError' ||
          (error as any)?.statusCode === 401;
        return (
          <BAIFlex
            style={{ margin: 'auto', ...style }}
            justify="center"
            align="center"
          >
            <Result
              status="warning"
              title={
                isLoginSessionExpiredError
                  ? t('errorBoundary.ExpiredLoginSessionTitle')
                  : t('errorBoundary.Title')
              }
              extra={
                <BAIFlex direction="column" gap="md">
                  <Button
                    type="primary"
                    key="console"
                    onClick={() => {
                      // @ts-ignore
                      if (globalThis.isElectron) {
                        globalThis.location.href =
                          // @ts-ignore
                          globalThis.electronInitialHref;
                      } else {
                        globalThis.location.reload();
                      }
                    }}
                    icon={<ReloadOutlined />}
                  >
                    {isLoginSessionExpiredError
                      ? t('errorBoundary.ExpiredLoginSessionReLogin')
                      : t('errorBoundary.ReloadPage')}
                  </Button>
                  {
                    // TODO: Include this to App Config
                    // @ts-ignore
                    globalThis?.backendaiwebui?.debug === true && (
                      <BAIFlex
                        direction="column"
                        gap="sm"
                        align="center"
                        style={{ width: '100%' }}
                      >
                        <Alert
                          type="info"
                          description={
                            <BAIFlex
                              direction="column"
                              align="center"
                              gap={'md'}
                            >
                              <Button
                                type="default"
                                icon={<ReloadOutlined />}
                                onClick={() => {
                                  resetErrorBoundary();
                                }}
                              >
                                {t('errorBoundary.ResetErrorBoundary')}
                              </Button>
                              <BAIFlex direction="column" gap="sm">
                                <Typography.Text strong>
                                  {t('errorBoundary.ErrorMessage')}
                                </Typography.Text>
                                <Typography.Paragraph
                                  style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    maxHeight: '150px',
                                    overflow: 'auto',
                                    textAlign: 'left',
                                  }}
                                >
                                  <pre style={{ margin: 0 }}>
                                    {(() => {
                                      // Try to extract GraphQL errors using type guards
                                      // Case 1: Relay error with source.errors
                                      if (hasGraphQLSourceErrors(error)) {
                                        return error.source.errors
                                          .map((e) => e.message)
                                          .join('\n\n');
                                      }

                                      // Case 2: Error object with errors array
                                      if (hasErrorsArray(error)) {
                                        return error.errors
                                          .map((e) => e.message)
                                          .join('\n\n');
                                      }

                                      // Case 3: Standard Error message
                                      if (
                                        error instanceof Error &&
                                        error.message
                                      ) {
                                        return error.message;
                                      }

                                      // Fallback: stringify the error
                                      return JSON.stringify(error, null, 2);
                                    })()}
                                  </pre>
                                </Typography.Paragraph>

                                {/* Debug: Show only relevant error information */}
                                <Typography.Text
                                  strong
                                  style={{ marginTop: token.marginXS }}
                                >
                                  {t('errorBoundary.DebugInfo')}
                                </Typography.Text>
                                <Typography.Paragraph
                                  style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    maxHeight: '150px',
                                    overflow: 'auto',
                                    textAlign: 'left',
                                  }}
                                >
                                  <pre style={{ margin: 0 }}>
                                    {JSON.stringify(
                                      {
                                        ...(error instanceof Error && {
                                          name: error.name,
                                          message: error.message,
                                        }),
                                        ...(hasGraphQLSourceErrors(error) && {
                                          errors: error.source.errors,
                                          variables: error.source.variables,
                                          operationName:
                                            error.source.operation?.name,
                                        }),
                                      },
                                      null,
                                      2,
                                    )}
                                  </pre>
                                </Typography.Paragraph>

                                {error instanceof Error && error.stack && (
                                  <>
                                    <Typography.Text
                                      strong
                                      style={{ marginTop: token.marginXS }}
                                    >
                                      {t('errorBoundary.StackTrace')}
                                    </Typography.Text>
                                    <Typography.Paragraph
                                      style={{
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        maxHeight: '150px',
                                        overflow: 'auto',
                                        textAlign: 'left',
                                        marginBottom: 0,
                                      }}
                                    >
                                      <pre style={{ margin: 0 }}>
                                        {(error as Error).stack}
                                      </pre>
                                    </Typography.Paragraph>
                                  </>
                                )}
                              </BAIFlex>
                            </BAIFlex>
                          }
                          title={t('errorBoundary.DisplayOnlyDevEnv')}
                        />
                      </BAIFlex>
                    )
                  }
                </BAIFlex>
              }
            ></Result>
          </BAIFlex>
        );
      }}
    />
  );
};

export default BAIErrorBoundary;
export const ErrorView = () => {
  const { t } = useTranslation();
  return (
    <Result
      status="warning"
      title={t('errorBoundary.Title')}
      extra={
        <BAIFlex direction="column" gap="md">
          <Button
            type="primary"
            key="console"
            onClick={() => {
              // @ts-ignore
              if (globalThis.isElectron) {
                // @ts-ignore
                globalThis.location.href = globalThis.electronInitialHref;
              } else {
                globalThis.location.reload();
              }
            }}
            icon={<ReloadOutlined />}
          >
            {t('errorBoundary.ReloadPage')}
          </Button>
        </BAIFlex>
      }
    ></Result>
  );
};
