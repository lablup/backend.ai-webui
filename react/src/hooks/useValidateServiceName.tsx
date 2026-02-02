import { useValidateServiceNameQuery } from '../__generated__/useValidateServiceNameQuery.graphql';
import { useCurrentProjectValue } from './useCurrentProject';
import { type FormItemProps } from 'antd';
import type { RuleObject } from 'antd/es/form';
import _ from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRelayEnvironment, fetchQuery } from 'react-relay';

export const useValidateServiceName = (): Exclude<
  FormItemProps['rules'],
  undefined
> => {
  const { t } = useTranslation();
  const relayEvn = useRelayEnvironment();
  const currentProject = useCurrentProjectValue();
  return useMemo(
    () => [
      {
        min: 4,
        message: t('modelService.ServiceNameMinLength'),
      },
      {
        max: 24,
        message: t('modelService.ServiceNameMaxLength'),
        type: 'string',
      },
      {
        validator(_f: RuleObject, value: string) {
          if (_.isEmpty(value)) {
            return Promise.resolve();
          }
          if (!/^\w/.test(value)) {
            return Promise.reject(t('modelService.ServiceNameShouldStartWith'));
          }

          if (!/\w$/.test(value)) {
            return Promise.reject(t('modelService.ServiceNameShouldEndWith'));
          }

          if (!/^[\w-]*$/.test(value)) {
            return Promise.reject(
              t('modelService.ServiceNameInvalidCharacter'),
            );
          }
          return Promise.resolve();
        },
      },
      {
        validator: async (_f: RuleObject, value: string) => {
          if (!value) return Promise.resolve();
          return fetchQuery<useValidateServiceNameQuery>(
            relayEvn,
            graphql`
              query useValidateServiceNameQuery(
                $projectID: UUID!
                $filter: String
                $offset: Int!
                $limit: Int!
              ) {
                endpoint_list(
                  project: $projectID
                  filter: $filter
                  offset: $offset
                  limit: $limit
                ) {
                  total_count
                }
              }
            `,
            {
              projectID: currentProject.id,
              filter: `lifecycle_stage != "destroyed" & name == "${value}"`,
              offset: 0,
              limit: 1,
            },
          )
            .toPromise()
            .catch(() => {
              // ignore network error
              return Promise.resolve();
            })
            .then((data) => {
              if ((data?.endpoint_list?.total_count ?? 0) > 0) {
                return Promise.reject(t('modelService.ServiceAlreadyExists'));
              }
            });
        },
      },
      {
        required: true,
      },
    ],
    [relayEvn, currentProject.id, t],
  );
};
