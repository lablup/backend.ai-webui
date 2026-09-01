/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Phase 3 (wave 2 A) — rebuilt on Astryx, following `EditableVFolderNameV2`
 (ticket 16) line for line. This is the V1 (`VirtualFolderNode`) twin of that
 component; the two stay deliberately identical in shape so the eventual
 deletion of V1 is a pure removal.

 antd `Typography.Text/Title editable` is verdict NONE in MAPPING.md §3.4
 (`editable` is one of the "behaviour delivered by antd Typography itself"
 props), so the edit affordance is hand-rolled: display text (Astryx
 `Text`/`Heading`) plus a pencil `IconButton`, switching to the antd form
 ENGINE with an Astryx `TextInput` while editing.

 FRONTIER: the sole JSX consumer, `FolderExplorerHeader`, belongs to another
 partition and still passes the antd-shaped surface
 (`component={Typography.Title}`, `level`, `ellipsis`,
 `editable={{triggerType}}`, `inputProps={{size}}`). Those props are therefore
 ACCEPTED and translated or ignored here rather than removed, so that file
 stays at zero diff and can adopt `variant="title"` on its own schedule.

 PILOT-DECISIONs:
 - The antd `editable` CONFIG object (`triggerType`, `onStart`/`onEnd`/
   `onCancel`) collapses to a boolean + a pencil trigger, exactly as V2 did.
   Clicking the text itself no longer starts editing — the affordance is the
   button. `onStart`/`onEnd`/`onCancel` are covered by the existing
   `onEditStart`/`onEditEnd` props, which the consumer already passes.
 - antd `Input suffix` (the corner-down-left glyph) has no Astryx `TextInput`
   equivalent (§3.6) and is dropped; `size` likewise has no adapter surface.
   Max-length enforcement stays in the validation rules.
 - `component`/`GetProps` polymorphism is replaced by `variant: 'text'|'title'`
   (a `level` prop, or an explicitly passed `component`, both imply `'title'`).
*/
import { EditableVFolderNameFragment$key } from '../__generated__/EditableVFolderNameFragment.graphql';
import { EditableVFolderNameRefetchQuery } from '../__generated__/EditableVFolderNameRefetchQuery.graphql';
import { App } from '../app-shim';
import { Form } from '../form-engine';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { isDeletedCategory } from '../pages/VFolderNodeListPage';
import BAIFormItem from './BAIFormItem';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import { AstryxFormTextInput } from './astryxFormControls';
import { IconButton } from '@astryxdesign/core/IconButton';
import { HStack } from '@astryxdesign/core/Stack';
import { Heading, Text } from '@astryxdesign/core/Text';
import { BAILink, toLocalId, useErrorMessageResolver } from 'backend.ai-ui';
import { PencilIcon } from 'lucide-react';
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
  /** `'title'` renders an Astryx `Heading`; `'text'` a body `Text`. */
  variant?: 'text' | 'title';
  /** antd allowed a config object; only truthiness is read now. */
  editable?: boolean | { triggerType?: Array<string> };
  onEditEnd?: () => void;
  onEditStart?: () => void;
  style?: React.CSSProperties;
  /**
   * Legacy antd surface, kept so the unmigrated consumer compiles unchanged
   * (frontier rule). `component` and `level` only select `variant="title"`;
   * `ellipsis` is always on (Astryx truncates with `maxLines`); `inputProps`
   * carried an antd `Input` `size` that `AstryxFormTextInput` does not expose.
   */
  component?: unknown;
  level?: 1 | 2 | 3 | 4 | 5;
  ellipsis?: boolean;
  inputProps?: unknown;
};

const EditableVFolderName: React.FC<EditableVFolderNameProps> = ({
  vfolderFrgmt,
  editable: editableOfProps,
  style,
  enableLink = true,
  variant,
  component,
  level,
  onEditEnd,
  onEditStart,
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
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const { generateFolderPath } = useFolderExplorerOpener();
  const [isEditing, setIsEditing] = useState(false);

  const isEditingAllowed =
    !!editableOfProps &&
    (userInfo.uuid === vfolder.user || currentProject?.id === vfolder.group) &&
    !isDeletedCategory(vfolder.status);

  const isPendingRenameMutation =
    renameMutation.isPending || optimisticName !== vfolder.name;

  const displayedName = isPendingRenameMutation ? optimisticName : vfolder.name;
  const isTitle = variant === 'title' || !!level || !!component;

  const nameNode = isTitle ? (
    <Heading level={level ?? 3} maxLines={1}>
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
            // The router link stays BUI's `BAILink` (react-router `to`), which
            // is what the V1 component already used; Astryx's `Link as=` slot
            // is href-first and cannot take a react-router `To` object.
            <BAILink type="hover" to={generateFolderPath(toLocalId(vfolder?.id))}>
              {nameNode}
            </BAILink>
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

export default EditableVFolderName;
