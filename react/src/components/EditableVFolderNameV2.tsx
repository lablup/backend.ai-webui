/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 16 — rebuilt on Astryx. antd `Typography.Text/Title editable` is
 verdict NONE in MAPPING.md §3.4 (`editable` ×2 → self-build), so the edit
 affordance is hand-rolled: display text (Astryx `Text`/`Heading`) plus a
 pencil `IconButton`, switching to the form engine (self-hosted since
 ticket 34) with an Astryx `TextInput` while editing.

 PILOT-DECISIONs:
 - The antd `editable` config object (`triggerType`, custom icons) collapses
   to a boolean `editable` prop + a pencil trigger; the only live consumer
   (`FolderExplorerHeaderV2`) used `triggerType: ['icon', 'text']`, which the
   pencil button covers (clicking the text itself no longer starts editing —
   the affordance is the button).
 - antd `Input suffix` (the corner-down-left glyph) and `count={{max, show}}`
   have no Astryx `TextInput` equivalent (§3.6) and are dropped; max-length
   enforcement stays in the validation rules.
 - `component`/`GetProps` polymorphism is replaced by `variant: 'text'|'title'`.
*/
import { EditableVFolderNameV2Fragment$key } from '../__generated__/EditableVFolderNameV2Fragment.graphql';
import { EditableVFolderNameV2RefetchQuery } from '../__generated__/EditableVFolderNameV2RefetchQuery.graphql';
import { App } from '../app-shim';
// Ticket 34: `Form` is the self-hosted engine; `Form.Item` IS BAIFormItem.
import { Form } from '../form-engine';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useCurrentUserProjectRoles } from '../hooks/useCurrentUserProjectRoles';
import { isDeletedCategory } from '../pages/VFolderNodeListPage';
import { ProjectContextOrNull } from '../types/projectContext';
import BAIFormItem from './BAIFormItem';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import { AstryxFormTextInput } from './astryxFormControls';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Link } from '@astryxdesign/core/Link';
import { HStack } from '@astryxdesign/core/Stack';
import { Heading, Text } from '@astryxdesign/core/Text';
import { toLocalId, useErrorMessageResolver } from 'backend.ai-ui';
import { PencilIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  fetchQuery,
  useFragment,
  useRelayEnvironment,
} from 'react-relay';

interface EditableVFolderNameV2Props {
  vfolderNodeFrgmt: EditableVFolderNameV2Fragment$key;
  /**
   * Explicit project prop contract (ADR-0001, FR-3413): the project context
   * the page decided on, compared against the folder's ownership project for
   * the rename gate. With `null` (super-admin pages) the project-membership
   * branch simply doesn't match — the folder owner and super admins keep
   * their rename power. Never reads the ambient current project.
   */
  project: ProjectContextOrNull;
  enableLink?: boolean;
  /** `'title'` renders an Astryx `Heading level={3}`; `'text'` a body `Text`. */
  variant?: 'text' | 'title';
  editable?: boolean;
  onEditEnd?: () => void;
  onEditStart?: () => void;
  style?: React.CSSProperties;
}

const EditableVFolderNameV2: React.FC<EditableVFolderNameV2Props> = ({
  vfolderNodeFrgmt,
  project,
  enableLink = true,
  variant = 'text',
  editable = false,
  onEditEnd,
  onEditStart,
  style,
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
  // Not `useEffectiveAdminRole` — it resolves its target from the ambient
  // project, which this contract must not depend on.
  const { isSuperAdmin } = useCurrentUserProjectRoles();
  const baiClient = useSuspendedBackendaiClient();
  const renameMutation = useTanMutation({
    mutationFn: (input: { id: string; name: string }) => {
      return baiClient.vfolder.rename(input.name, toLocalId(vfolderNode?.id));
    },
  });
  const relayEnv = useRelayEnvironment();

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const { generateFolderPath } = useFolderExplorerOpener();
  const navigate = useWebUINavigate();
  const [isEditing, setIsEditing] = useState(false);

  // Rename is allowed for the folder owner, super admins (any project —
  // their power must not flicker with header state), or members of the
  // page-decided project when the folder belongs to that project. With
  // `project === null` the membership branch never matches.
  const isEditingAllowed =
    editable &&
    (userInfo.uuid === vfolderNode.ownership?.userId ||
      isSuperAdmin ||
      (project !== null &&
        !!vfolderNode.ownership?.projectId &&
        project.id === vfolderNode.ownership.projectId)) &&
    !isDeletedCategory(vfolderNode.status);

  const isPendingRenameMutation =
    renameMutation.isPending || optimisticName !== vfolderNode.metadata?.name;

  const displayedName = isPendingRenameMutation
    ? optimisticName
    : vfolderNode.metadata?.name;
  const folderPath = generateFolderPath(toLocalId(vfolderNode?.id));

  const nameNode =
    variant === 'title' ? (
      <Heading level={3} maxLines={1}>
        {displayedName}
      </Heading>
    ) : (
      <Text
        maxLines={1}
        hasTruncateTooltip
        color={isPendingRenameMutation ? 'secondary' : undefined}
      >
        {displayedName}
      </Text>
    );

  const stopEditing = () => {
    setIsEditing(false);
    onEditEnd?.();
  };

  return (
    <>
      {(!isEditing || isPendingRenameMutation) && (
        <HStack gap={1} align="center" style={{ minWidth: 0, ...style }}>
          {enableLink ? (
            <Link
              href={`${folderPath.pathname}?${folderPath.search}`}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                navigate(folderPath);
              }}
              style={{ minWidth: 0 }}
            >
              {nameNode}
            </Link>
          ) : (
            nameNode
          )}
          {isEditingAllowed && !isPendingRenameMutation ? (
            <IconButton
              label={t('button.Edit')}
              tooltip={t('button.Edit')}
              icon={<PencilIcon />}
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsEditing(true);
                onEditStart?.();
              }}
            />
          ) : null}
        </HStack>
      )}
      {isEditing && !isPendingRenameMutation && (
        <Form
          onFinish={(values) => {
            stopEditing();
            if (values.vfolderName === vfolderNode.metadata?.name) {
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
          {/* Escape cancels editing; keydown bubbles from the TextInput. */}
          <span
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                stopEditing();
              }
            }}
          >
            <BAIFormItem
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
              <AstryxFormTextInput label={t('data.Foldername')} hasAutoFocus />
            </BAIFormItem>
          </span>
        </Form>
      )}
    </>
  );
};

export default EditableVFolderNameV2;
