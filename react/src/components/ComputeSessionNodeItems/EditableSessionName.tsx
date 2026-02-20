/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { EditableSessionNameFragment$key } from '../../__generated__/EditableSessionNameFragment.graphql';
import { EditableSessionNameRefetchQuery } from '../../__generated__/EditableSessionNameRefetchQuery.graphql';
import { useBaiSignedRequestWithPromise } from '../../helper';
import { useCurrentUserInfo } from '../../hooks/backendai';
import { useTanMutation } from '../../hooks/reactQueryAlias';
import { useValidateSessionName } from '../../hooks/useValidateSessionName';
import { theme, Form, Input, App, type GetProps, Typography } from 'antd';
import { CornerDownLeftIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  fetchQuery,
  useFragment,
  useRelayEnvironment,
} from 'react-relay';

type EditableSessionNameProps = {
  sessionFrgmt: EditableSessionNameFragment$key;
} & (
  | ({ component?: typeof Typography.Text } & Omit<
      GetProps<typeof Typography.Text>,
      'children'
    >)
  | ({ component: typeof Typography.Title } & Omit<
      GetProps<typeof Typography.Title>,
      'children'
    >)
);

const EditableSessionName: React.FC<EditableSessionNameProps> = ({
  component: Component = Typography.Text,
  sessionFrgmt,
  editable: editableOfProps,
  style,
  ...otherProps
}) => {
  'use memo';
  const relayEvn = useRelayEnvironment();

  const session = useFragment(
    graphql`
      fragment EditableSessionNameFragment on ComputeSessionNode {
        id
        row_id
        name
        priority
        user_id
        status
        project_id @required(action: THROW)
      }
    `,
    sessionFrgmt,
  );

  const [optimisticName, setOptimisticName] = useState(session.name);
  const validationRules = useValidateSessionName(optimisticName);
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

  // focus back to the text component after editing for better UX related to keyboard shortcuts
  const textRef = useRef<HTMLElement>(null);
  const focusFallback = () => {
    setTimeout(() => {
      textRef.current?.focus();
    }, 0);
  };

  return (
    <>
      {(!isEditing || isPendingRenamingAndRefreshing) && (
        <Component
          ref={textRef}
          tabIndex={-1}
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
            // after editing, focus this element, remove outline
            outline: 'none',
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
            focusFallback();
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
                      $scope_id: ScopeField
                    ) {
                      compute_session_node(
                        id: $sessionId
                        scope_id: $scope_id
                      ) {
                        id
                        name
                      }
                    }
                  `,
                  {
                    sessionId: session.id,
                    scope_id: `project:${session.project_id}`,
                  },
                )
                  .toPromise()
                  // ignore the error
                  .catch();
              },
              onError: () => {
                // if the session name is not changed, do not show error
                if (session.name !== values.sessionName) {
                  message.error(t('session.FailToRenameSession'));
                }
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
          <Form.Item name="sessionName" rules={validationRules}>
            <Input
              size="large"
              value={optimisticName || ''}
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
                  e.stopPropagation();
                  setIsEditing(false);
                  focusFallback();
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
