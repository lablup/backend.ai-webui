/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  EntityShareCreateModalMutation,
  PermissionBit,
} from '../../__generated__/EntityShareCreateModalMutation.graphql';
import type { EntityShareCreateModalQuery } from '../../__generated__/EntityShareCreateModalQuery.graphql';
import { App } from '../../app-shim';
import { Form } from '../../form-engine';
import BAIFormItem from '../BAIFormItem';
import {
  AstryxFormMultiSelector,
  AstryxFormSegmented,
  AstryxFormSelector,
  AstryxFormTextInput,
} from '../astryxFormControls';
import { ENTITY_SHARE_PERMISSIONS } from './EntityShareNodes';
import {
  BAIModal,
  type BAIModalProps,
  BAISkeleton,
  useBAILogger,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validates the trimmed value, since that is what `handleOk` submits.
const trimmedPatternRule = (pattern: RegExp, message: string) => ({
  validator: (__: unknown, value?: string) =>
    !value?.trim() || pattern.test(value.trim())
      ? Promise.resolve()
      : Promise.reject(new Error(message)),
});

type RecipientKind = 'email' | 'userId' | 'projectId';

interface EntityShareCreateFormValues {
  targetEntityType: string;
  targetEntityId: string;
  recipientKind: RecipientKind;
  recipient: string;
  permissions?: Array<PermissionBit>;
}

export interface EntityShareCreateModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  /** Fixes the entity being shared; when omitted the user names it. */
  target?: { entityType: string; entityId: string } | null;
  onRequestClose: (success?: boolean) => void;
}

const EntityTypeFormItem: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { entityTypes } = useLazyLoadQuery<EntityShareCreateModalQuery>(
    graphql`
      query EntityShareCreateModalQuery {
        entityTypes {
          id
          name
        }
      }
    `,
    {},
    { fetchPolicy: 'store-or-network' },
  );
  return (
    <BAIFormItem
      name="targetEntityType"
      label={t('entityShare.EntityType')}
      rules={[{ required: true }]}
    >
      <AstryxFormSelector
        label={t('entityShare.EntityType')}
        hasSearch
        options={_.map(entityTypes, (entityType) => ({
          value: entityType.name,
          label: entityType.name,
        }))}
      />
    </BAIFormItem>
  );
};

/**
 * Offers one entity to one project, person, or address. Entity-type agnostic:
 * an entity screen passes `target`; without it the type comes from the
 * manager's `entityTypes` and the id is typed in.
 */
const EntityShareCreateModal: React.FC<EntityShareCreateModalProps> = ({
  target,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { logger } = useBAILogger();
  const { message } = App.useApp();
  const [form] = Form.useForm<EntityShareCreateFormValues>();

  const [commitCreate, isInFlightCreate] =
    useMutation<EntityShareCreateModalMutation>(graphql`
      mutation EntityShareCreateModalMutation($input: CreateEntityShareInput!) {
        createEntityShare(input: $input) {
          share {
            id
            ...EntityShareNodesFragment
          }
        }
      }
    `);

  const recipientKind: RecipientKind =
    Form.useWatch('recipientKind', form) ?? 'email';

  const handleOk = () =>
    form
      .validateFields()
      .then((values) => {
        const recipient = values.recipient.trim();
        commitCreate({
          variables: {
            input: {
              targetEntityType: target?.entityType ?? values.targetEntityType,
              targetEntityId: target?.entityId ?? values.targetEntityId.trim(),
              recipient: { [values.recipientKind]: recipient },
              permissions: values.permissions ?? [],
            },
          },
          onCompleted: (__, errors) => {
            if (errors && errors.length > 0) {
              message.error(errors[0]?.message ?? t('dialog.ErrorOccurred'));
              return;
            }
            message.success(t('entityShare.CreateSucceeded'));
            onRequestClose(true);
          },
          onError: (error) => {
            logger.error(error);
            message.error(error?.message ?? t('dialog.ErrorOccurred'));
          },
        });
      })
      .catch(() => {});

  return (
    <BAIModal
      title={t('entityShare.ShareEntity')}
      okText={t('button.Share')}
      onOk={handleOk}
      onCancel={() => onRequestClose()}
      confirmLoading={isInFlightCreate}
      {...modalProps}
    >
      <Form<EntityShareCreateFormValues>
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={{ recipientKind: 'email', permissions: ['READ'] }}
      >
        {target ? null : (
          <>
            <Suspense fallback={<BAISkeleton />}>
              <EntityTypeFormItem />
            </Suspense>
            <BAIFormItem
              name="targetEntityId"
              label={t('entityShare.EntityId')}
              rules={[
                { required: true },
                trimmedPatternRule(UUID_PATTERN, t('entityShare.InvalidId')),
              ]}
            >
              <AstryxFormTextInput label={t('entityShare.EntityId')} />
            </BAIFormItem>
          </>
        )}
        <BAIFormItem
          name="recipientKind"
          label={t('entityShare.ShareWith')}
          required
        >
          <AstryxFormSegmented
            label={t('entityShare.ShareWith')}
            options={[
              { value: 'email', label: t('entityShare.recipientKind.Email') },
              { value: 'userId', label: t('entityShare.recipientKind.User') },
              {
                value: 'projectId',
                label: t('entityShare.recipientKind.Project'),
              },
            ]}
          />
        </BAIFormItem>
        <BAIFormItem
          name="recipient"
          label={
            recipientKind === 'email'
              ? t('entityShare.RecipientEmail')
              : recipientKind === 'userId'
                ? t('entityShare.RecipientUserId')
                : t('entityShare.RecipientProjectId')
          }
          dependencies={['recipientKind']}
          rules={[
            { required: true },
            recipientKind === 'email'
              ? trimmedPatternRule(EMAIL_PATTERN, t('entityShare.InvalidEmail'))
              : trimmedPatternRule(UUID_PATTERN, t('entityShare.InvalidId')),
          ]}
        >
          <AstryxFormTextInput
            label={t('entityShare.Recipient')}
            type={recipientKind === 'email' ? 'email' : 'text'}
          />
        </BAIFormItem>
        <BAIFormItem
          name="permissions"
          label={t('entityShare.Permissions')}
          extra={t('entityShare.PermissionsHelp')}
        >
          <AstryxFormMultiSelector
            label={t('entityShare.Permissions')}
            options={_.map(ENTITY_SHARE_PERMISSIONS, (permission) => ({
              value: permission,
              label: t(`entityShare.permission.${permission}`),
            }))}
          />
        </BAIFormItem>
      </Form>
    </BAIModal>
  );
};

export default EntityShareCreateModal;
