import { EditableVFolderNameFragment$key } from '../__generated__/EditableVFolderNameFragment.graphql';
import { EditableVFolderNameRefetchQuery } from '../__generated__/EditableVFolderNameRefetchQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { isDeletedCategory } from '../pages/VFolderNodeListPage';
import BAILink from './BAILink';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import { theme, Form, Input, App } from 'antd';
import Text, { TextProps } from 'antd/es/typography/Text';
import Title, { TitleProps } from 'antd/es/typography/Title';
import { toLocalId, useErrorMessageResolver } from 'backend.ai-ui';
import _ from 'lodash';
import { CornerDownLeftIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  fetchQuery,
  useFragment,
  useRelayEnvironment,
} from 'react-relay';

type EditableVFolderNameProps = {
  vfolderFrgmt: EditableVFolderNameFragment$key;
  enableLink?: boolean;
  existingNames?: Array<string>;
  onEditEnd?: () => void;
  onEditStart?: () => void;
} & (
  | ({ component?: typeof Text } & Omit<TextProps, 'children'>)
  | ({ component: typeof Title } & Omit<TitleProps, 'children'>)
);

const EditableVFolderName: React.FC<EditableVFolderNameProps> = ({
  component: Component = Text,
  vfolderFrgmt,
  editable: editableOfProps,
  style,
  enableLink = true,
  existingNames,
  onEditEnd,
  onEditStart,
  ...otherProps
}) => {
  const vfolder = useFragment(
    graphql`
      fragment EditableVFolderNameFragment on VirtualFolderNode {
        id
        name
        user
        group
        status
      }
    `,
    vfolderFrgmt,
  );
  const [optimisticName, setOptimisticName] = useState(vfolder.name);
  const [userInfo] = useCurrentUserInfo();
  const currentProject = useCurrentProjectValue();
  const baiClient = useSuspendedBackendaiClient();
  const renameMutation = useTanMutation({
    mutationFn: (input: { id: string; name: string }) => {
      return baiClient.vfolder.rename(input.name, toLocalId(vfolder?.id));
    },
  });
  const relayEnv = useRelayEnvironment();

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const { generateFolderPath } = useFolderExplorerOpener();
  const [isEditing, setIsEditing] = useState(false);

  const isEditingAllowed =
    editableOfProps &&
    (userInfo.uuid === vfolder.user || currentProject?.id === vfolder.group) &&
    !isDeletedCategory(vfolder.status);

  const isPendingRenameMutation =
    renameMutation.isPending || optimisticName !== vfolder.name;

  return (
    <>
      {(!isEditing || isPendingRenameMutation) && (
        <Component
          editable={
            isEditingAllowed && !isPendingRenameMutation
              ? {
                  onStart: () => {
                    setIsEditing(true);
                    onEditStart?.();
                  },
                  onEnd: () => {
                    setIsEditing(false);
                    onEditEnd?.();
                  },
                  onCancel: () => {
                    setIsEditing(false);
                    onEditEnd?.();
                  },
                  triggerType: ['icon'],
                }
              : false
          }
          style={{
            ...style,
            color: isPendingRenameMutation
              ? token.colorTextTertiary
              : style?.color,
          }}
          {...otherProps}
        >
          {enableLink && !isEditing && (
            <BAILink
              type="hover"
              to={generateFolderPath(toLocalId(vfolder?.id))}
            >
              {isPendingRenameMutation ? optimisticName : vfolder.name}
            </BAILink>
          )}
          {!enableLink &&
            (isPendingRenameMutation ? optimisticName : vfolder.name)}
        </Component>
      )}
      {isEditing && !isPendingRenameMutation && (
        <Form
          onFinish={(values) => {
            setIsEditing(false);
            setOptimisticName(values.vfolderName);
            renameMutation.mutate(
              {
                id: vfolder.id,
                name: values.vfolderName,
              },
              {
                onSuccess: () => {
                  onEditEnd?.();
                  message.success(t('data.folders.FileRenamed'));
                  return fetchQuery<EditableVFolderNameRefetchQuery>(
                    relayEnv,
                    graphql`
                      query EditableVFolderNameRefetchQuery($id: String!) {
                        vfolder_node(id: $id) {
                          id
                          name
                        }
                      }
                    `,
                    {
                      id: vfolder.id,
                    },
                  ).toPromise();
                },
                onError: (error) => {
                  onEditEnd?.();
                  message.error(getErrorMessage(error));
                  setOptimisticName(vfolder.name);
                },
              },
            );
          }}
          initialValues={{
            vfolderName: vfolder.name,
          }}
          style={{
            flex: 1,
          }}
        >
          <Form.Item
            name="vfolderName"
            rules={[
              {
                max: 64,
                message: t('data.FolderNameTooLong'),
                type: 'string',
              },
              {
                required: true,
                message: t('data.FolderNameRequired'),
              },
              {
                pattern: /^[a-zA-Z0-9-_.]+$/,
                message: t('data.AllowsLettersNumbersAnd-_Dot'),
              },
              {
                validator: (__, value) => {
                  if (_.includes(existingNames, value)) {
                    return Promise.reject(t('data.FolderAlreadyExists'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            style={{
              margin: 0,
            }}
          >
            <Input
              size="small"
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
                  onEditEnd?.();
                }
              }}
            />
          </Form.Item>
        </Form>
      )}
    </>
  );
};

export default EditableVFolderName;
