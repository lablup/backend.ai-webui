import { useCurrentUserInfo } from '../../hooks/backendai';
import { getSessionNameRules } from '../SessionNameFormItem';
import { EditableSessionNameFragment$key } from './__generated__/EditableSessionNameFragment.graphql';
import { EditableSessionNameMutation } from './__generated__/EditableSessionNameMutation.graphql';
import { theme, Form, Input } from 'antd';
import Text, { TextProps } from 'antd/es/typography/Text';
import Title, { TitleProps } from 'antd/es/typography/Title';
import graphql from 'babel-plugin-relay/macro';
import { CornerDownLeftIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment, useMutation } from 'react-relay';

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
  const [commitEditMutation, isPendingEditMutation] =
    useMutation<EditableSessionNameMutation>(graphql`
      mutation EditableSessionNameMutation($input: ModifyComputeSessionInput!) {
        modify_compute_session(input: $input) {
          item {
            id
            name
          }
        }
      }
    `);

  const { t } = useTranslation();
  const { token } = theme.useToken();
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

  return (
    <>
      {(!isEditing || isPendingEditMutation) && (
        <Component
          editable={
            isEditingAllowed && !isPendingEditMutation
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
            color: isPendingEditMutation
              ? token.colorTextTertiary
              : style?.color,
          }}
          {...otherProps}
        >
          {isPendingEditMutation ? optimisticName : session.name}
        </Component>
      )}
      {isEditing && !isPendingEditMutation && (
        <Form
          onFinish={(values) => {
            setIsEditing(false);
            setOptimisticName(values.sessionName);
            commitEditMutation({
              variables: {
                input: {
                  id: session.id,
                  name: values.sessionName,
                },
              },
              onCompleted(response, errors) {},
              onError(error) {},
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
            rules={getSessionNameRules(t)}
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
