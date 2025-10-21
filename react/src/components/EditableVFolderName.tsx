import { EditableVFolderNameFragment$key } from '../__generated__/EditableVFolderNameFragment.graphql';
import { EditableVFolderNameRefetchQuery } from '../__generated__/EditableVFolderNameRefetchQuery.graphql';
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
import _ from 'lodash';
import { CornerDownLeftIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';
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

const EditableVFolderName: React.FC<EditableVFolderNameProps> = ({
  component: Component = Typography.Text,
  vfolderFrgmt,
  editable: editableOfProps,
  style,
  enableLink = true,
  onEditEnd,
  onEditStart,
  inputProps,
  ...otherProps
}) => {
  'use memo';
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
          title={vfolder.name || undefined}
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
            focusFallback();
            if (values.vfolderName === vfolder.name) {
              return;
            }
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
              // TODO: (Priority low) implement async validator to check existing folder names
              // {
              //   validator: (__, value) => {
              //     if (_.includes(existingNames, value)) {
              //       return Promise.reject(t('data.FolderAlreadyExists'));
              //     }
              //     return Promise.resolve();
              //   },
              // },
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

export default EditableVFolderName;
