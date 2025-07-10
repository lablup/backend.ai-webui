import { useValidateSessionNameQuery } from '../__generated__/useValidateSessionNameQuery.graphql';
import { useCurrentProjectValue } from './useCurrentProject';
import type { RuleObject } from 'antd/es/form';
import { FormItemProps } from 'antd/lib';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useRelayEnvironment, fetchQuery } from 'react-relay';

export const useValidateSessionName = (
  currentName?: string,
): Exclude<FormItemProps['rules'], undefined> => {
  const { t } = useTranslation();
  const relayEvn = useRelayEnvironment();
  const currentProject = useCurrentProjectValue();
  return [
    {
      min: 4,
      message: t('session.validation.SessionNameTooShort'),
    },
    {
      max: 64,
      message: t('session.validation.SessionNameTooLong64'),
    },
    {
      validator(f: RuleObject, value: string) {
        if (_.isEmpty(value)) {
          return Promise.resolve();
        }
        if (!/^\w/.test(value)) {
          return Promise.reject(
            t('session.validation.SessionNameShouldStartWith'),
          );
        }

        if (!/\w$/.test(value)) {
          return Promise.reject(
            t('session.validation.SessionNameShouldEndWith'),
          );
        }

        if (!/^[\w.-]*$/.test(value)) {
          return Promise.reject(
            t('session.validation.SessionNameInvalidCharacter'),
          );
        }
        return Promise.resolve();
      },
    },
    {
      validator: async (f: RuleObject, value: string) => {
        if (value === currentName) {
          return Promise.resolve();
        }
        return fetchQuery<useValidateSessionNameQuery>(
          relayEvn,
          graphql`
            query useValidateSessionNameQuery(
              $projectId: UUID!
              $filter: String
            ) {
              compute_session_nodes(project_id: $projectId, filter: $filter) {
                count
              }
            }
          `,
          {
            projectId: currentProject.id,
            filter: `status != "TERMINATED" & status != "CANCELLED" & name == "${value}"`,
          },
        )
          .toPromise()
          .then((data) => {
            if (!data || !data.compute_session_nodes) {
              return Promise.reject(
                'Unable to validate service name. Please try again.',
              );
            }
            if ((data?.compute_session_nodes?.count ?? 0) > 0) {
              return Promise.reject(t('session.launcher.SessionAlreadyExists'));
            }
            return Promise.resolve();
          })
          .catch((err: any) => {
            return Promise.reject(
              err?.message || err || t('error.UnknownError'),
            );
          });
      },
    },
  ];
};
