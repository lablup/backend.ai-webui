import { EditableSessionNameDuplicatedCheckQuery } from '../../__generated__/EditableSessionNameDuplicatedCheckQuery.graphql';
import { EditableSessionNameFragment$key } from '../../__generated__/EditableSessionNameFragment.graphql';
import { EditableSessionNameRefetchQuery } from '../../__generated__/EditableSessionNameRefetchQuery.graphql';
import { useBaiSignedRequestWithPromise } from '../../helper';
import { useCurrentUserInfo } from '../../hooks/backendai';
import { useTanMutation } from '../../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
import { getSessionNameRules } from '../SessionNameFormItem';
import { theme, Form, Input, App } from 'antd';
import Text, { TextProps } from 'antd/es/typography/Text';
import Title, { TitleProps } from 'antd/es/typography/Title';
import graphql from 'babel-plugin-relay/macro';
import { CornerDownLeftIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchQuery, useFragment, useRelayEnvironment } from 'react-relay';

type EditableSessionNameProps = {
  sessionFrgmt: EditableSessionNameFragment$key;
} & (
  | ({ component?: typeof Text } & Omit<TextProps, 'children'>)
  | ({ component: typeof Title } & Omit<TitleProps, 'children'>)
);

const EditableSessionName: React.FC<EditableSessionNameProps> = ({
  component: Component = Text,
  sessionFrgmt,
  editable: editableOfProps,
  style,
  ...otherProps
}) => {
  const relayEvn = useRelayEnvironment();
  const currentProject = useCurrentProjectValue();

  const session = useFragment(
    graphql`
      fragment EditableSessionNameFragment on ComputeSessionNode {
        id
        row_id
        name
        priority
        user_id
        status
      }
    `,
    sessionFrgmt,
  );
  const [optimisticName, setOptimisticName] = useState(session.name);
  const [userInfo] = useCurrentUserInfo();

  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const renameSessionMutation = useTanMutation({
    mutationFn: (newName: string) => {
      return baiRequestWithPromise({
        method: 'POST',
        url: `/session/${session.name}/rename`,
        body: {
          name: newName,
        },
      });
    },
  });

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const [isEditing, setIsEditing] = useState(false);

  const isNotPreparingCategoryStatus = ![
    'RESTARTING',
    'PREPARING',
    'PREPARED',
    'CREATING',
    'PULLING',
  ].includes(session.status || '');

  const isEditingAllowed =
    editableOfProps &&
    userInfo.uuid === session.user_id &&
    isNotPreparingCategoryStatus;

  const isPendingRenamingAndRefreshing =
    renameSessionMutation.isPending || optimisticName !== session.name;
  return (
    <>
      {(!isEditing || isPendingRenamingAndRefreshing) && (
        <Component
          editable={
            isEditingAllowed && !isPendingRenamingAndRefreshing
              ? {
                  onStart: () => {
                    setIsEditing(true);
                  },
                  triggerType: ['icon', 'text'],
                }
              : false
          }
          copyable
          style={{
            ...style,
            color: isPendingRenamingAndRefreshing
              ? token.colorTextTertiary
              : style?.color,
          }}
          {...otherProps}
        >
          {renameSessionMutation.isPending || optimisticName !== session.name
            ? optimisticName
            : session.name}
        </Component>
      )}
      {isEditing && !isPendingRenamingAndRefreshing && (
        <Form
          onFinish={(values) => {
            setIsEditing(false);
            setOptimisticName(values.sessionName);
            // FIXME: This API does not return any response on success or error.
            renameSessionMutation.mutate(values.sessionName, {
              onSuccess: () => {
                // refetch the updated session name
                fetchQuery<EditableSessionNameRefetchQuery>(
                  relayEvn,
                  graphql`
                    query EditableSessionNameRefetchQuery(
                      $sessionId: GlobalIDField!
                      $project_id: UUID!
                    ) {
                      compute_session_node(
                        id: $sessionId
                        project_id: $project_id
                      ) {
                        id
                        name
                      }
                    }
                  `,
                  {
                    sessionId: session.id,
                    project_id: currentProject.id,
                  },
                )
                  .toPromise()
                  // ignore the error
                  .catch();
                // ignore the error
                document.dispatchEvent(
                  new CustomEvent('backend-ai-session-list-refreshed'),
                );
              },
              onError: (err) => {
                message.error(t('session.FailToRenameSession'));
              },
            });
          }}
          initialValues={{
            sessionName: session.name,
          }}
          style={{
            flex: 1,
          }}
        >
          <Form.Item
            name="sessionName"
            validateDebounce={1000}
            rules={[
              ...getSessionNameRules(t),
              {
                validator: async (rule, value) => {
                  if (value === session.name) {
                    return Promise.resolve();
                  }
                  const hasSameName =
                    await fetchQuery<EditableSessionNameDuplicatedCheckQuery>(
                      relayEvn,
                      graphql`
                        query EditableSessionNameDuplicatedCheckQuery(
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
                        // ignore duplicated check error
                        return false;
                      });
                  return hasSameName
                    ? Promise.reject(t('session.launcher.SessionAlreadyExists'))
                    : Promise.resolve();
                },
              },
            ]}
            style={{
              margin: 0,
            }}
          >
            <Input
              size="large"
              suffix={
                <CornerDownLeftIcon
                  style={{
                    fontSize: '0.8em',
                    color: token.colorTextTertiary,
                  }}
                />
              }
              autoFocus
              onKeyDown={(e) => {
                // when press escape key, cancel editing
                if (e.key === 'Escape') {
                  setIsEditing(false);
                }
              }}
            />
          </Form.Item>
        </Form>
      )}
    </>
  );
};

export default EditableSessionName;
