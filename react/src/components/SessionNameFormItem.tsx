import { SessionNameFormItemDuplicatedCheckQuery } from '../__generated__/SessionNameFormItemDuplicatedCheckQuery.graphql';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { Form, FormItemProps, Input } from 'antd';
import { TFunction } from 'i18next';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, fetchQuery, useRelayEnvironment } from 'react-relay';

interface SessionNameFormItemProps extends FormItemProps {}

export interface SessionNameFormItemValue {
  sessionName: string;
}

export const getSessionNameRules = (
  t: TFunction,
): Exclude<FormItemProps['rules'], undefined> => [
  {
    min: 4,
    message: t('session.validation.SessionNameTooShort'),
  },
  {
    max: 64,
    message: t('session.validation.SessionNameTooLong64'),
  },
  {
    validator(f, value) {
      if (_.isEmpty(value)) {
        return Promise.resolve();
      }
      if (!/^\w/.test(value)) {
        return Promise.reject(
          t('session.validation.SessionNameShouldStartWith'),
        );
      }

      if (!/\w$/.test(value)) {
        return Promise.reject(t('session.validation.SessionNameShouldEndWith'));
      }

      if (!/^[\w.-]*$/.test(value)) {
        return Promise.reject(
          t('session.validation.SessionNameInvalidCharacter'),
        );
      }
      return Promise.resolve();
    },
  },
];

const SessionNameFormItem: React.FC<SessionNameFormItemProps> = ({
  ...formItemProps
}) => {
  const { t } = useTranslation();
  const relayEvn = useRelayEnvironment();
  const currentProject = useCurrentProjectValue();
  return (
    <Form.Item
      label={t('session.launcher.SessionName')}
      name="sessionName"
      validateDebounce={500}
      // Original rule : /^(?=.{4,64}$)\w[\w.-]*\w$/
      // https://github.com/lablup/backend.ai/blob/main/src/ai/backend/manager/api/session.py#L355-L356
      rules={[
        {
          min: 4,
          message: t('session.validation.SessionNameTooShort'),
        },
        {
          max: 64,
          message: t('session.validation.SessionNameTooLong64'),
        },
        {
          validator(f, value) {
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
          validator: async (_, value) => {
            const hasSameName =
              await fetchQuery<SessionNameFormItemDuplicatedCheckQuery>(
                relayEvn,
                graphql`
                  query SessionNameFormItemDuplicatedCheckQuery(
                    $projectId: UUID!
                    $filter: String
                  ) {
                    compute_session_nodes(
                      project_id: $projectId
                      filter: $filter
                    ) {
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
                  return data?.compute_session_nodes?.count !== 0;
                })
                .catch(() => {
                  return false;
                });
            return hasSameName
              ? Promise.reject(t('session.launcher.SessionAlreadyExists'))
              : Promise.resolve();
          },
        },
      ]}
      {...formItemProps}
    >
      <Input allowClear autoComplete="off" />
    </Form.Item>
  );
};

export default SessionNameFormItem;
