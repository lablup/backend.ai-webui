/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `EditableFileName` on Astryx (to-astryx phase 3, wave 2 / ticket W2-D).

 This is the one production inline-edit surface in the repo — the reason
 wave 1's `BAIText` could DROP antd's `editable` prop outright (decision D1
 recorded that this file "calls antd `Typography.Text` directly and is out of
 scope"). It is in scope now.

 PILOT-DECISION — **`Typography.Text editable` is rebuilt as an explicit
 pencil button.** Astryx has no inline-edit affordance at all, and antd's was
 an `<a class="ant-typography-edit">` injected into the text flow, revealed on
 hover by `EditableFileName.css`. The rebuild keeps exactly that behaviour —
 same hover-reveal, same `triggerType: ['icon']` semantics (the text itself was
 never click-to-edit) — with an Astryx `IconButton`, so the control now has a
 real accessible name and a focus ring. `EditableFileName.css` is re-pointed
 from `.ant-typography-edit` to the button's own class (P6: a selector that
 matches nothing must go). Ticket 35 applied the same rule to its
 `.ant-form-item` margin reset — the form engine is self-hosted now, so the
 item root is `[data-bai-form-item]`.

 PILOT-DECISION — **the `component` prop is dropped.** It let a caller swap
 `Typography.Text` for `Typography.Title`, typed through antd's `GetProps` —
 which has no Astryx analog (MAPPING §6 rule 2) and was the last antd specifier
 here. The component has exactly ONE consumer (`BAIFileExplorer`'s name cell)
 and it never passed `component`, so the polymorphism had no user; removing it
 collapses a two-branch discriminated union into a plain props interface.

 PILOT-DECISION — **the ⏎ hint in the rename field is dropped.** Same call as
 `BAIUncontrolledInput` in this ticket: Astryx `TextInput` has no suffix slot,
 and `InputGroup` would weld a permanent box next to a field that appears for
 two seconds. Enter still submits (the form's `onFinish`), and Escape still
 cancels.
*/
import { App } from '../../../app-shim';
import { Form } from '../../../form-engine';
import { useBAIi18n } from '../../../hooks/useBAIi18n';
import { theme } from '../../../theme-shim';
import BAIFlex from '../../BAIFlex';
import BAILink from '../../BAILink';
import { AstryxFormTextInput } from '../../astryxFormControls';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { FolderInfoContext } from './BAIFileExplorer';
import './EditableFileName.css';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import { useMutation } from '@tanstack/react-query';
import * as _ from 'lodash-es';
import { File, Folder, PencilIcon } from 'lucide-react';
import React, { use, useRef, useState } from 'react';

interface ServerError extends Error {
  title?: string;
  msg?: string;
}

export interface EditableFileNameProps {
  fileInfo: VFolderFile;
  existingFiles: Array<VFolderFile>;
  onEndEdit?: () => void;
  onStartEdit?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const EditableFileName: React.FC<EditableFileNameProps> = ({
  fileInfo,
  existingFiles,
  disabled = false,
  onEndEdit,
  onStartEdit,
  style,
  className,
  onClick,
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const { token } = theme.useToken();
  const { modal, message } = App.useApp();
  const { targetVFolderId, currentPath } = use(FolderInfoContext);
  const [isEditing, setIsEditing] = useState(false);
  const baiClient = useConnectedBAIClient();

  const [optimisticName, setOptimisticName] = useState(fileInfo.name);
  const renameMutation = useMutation({
    mutationFn: ({
      target_path,
      new_name,
      targetFolder,
      is_dir,
    }: {
      target_path: string;
      new_name: string;
      targetFolder: string;
      is_dir: boolean;
    }): Promise<any> => {
      return baiClient.vfolder.rename_file(
        target_path,
        new_name,
        targetFolder,
        is_dir,
      );
    },
  });

  // filter existing file names but exclude the current file name
  const existingFileNames = existingFiles
    .filter((file) => file.name !== fileInfo.name)
    .map((file) => file.name);
  const getFileExtension = (filename: string): string => {
    const match = filename.match(/\.([^.]+)$/);
    return match ? match[1] : '';
  };

  const isPendingRenamingAndRefreshing =
    renameMutation.isPending || optimisticName !== fileInfo.name;

  // focus back to the text component after editing for better UX related to keyboard shortcuts
  const textRef = useRef<HTMLDivElement>(null);
  const focusFallback = () => {
    setTimeout(() => {
      textRef.current?.focus();
    }, 0);
  };

  const displayName = isPendingRenamingAndRefreshing
    ? optimisticName
    : fileInfo.name;
  const isEditable = !disabled && !isPendingRenamingAndRefreshing;

  return (
    <>
      {!isEditing || isPendingRenamingAndRefreshing ? (
        <BAIFlex
          ref={textRef}
          tabIndex={-1}
          gap="xxs"
          align="center"
          className={[
            isEditable ? 'bai-editable-file-name-hover-edit' : '',
            className ?? '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            display: 'inline-flex',
            // after editing, focus this element, remove outline
            outline: 'none',
            ...style,
          }}
          onClick={onClick}
        >
          {fileInfo?.type === 'DIRECTORY' ? (
            <BAILink
              type="hover"
              style={{
                maxWidth: '100%',
                color: isPendingRenamingAndRefreshing
                  ? token.colorTextTertiary
                  : undefined,
              }}
              ellipsis
              title={fileInfo.name}
            >
              <Folder style={{ color: token.colorLink }} size="1em" /> &nbsp;
              {displayName}
            </BAILink>
          ) : (
            <BAIFlex gap="xs" style={{ display: 'inline-flex', minWidth: 0 }}>
              <File size="1em" style={{ flexShrink: 0 }} />
              <Text
                maxLines={1}
                hasTruncateTooltip
                style={{
                  maxWidth: '100%',
                  color: isPendingRenamingAndRefreshing
                    ? token.colorTextTertiary
                    : undefined,
                }}
              >
                {displayName}
              </Text>
            </BAIFlex>
          )}
          {isEditable ? (
            <IconButton
              className="bai-editable-file-name-edit-button"
              variant="ghost"
              size="sm"
              icon={<PencilIcon size="1em" />}
              label={t('comp:FileExplorer.RenameFile')}
              tooltip={t('comp:FileExplorer.RenameFile')}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                onStartEdit?.();
              }}
            />
          ) : null}
        </BAIFlex>
      ) : (
        <Form
          className="bai-editable-file-name-form"
          initialValues={{ newName: fileInfo?.name }}
          onFinish={(values) => {
            setIsEditing(false);
            focusFallback();
            setOptimisticName(values.newName);
            const variables = {
              target_path: _.join([currentPath, fileInfo?.name], '/'),
              new_name: values.newName,
              targetFolder: targetVFolderId,
              is_dir: fileInfo?.type === 'DIRECTORY',
            };

            const executeRename = () => {
              renameMutation.mutate(variables, {
                onSuccess: () => {
                  message.success(t('comp:FileExplorer.RenameSuccess'));
                  onEndEdit?.();
                },
                onError: (err: ServerError) => {
                  message.error(err?.title || err?.msg);
                  setOptimisticName(fileInfo.name);
                },
              });
            };

            if (fileInfo?.type === 'FILE') {
              const originExtension = getFileExtension(fileInfo.name);
              const newExtension = getFileExtension(values.newName);
              if (!newExtension && originExtension) {
                variables.new_name = values.newName + '.' + originExtension;
              }
              if (_.includes(existingFileNames, variables.new_name)) {
                message.error(t('comp:FileExplorer.error.DuplicatedName'));
                setOptimisticName(fileInfo.name);
              } else if (newExtension && newExtension !== originExtension) {
                modal.confirm({
                  title: t('comp:FileExplorer.ChangeFileExtension'),
                  content: t('comp:FileExplorer.ChangeFileExtensionDesc'),
                  onOk: () => {
                    executeRename();
                  },
                });
              } else {
                executeRename();
              }
            } else if (fileInfo?.type === 'DIRECTORY') {
              if (_.includes(existingFileNames, values.newName)) {
                message.error(t('comp:FileExplorer.error.DuplicatedName'));
                setOptimisticName(fileInfo.name);
              } else {
                executeRename();
              }
            }
          }}
          onClick={onClick}
        >
          <Form.Item
            name="newName"
            rules={[
              {
                required: true,
                message: t('comp:FileExplorer.error.FileNameRequired'),
              },
            ]}
          >
            <AstryxFormTextInput
              label={t('comp:FileExplorer.FileName')}
              placeholder={fileInfo?.name || undefined}
              hasAutoFocus
            />
          </Form.Item>
        </Form>
      )}
    </>
  );
};

export default EditableFileName;
