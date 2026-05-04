/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { EditableVFolderNameV2Fragment$key } from '../__generated__/EditableVFolderNameV2Fragment.graphql';
import { EditableVFolderNameV2RefetchQuery } from '../__generated__/EditableVFolderNameV2RefetchQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { isDeletedCategory } from '../pages/VFolderNodeListPage';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import {
  theme,
  Form,
  Input,
  App,
  GetProps,
  Typography,
  InputProps,
} from 'antd';
import { BAILink, toLocalId, useErrorMessageResolver } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CornerDownLeftIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  fetchQuery,
  useFragment,
  useRelayEnvironment,
} from 'react-relay';

type EditableVFolderNameV2Props = {
  vfolderNodeFrgmt: EditableVFolderNameV2Fragment$key;
  enableLink?: boolean;
  inputProps?: InputProps;
  onEditEnd?: () => void;
  onEditStart?: () => void;
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

const EditableVFolderNameV2: React.FC<EditableVFolderNameV2Props> = ({
  component: Component = Typography.Text,
  vfolderNodeFrgmt,
  editable: editableOfProps,
  style,
  enableLink = true,
  onEditEnd,
  onEditStart,
  inputProps,
  ...otherProps
}) => {
  'use memo';
  const vfolderNode = useFragment(
    graphql`
      fragment EditableVFolderNameV2Fragment on VFolder {
        id
        status
        metadata {
          name
        }
        ownership {
          userId
          projectId
        }
      }
    `,
    vfolderNodeFrgmt,
  );
  const [optimisticName, setOptimisticName] = useState(
    vfolderNode.metadata?.name,
  );
  const [userInfo] = useCurrentUserInfo();
  const currentProject = useCurrentProjectValue();
  const baiClient = useSuspendedBackendaiClient();
  const renameMutation = useTanMutation({
    mutationFn: (input: { id: string; name: string }) => {
      return baiClient.vfolder.rename(input.name, toLocalId(vfolderNode?.id));
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
    (userInfo.uuid === vfolderNode.ownership?.userId ||
      currentProject?.id === vfolderNode.ownership?.projectId) &&
    !isDeletedCategory(vfolderNode.status);

  const isPendingRenameMutation =
    renameMutation.isPending || optimisticName !== vfolderNode.metadata?.name;

  // focus back to the text component after editing for better UX related to keyboard shortcuts
  const textRef = useRef<HTMLElement>(null);
  const focusFallback = () => {
    setTimeout(() => {
      textRef.current?.focus();
    }, 0);
  };

  return (
    <>
      {(!isEditing || isPendingRenameMutation) && (
        <Component
          ref={textRef}
          tabIndex={-1}
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
                  ...(!_.isBoolean(editableOfProps) ? editableOfProps : {}),
                }
              : false
          }
          style={{
            // after editing, focus this element, remove outline
            outline: 'none',
            ...style,
            color: isPendingRenameMutation
              ? token.colorTextTertiary
              : style?.color,
          }}
          title={vfolderNode.metadata?.name || undefined}
          {...otherProps}
        >
          {enableLink && !isEditing && (
            <BAILink
              type="hover"
              to={generateFolderPath(toLocalId(vfolderNode?.id))}
            >
              {isPendingRenameMutation
                ? optimisticName
                : vfolderNode.metadata?.name}
            </BAILink>
          )}
          {!enableLink &&
            (isPendingRenameMutation
              ? optimisticName
              : vfolderNode.metadata?.name)}
        </Component>
      )}
      {isEditing && !isPendingRenameMutation && (
        <Form
          onFinish={(values) => {
            setIsEditing(false);
            focusFallback();
            if (values.vfolderName === vfolderNode.metadata?.name) {
              onEditEnd?.();
              return;
            }
            setOptimisticName(values.vfolderName);
            renameMutation.mutate(
              {
                id: vfolderNode.id,
                name: values.vfolderName,
              },
              {
                onSuccess: () => {
                  onEditEnd?.();
                  message.success(t('data.folders.FileRenamed'));
                  return fetchQuery<EditableVFolderNameV2RefetchQuery>(
                    relayEnv,
                    graphql`
                      query EditableVFolderNameV2RefetchQuery(
                        $vfolderId: UUID!
                      ) {
                        vfolderV2(vfolderId: $vfolderId) {
                          id
                          metadata {
                            name
                          }
                        }
                      }
                    `,
                    {
                      vfolderId: toLocalId(vfolderNode.id),
                    },
                  ).toPromise();
                },
                onError: (error) => {
                  onEditEnd?.();
                  const errorMessage = getErrorMessage(error);
                  if (
                    errorMessage.includes(
                      'One of your accessible vfolders already has the name you requested.',
                    )
                  ) {
                    message.error(t('data.FolderAlreadyExists'));
                  } else {
                    message.error(errorMessage);
                  }
                  setOptimisticName(vfolderNode.metadata?.name);
                },
              },
            );
          }}
          initialValues={{
            vfolderName: vfolderNode.metadata?.name,
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
                  e.stopPropagation();
                  setIsEditing(false);
                  focusFallback();
                  onEditEnd?.();
                }
              }}
              {...inputProps}
            />
          </Form.Item>
        </Form>
      )}
    </>
  );
};

export default EditableVFolderNameV2;
