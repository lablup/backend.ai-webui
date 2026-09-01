/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  CreateKeypairResourcePolicyInput,
  KeypairResourcePolicyV2SettingModalCreateMutation,
} from '../__generated__/KeypairResourcePolicyV2SettingModalCreateMutation.graphql';
import { KeypairResourcePolicyV2SettingModalFragment$key } from '../__generated__/KeypairResourcePolicyV2SettingModalFragment.graphql';
import {
  KeypairResourcePolicyV2SettingModalModifyMutation,
  UpdateKeypairResourcePolicyInput,
} from '../__generated__/KeypairResourcePolicyV2SettingModalModifyMutation.graphql';
import { App } from '../app-shim';
import { Form, FormInstance } from '../form-engine';
import { convertToBinaryUnit } from '../helper';
import { MAX_CPU_QUOTA, SIGNED_32BIT_MAX_INT } from '../helper/const-vars';
import { v2PermissionToKey } from '../helper/storageHostPermission';
import { useResourceSlots, useResourceSlotsDetails } from '../hooks/backendai';
import BAIFormItem from './BAIFormItem';
import FormItemWithUnlimited from './FormItemWithUnlimited';
import {
  AstryxFormNumberInput,
  AstryxFormSelector,
  AstryxFormTextInput,
} from './astryxFormControls';
import { Card } from '@astryxdesign/core/Card';
import { Grid } from '@astryxdesign/core/Grid';
import { Icon } from '@astryxdesign/core/Icon';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  BAIAllowedHostNamesSelect,
  BAIDynamicUnitInputNumber,
  BAIFlex,
  BAIModal,
  BAIModalProps,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleHelp } from 'lucide-react';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

/**
 * The permission set granted to a storage host the admin newly allows. Same
 * list the V1 modal used; the V2 mutation validates these kebab keys against
 * the V1 `VFolderHostPermission` enum, not the `VFolderHostPermissionV2` names
 * the read side returns.
 */
const DEFAULT_VFOLDER_HOST_PERMISSIONS = [
  'create-vfolder',
  'modify-vfolder',
  'delete-vfolder',
  'mount-in-session',
  'upload-file',
  'download-file',
  'invite-others',
  'set-user-specific-permission',
];

interface KeypairResourcePolicyV2SettingModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  keypairResourcePolicyFrgmt: KeypairResourcePolicyV2SettingModalFragment$key | null;
  onOk: () => void;
  onCancel: () => void;
}

const KeypairResourcePolicyV2SettingModal: React.FC<
  KeypairResourcePolicyV2SettingModalProps
