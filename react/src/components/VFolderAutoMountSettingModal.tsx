/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { VFolderAutoMountSettingModalCreateMutation } from '../__generated__/VFolderAutoMountSettingModalCreateMutation.graphql';
import type { VFolderAutoMountSettingModalFragment$key } from '../__generated__/VFolderAutoMountSettingModalFragment.graphql';
import type { VFolderAutoMountSettingModalUpdateMutation } from '../__generated__/VFolderAutoMountSettingModalUpdateMutation.graphql';
import { App } from '../app-shim';
import { Form, type FormInstance } from '../form-engine';
import BAIFormItem from './BAIFormItem';
import { HStack } from '@lablup/ui-common/Stack';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIModal,
  type BAIModalProps,
  BAISelect,
  BAITextInput,
  useErrorMessageResolver,
  useMutationWithPromise,
} from 'backend.ai-ui';
import { FolderIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type VFolderAutoMountScopeType = 'PROJECT' | 'USER';
type MountPermission = 'READ_ONLY' | 'READ_WRITE' | 'RW_DELETE';

interface FormValues {
  mountDestination: string;
  subpath?: string;
  mountPermission: MountPermission;
}

export interface VFolderAutoMountSettingModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel' | 'title' | 'children'
> {
  scopeType: VFolderAutoMountScopeType;
  /** UUID of the project or the user the auto-mount is set on. */
  scopeId: string;
  /** The auto-mount being edited; create mode when absent. */
  autoMountFrgmt?: VFolderAutoMountSettingModalFragment$key | null;
  vfolder: { id: string; name: string };
  onRequestClose: (success: boolean) => void;
}

const VFolderAutoMountSettingModal: React.FC<
  VFolderAutoMountSettingModalProps
> = ({
  scopeType,
  scopeId,
  autoMountFrgmt,
  vfolder,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const formRef = useRef<FormInstance<FormValues>>(null);
  const [isSaving, setIsSaving] = useState(false);

  const autoMount = useFragment(
    graphql`
      fragment VFolderAutoMountSettingModalFragment on VFolderAutoMount {
        entityId
        mountDestination
        subpath
        mountPermission
      }
    `,
    autoMountFrgmt,
  );
  const isEditMode = !!autoMount;

  const createAutoMount =
    useMutationWithPromise<VFolderAutoMountSettingModalCreateMutation>(graphql`
      mutation VFolderAutoMountSettingModalCreateMutation(
        $input: CreateVFolderAutoMountInput!
      ) {
        createVfolderAutoMount(input: $input) {
          vfolderAutoMount {
            id
            vfolder {
              id
              vfolderAutoMounts(limit: 1) {
                edges {
                  node {
                    scopeType
                    mountDestination
                    subpath
                    mountPermission
                  }
                }
              }
            }
          }
        }
      }
    `);

  // The payload re-reads the fragment so the list row follows from the store.
  const updateAutoMount =
    useMutationWithPromise<VFolderAutoMountSettingModalUpdateMutation>(graphql`
      mutation VFolderAutoMountSettingModalUpdateMutation(
        $input: UpdateVFolderAutoMountInput!
      ) {
        updateVfolderAutoMount(input: $input) {
          vfolderAutoMount {
            id
            ...VFolderAutoMountSettingModalFragment
            vfolder {
              id
              vfolderAutoMounts(limit: 1) {
                edges {
                  node {
                    scopeType
                    mountDestination
                    subpath
                    mountPermission
                  }
                }
              }
            }
          }
        }
      }
    `);

  const handleOk = async () => {
    let values: FormValues;
    try {
      values = (await formRef.current?.validateFields()) as FormValues;
    } catch {
      return;
    }
    const subpath = values.subpath?.trim() || '.';
    setIsSaving(true);
    try {
      if (autoMount) {
        await updateAutoMount({
          input: {
            id: autoMount.entityId,
            mountDestination: values.mountDestination.trim(),
            subpath,
            mountPermission: values.mountPermission,
          },
        });
        message.success(t('autoMount.AutoMountUpdated'));
      } else {
        await createAutoMount({
          input: {
            scope: { scopeType, scopeId },
            vfolderId: vfolder.id,
            mountDestination: values.mountDestination.trim(),
            subpath,
            mountPermission: values.mountPermission,
          },
        });
        message.success(t('autoMount.AutoMountAdded'));
      }
      onRequestClose(true);
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BAIModal
      {...modalProps}
      title={
        isEditMode ? t('autoMount.EditAutoMount') : t('autoMount.AddAutoMount')
      }
      okText={isEditMode ? t('button.Save') : t('button.Add')}
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      confirmLoading={isSaving}
    >
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={{
          mountDestination: autoMount?.mountDestination ?? '',
          subpath: autoMount?.subpath ?? '.',
          mountPermission: (autoMount?.mountPermission ??
            'READ_WRITE') as MountPermission,
        }}
      >
        {/* Plain text, not a read-only input, so the fixed folder does not look editable. */}
        <BAIFormItem label={t('autoMount.Folder')}>
          <HStack gap={2} vAlign="center">
            <FolderIcon size="1em" />
            <Text weight="semibold">{vfolder.name}</Text>
          </HStack>
        </BAIFormItem>
        <BAIFormItem
          name="mountDestination"
          label={t('autoMount.MountDestination')}
          extra={t('autoMount.MountDestinationDesc')}
          rules={[
            {
              required: true,
              whitespace: true,
              message: t('autoMount.PleaseEnterMountDestination'),
            },
          ]}
        >
          <BAITextInput
            aria-label={t('autoMount.MountDestination')}
            placeholder="/home/work/data"
          />
        </BAIFormItem>
        <BAIFormItem
          name="subpath"
          label={t('autoMount.Subpath')}
          extra={t('autoMount.SubpathDesc')}
        >
          <BAITextInput aria-label={t('autoMount.Subpath')} placeholder="." />
        </BAIFormItem>
        <BAIFormItem
          name="mountPermission"
          label={t('autoMount.MountPermission')}
          rules={[{ required: true }]}
        >
          <BAISelect
            showSearch={false}
            aria-label={t('autoMount.MountPermission')}
            options={[
              { value: 'READ_ONLY', label: t('data.ReadOnly') },
              { value: 'READ_WRITE', label: t('data.ReadWrite') },
              { value: 'RW_DELETE', label: t('autoMount.ReadWriteDelete') },
            ]}
          />
        </BAIFormItem>
      </Form>
    </BAIModal>
  );
};

export default VFolderAutoMountSettingModal;
