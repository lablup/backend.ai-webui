/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useActiveErrorBoundaryControl } from '../hooks/useActiveErrorBoundary';
import { theme } from '../theme-shim';
import { isLoginSessionExpiredState } from './LoginSessionExtendButton';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Text } from '@astryxdesign/core/Text';
import { BAIFlex } from 'backend.ai-ui';
import type { GraphQLFormattedError } from 'graphql';
import { useAtomValue } from 'jotai';
import { RotateCw, TriangleAlertIcon } from 'lucide-react';
import React from 'react';
import {
  ErrorBoundary,
  ErrorBoundaryPropsWithRender,
} from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

/**
 * Extended Error with GraphQL error information
 */
export interface ErrorWithGraphQL extends Error {
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
  const { markTriggered, markReset } = useActiveErrorBoundaryControl();
  return (
    <ErrorBoundary
      {...props}
      onError={(error, info) => {
        // Increment the active error boundary count so navigation links
        // (e.g. WebUILink) know that the React tree is in an inconsistent
        // state and should fall back to a full page reload instead of SPA
        // navigation.
        markTriggered();
        props.onError?.(error, info);
      }}
      onReset={(details) => {
        markReset();
        props.onReset?.(details);
      }}
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
            {/* PILOT-DECISION: antd `Result status="warning"` → Astryx
                `EmptyState` (MAPPING §"Also COMPOSITION": `subTitle`→
                `description`, `extra`→`actions`, `status="warning"`→ an icon
                you choose). antd drew a warning illustration; the Astryx
                equivalent is an explicit `icon`, so the lucide
                `TriangleAlertIcon` stands in. */}
            <EmptyState
              icon={<TriangleAlertIcon size={40} />}
              title={
                isLoginSessionExpiredError
                  ? t('errorBoundary.ExpiredLoginSessionTitle')
                  : t('errorBoundary.Title')
              }
              actions={
                <BAIFlex direction="column" gap="md">
                  <Button
                    variant="primary"
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
                    icon={<RotateCw size="1em" />}
                    label={
                      isLoginSessionExpiredError
                        ? t('errorBoundary.ExpiredLoginSessionReLogin')
                        : t('errorBoundary.ReloadPage')
                    }
                  />
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
                        <Banner
                          status="info"
                          // POLISH-3 item 1: a Banner's action belongs in
                          // `endContent` (Banner's own "Action button"
                          // anatomy slot), not stacked on top of the
                          // description column.
                          endContent={
                            <Button
                              icon={<RotateCw size="1em" />}
                              onClick={() => {
                                resetErrorBoundary();
                              }}
                              label={t('errorBoundary.ResetErrorBoundary')}
                            />
                          }
                          description={
                            <BAIFlex
                              direction="column"
                              align="center"
                              gap={'md'}
                            >
                              <BAIFlex direction="column" gap="sm">
                                <Text weight="semibold">
                                  {t('errorBoundary.ErrorMessage')}
                                </Text>
                                <Text
                                  as="div"
                                  display="block"
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
                                </Text>

                                {/* Debug: Show only relevant error information */}
                                <Text
                                  weight="semibold"
                                  style={{ marginTop: token.marginXS }}
                                >
                                  {t('errorBoundary.DebugInfo')}
                                </Text>
                                <Text
                                  as="div"
                                  display="block"
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
                                </Text>

                                {error instanceof Error && error.stack && (
                                  <>
                                    <Text
                                      weight="semibold"
                                      style={{ marginTop: token.marginXS }}
                                    >
                                      {t('errorBoundary.StackTrace')}
                                    </Text>
                                    <Text
                                      as="div"
                                      display="block"
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
                                    </Text>
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
            />
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
    <EmptyState
      icon={<TriangleAlertIcon size={40} />}
      title={t('errorBoundary.Title')}
      actions={
        <BAIFlex direction="column" gap="md">
          <Button
            variant="primary"
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
            icon={<RotateCw size="1em" />}
            label={t('errorBoundary.ReloadPage')}
          />
        </BAIFlex>
      }
    />
  );
};