> = ({
  keypairResourcePolicyFrgmt = null,
  onOk,
  onCancel,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance>(null);
  const [resourceSlots] = useResourceSlots();
  const { mergedResourceSlots } = useResourceSlotsDetails();

  const keypairResourcePolicy = useFragment(
    graphql`
      fragment KeypairResourcePolicyV2SettingModalFragment on KeypairResourcePolicyV2 {
        id
        name
        defaultForUnspecified
        totalResourceSlots {
          resourceType
          quantity
          unlimited
        }
        maxSessionLifetime
        maxConcurrentSessions
        maxContainersPerSession
        idleTimeout
        maxPendingSessionCount
        maxConcurrentSftpSessions
        allowedVfolderHosts {
          host
          permissions
        }
      }
    `,
    keypairResourcePolicyFrgmt,
  );

  const [
    commitCreateKeypairResourcePolicy,
    isInFlightCommitCreateKeypairResourcePolicy,
  ] = useMutation<KeypairResourcePolicyV2SettingModalCreateMutation>(graphql`
    mutation KeypairResourcePolicyV2SettingModalCreateMutation(
      $input: CreateKeypairResourcePolicyInput!
    ) {
      adminCreateKeypairResourcePolicyV2(input: $input) {
        keypairResourcePolicy {
          id
        }
      }
    }
  `);

  const [
    commitModifyKeypairResourcePolicy,
    isInFlightCommitModifyKeypairResourcePolicy,
  ] = useMutation<KeypairResourcePolicyV2SettingModalModifyMutation>(graphql`
    mutation KeypairResourcePolicyV2SettingModalModifyMutation(
      $name: String!
      $input: UpdateKeypairResourcePolicyInput!
    ) {
      adminUpdateKeypairResourcePolicyV2(name: $name, input: $input) {
        keypairResourcePolicy {
          id
          name
          createdAt
          defaultForUnspecified
          totalResourceSlots {
            resourceType
            quantity
            unlimited
          }
          maxSessionLifetime
          maxConcurrentSessions
          maxPendingSessionCount
          maxPendingSessionResourceSlots {
            resourceType
            quantity
            unlimited
          }
          maxConcurrentSftpSessions
          maxContainersPerSession
          idleTimeout
          allowedVfolderHosts {
            host
            permissions
          }
        }
      }
    }
  `);

  // An unlimited slot has no numeric limit to prefill, so it is left out and
  // the field renders as "unlimited" (empty).
  const initialTotalResourceSlots: Record<string, string> = {};
  _.forEach(keypairResourcePolicy?.totalResourceSlots, (entry) => {
    if (entry.unlimited || _.isNil(entry.quantity)) return;
    if (_.includes(entry.resourceType, 'mem')) {
      let autoUnitResult = convertToBinaryUnit(
        _.toString(entry.quantity),
        'auto',
        2,
        true,
      );
      if (autoUnitResult?.unit === '' || autoUnitResult?.unit === 'k') {
        autoUnitResult = convertToBinaryUnit(
          _.toString(entry.quantity),
          'm',
          3,
          true,
        );
      }
      initialTotalResourceSlots[entry.resourceType] =
        autoUnitResult?.value || '0g';
    } else {
      initialTotalResourceSlots[entry.resourceType] = _.toString(
        entry.quantity,
      );
    }
  });

  const initialValues = {
    name: keypairResourcePolicy?.name ?? '',
    default_for_unspecified:
      keypairResourcePolicy?.defaultForUnspecified || 'UNLIMITED',
    total_resource_slots: initialTotalResourceSlots,
    max_session_lifetime: keypairResourcePolicy?.maxSessionLifetime ?? 0,
    max_concurrent_sessions: keypairResourcePolicy?.maxConcurrentSessions ?? 0,
    max_containers_per_session:
      keypairResourcePolicy?.maxContainersPerSession ?? 1,
    idle_timeout: keypairResourcePolicy?.idleTimeout ?? 0,
    max_pending_session_count:
      keypairResourcePolicy?.maxPendingSessionCount ?? null,
    max_concurrent_sftp_sessions:
      keypairResourcePolicy?.maxConcurrentSftpSessions ?? 0,
    allowed_vfolder_hosts: _.map(
      keypairResourcePolicy?.allowedVfolderHosts,
      (entry) => entry.host,
    ),
  };

  const handleOk = () => {
    return formRef?.current
      ?.validateFields()
      .then((values) => {
        const totalResourceSlots = _.map(
          _.pickBy(
            values.total_resource_slots,
            (value) => !_.isNil(value) && value !== '',
          ),
          (value, resourceType) => ({
            resourceType,
            quantity: _.includes(resourceType, 'mem')
              ? _.toString(convertToBinaryUnit(value, '', 0)?.numberFixed)
              : _.toString(value),
          }),
        );

        // Keep the permissions an already-allowed host carries; a host the
        // admin just added starts with the full default set.
        const existingPermissionsByHost = _.fromPairs(
          _.map(keypairResourcePolicy?.allowedVfolderHosts, (entry) => [
            entry.host,
            _.map(entry.permissions, v2PermissionToKey),
          ]),
        );
        const allowedVfolderHosts = _.map(
          values.allowed_vfolder_hosts ?? [],
          (host: string) => ({
            host,
            permissions:
              existingPermissionsByHost[host] ??
              DEFAULT_VFOLDER_HOST_PERMISSIONS,
          }),
        );

        const commonInput = {
          defaultForUnspecified: values.default_for_unspecified,
          totalResourceSlots,
          maxSessionLifetime: values.max_session_lifetime ?? 0,
          maxConcurrentSessions: values.max_concurrent_sessions ?? 0,
          maxContainersPerSession: values.max_containers_per_session ?? 1,
          idleTimeout: values.idle_timeout ?? 0,
          maxPendingSessionCount: values.max_pending_session_count ?? null,
          maxConcurrentSftpSessions: values.max_concurrent_sftp_sessions ?? 0,
          allowedVfolderHosts,
        };

        if (keypairResourcePolicy === null) {
          const input: CreateKeypairResourcePolicyInput = {
            name: values.name,
            ...commonInput,
          };
          commitCreateKeypairResourcePolicy({
            variables: { input },
            onCompleted(res, errors) {
              if (!res?.adminCreateKeypairResourcePolicyV2 || errors) {
                message.error(
                  errors?.[0]?.message ||
                    t('resourcePolicy.CannotCreateResourcePolicy'),
                );
                onCancel();
              } else {
                message.success(t('resourcePolicy.ResourcePolicyCreated'));
                onOk();
              }
            },
            onError(error) {
              message.error(
                error?.message ||
                  t('resourcePolicy.CannotCreateResourcePolicy'),
              );
            },
          });
        } else {
          const input: UpdateKeypairResourcePolicyInput = commonInput;
          commitModifyKeypairResourcePolicy({
            variables: { name: values.name, input },
            onCompleted(res, errors) {
              if (!res?.adminUpdateKeypairResourcePolicyV2 || errors) {
                message.error(
                  errors?.[0]?.message ||
                    t('resourcePolicy.CannotUpdateResourcePolicy'),
                );
                onCancel();
              } else {
                message.success(t('resourcePolicy.ResourcePolicyUpdated'));
                onOk();
              }
            },
            onError(error) {
              message.error(
                error?.message ||
                  t('resourcePolicy.CannotUpdateResourcePolicy'),
              );
            },
          });
        }
      })
      .catch(() => {});
  };

  return (
    <BAIModal
      width={800}
      title={
        keypairResourcePolicy === null
          ? t('resourcePolicy.CreateKeypairResourcePolicy')
          : t('resourcePolicy.UpdateKeypairResourcePolicy')
      }
      okText={
        keypairResourcePolicy === null ? t('button.Create') : t('button.Save')
      }
      onOk={handleOk}
      onCancel={() => onCancel()}
      destroyOnHidden
      confirmLoading={
        isInFlightCommitCreateKeypairResourcePolicy ||
        isInFlightCommitModifyKeypairResourcePolicy
      }
      {...baiModalProps}
    >
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={initialValues}
        preserve={false}
      >
        <BAIFormItem
          label={t('resourcePolicy.Name')}
          name="name"
          required
          rules={[
            {
              required: true,
              message: t('data.explorer.ValueRequired'),
            },
            {
              max: 64,
            },
          ]}
        >
          <AstryxFormTextInput
            label={t('resourcePolicy.Name')}
            disabled={!!keypairResourcePolicy}
          />
        </BAIFormItem>
        <BAIFormItem
          label={
            <BAIFlex gap="xxs" align="center">
              {t('resourcePolicy.DefaultForUnspecified')}
              <Tooltip
                content={
                  <>
                    {t('resourcePolicy.DefaultForUnspecifiedTooltipDesc1')}
                    <br />
                    <br />
                    {t('resourcePolicy.DefaultForUnspecifiedTooltipDesc2')}
                  </>
                }
                placement="end"
              >
                <Icon icon={CircleHelp} color="tertiary" size="sm" />
              </Tooltip>
            </BAIFlex>
          }
          name="default_for_unspecified"
        >
          <AstryxFormSelector
            label={t('resourcePolicy.DefaultForUnspecified')}
            options={[
              { label: 'UNLIMITED', value: 'UNLIMITED' },
              { label: 'LIMITED', value: 'LIMITED' },
            ]}
          />
        </BAIFormItem>
        <BAIFormItem label={t('resourcePolicy.ResourcePolicy')}>
          <Card padding={4}>
            <Grid columns={{ minWidth: 220, max: 3 }} gap={6}>
              {_.map(_.keys(resourceSlots), (resourceSlotKey) => (
                <FormItemWithUnlimited
                  key={resourceSlotKey}
                  unlimitedValue={undefined}
                  label={
                    _.get(mergedResourceSlots, resourceSlotKey)?.description ||
                    resourceSlotKey
                  }
                  name={['total_resource_slots', resourceSlotKey]}
                  rules={[
                    {
                      validator(__, value) {
                        if (
                          _.includes(resourceSlotKey, 'mem') &&
                          value &&
                          // @ts-ignore
                          convertToBinaryUnit(value, 'p').number >
                            // @ts-ignore
                            convertToBinaryUnit('300p', 'p').number
                        ) {
                          return Promise.reject(
                            new Error(
                              t('resourcePolicy.MemorySizeExceedsLimit'),
                            ),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  {_.includes(resourceSlotKey, 'mem') ? (
                    <BAIDynamicUnitInputNumber defaultUnit="g" />
                  ) : (
                    <AstryxFormNumberInput
                      label={
                        _.get(mergedResourceSlots, resourceSlotKey)
                          ?.description || resourceSlotKey
                      }
                      min={0}
                      max={MAX_CPU_QUOTA}
                      step={_.includes(resourceSlotKey, '.shares') ? 0.1 : 1}
                      units={
                        _.get(mergedResourceSlots, resourceSlotKey)
                          ?.display_unit
                      }
                    />
                  )}
                </FormItemWithUnlimited>
              ))}
            </Grid>
          </Card>
        </BAIFormItem>
        <BAIFormItem label={t('resourcePolicy.Sessions')}>
          <Card padding={4}>
            <Grid columns={{ minWidth: 220, max: 3 }} gap={6}>
              <FormItemWithUnlimited
                label={t('resourcePolicy.ClusterSize')}
                name="max_containers_per_session"
                disableUnlimited
              >
                <AstryxFormNumberInput
                  label={t('resourcePolicy.ClusterSize')}
                  min={0}
                  max={SIGNED_32BIT_MAX_INT}
                />
              </FormItemWithUnlimited>
              <FormItemWithUnlimited
                name="max_session_lifetime"
                unlimitedValue={0}
                label={t('resourcePolicy.MaxSessionLifetime')}
              >
                <AstryxFormNumberInput
                  label={t('resourcePolicy.MaxSessionLifetime')}
                  min={0}
                  max={SIGNED_32BIT_MAX_INT}
                />
              </FormItemWithUnlimited>
              <FormItemWithUnlimited
                name="max_pending_session_count"
                unlimitedValue={null}
                label={t('resourcePolicy.MaxPendingSessionCount')}
              >
                <AstryxFormNumberInput
                  label={t('resourcePolicy.MaxPendingSessionCount')}
                  min={0}
                  max={SIGNED_32BIT_MAX_INT}
                />
              </FormItemWithUnlimited>
              <FormItemWithUnlimited
                name="max_concurrent_sessions"
                unlimitedValue={0}
                label={t('resourcePolicy.Concurrency')}
              >
                <AstryxFormNumberInput
                  label={t('resourcePolicy.Concurrency')}
                  min={0}
                  max={SIGNED_32BIT_MAX_INT}
                />
              </FormItemWithUnlimited>
              <FormItemWithUnlimited
                name="idle_timeout"
                unlimitedValue={0}
                label={t('resourcePolicy.IdleTimeoutSec')}
              >
                <AstryxFormNumberInput
                  label={t('resourcePolicy.IdleTimeoutSec')}
                  min={0}
                  max={SIGNED_32BIT_MAX_INT}
                />
              </FormItemWithUnlimited>
              <FormItemWithUnlimited
                name="max_concurrent_sftp_sessions"
                unlimitedValue={0}
                label={t('resourcePolicy.MaxConcurrentSFTPSessions')}
              >
                <AstryxFormNumberInput
                  label={t('resourcePolicy.MaxConcurrentSFTPSessions')}
                  min={0}
                  max={SIGNED_32BIT_MAX_INT}
                />
              </FormItemWithUnlimited>
            </Grid>
          </Card>
        </BAIFormItem>
        <BAIFormItem label={t('resourcePolicy.Folders')}>
          <Card padding={4}>
            <BAIFormItem
              label={t('resourcePolicy.AllowedHosts')}
              name="allowed_vfolder_hosts"
            >
              <BAIAllowedHostNamesSelect mode="multiple" />
            </BAIFormItem>
          </Card>
        </BAIFormItem>
      </Form>
    </BAIModal>
  );
};

export default KeypairResourcePolicyV2SettingModal;
