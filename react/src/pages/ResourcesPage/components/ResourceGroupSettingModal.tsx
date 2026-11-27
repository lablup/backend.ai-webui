/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceGroupSettingModalAssociateDomainMutation } from '../../../__generated__/ResourceGroupSettingModalAssociateDomainMutation.graphql';
import { ResourceGroupSettingModalCreateMutation } from '../../../__generated__/ResourceGroupSettingModalCreateMutation.graphql';
import { ResourceGroupSettingModalFragment$key } from '../../../__generated__/ResourceGroupSettingModalFragment.graphql';
import { ResourceGroupSettingModalUpdateMutation } from '../../../__generated__/ResourceGroupSettingModalUpdateMutation.graphql';
import { App } from '../../../app-shim';
import BAIFormItem from '../../../components/BAIFormItem';
import { Form, FormInstance } from '../../../form-engine';
import { newLineToBrElement } from '../../../helper';
import { getSessionTypeLabel } from '../../../helper/sessionTypeLabel';
import {
  useCurrentDomainValue,
  useSuspendedBackendaiClient,
} from '../../../hooks';
import {
  computeProxyDelta,
  proxiesServingGroups,
  useSFTPProxyResourceGroupsQuery,
  useSFTPResourceGroups,
} from '../../../hooks/useSFTPResourceGroups';
import { ScalingGroupOpts } from './ResourceGroupList';
import { ErrorState } from '@lablup/ui-common';
import { Grid } from '@lablup/ui-common/Grid';
import {
  BAICard,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAIQuestionIconWithTooltip,
  BAISkeleton,
  BAIStorageProxySelect,
  omitNullAndUndefinedFields,
  useBAILogger,
  BAIMultiSelector,
  BAINumberInput,
  BAISelect,
  BAISwitch,
  BAITextArea,
  BAITextInput,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense, useDeferredValue, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

type FormInputType = {
  name: string;
  description: string;
  allowedSessionTypes: string[];
  wsProxyAddress: string;
  active: boolean;
  public: boolean;
  scheduler: string;
  // validateFields() returns null for a cleared field; INITIAL_FORM_VALUES
  // seeds null when the stored value is absent.
  pendingTimeout: number | null;
  retriesToSkip: number | null;
  // Both are undefined until their Form.Items register (behind the SFTP map
  // load and the proxy-options Suspense). The baseline registers with the
  // select, so the save delta starts from the same map the prefill came from.
  sftpProxies: string[] | undefined;
  sftpProxiesBaseline: string[] | undefined;
};

interface ResourceGroupCreateModalProps extends BAIModalProps {
  resourceGroupFrgmt?: ResourceGroupSettingModalFragment$key | null | undefined;
  onRequestClose?: (success: boolean) => void;
}

// The form fields that map into scheduler_opts: on save the form value is set
// at the dotted path, and a cleared field (null) removes it (_.set / _.unset).
const SCHEDULER_OPT_FIELDS = [
  { formKey: 'pendingTimeout', optsKey: 'pending_timeout' },
  { formKey: 'retriesToSkip', optsKey: 'config.num_retries_to_skip' },
] as const;

const ResourceGroupSettingModal: React.FC<ResourceGroupCreateModalProps> = ({
  resourceGroupFrgmt,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const { logger } = useBAILogger();
  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const { applyGroupProxyDelta } = useSFTPResourceGroups();
  const formRef = useRef<FormInstance>(null);

  const resourceGroup = useFragment(
    graphql`
      fragment ResourceGroupSettingModalFragment on ScalingGroup {
        name @required(action: NONE)
        description
        is_active
        is_public
        wsproxy_addr
        scheduler
        scheduler_opts
      }
    `,
    resourceGroupFrgmt,
  );

  // Superadmin-only SFTP proxy membership, read from etcd without suspending
  // (gated on a deferred `open`). The field waits for this mount's first fetch,
  // so the prefill is not a stale cache; later refetches keep it registered.
  const deferredOpen = useDeferredValue(modalProps.open);
  const {
    data: proxyResourceGroups,
    isFetching: isSftpMapFetching,
    isFetchedAfterMount: isSftpMapFetchedAfterMount,
    isError: isSftpMapError,
    refetch: refetchSftpMap,
  } = useSFTPProxyResourceGroupsQuery({
    enabled: baiClient.is_superadmin && !!deferredOpen,
  });
  const currentSftpProxies = proxiesServingGroups(
    proxyResourceGroups,
    resourceGroup?.name ? [resourceGroup.name] : [],
  );
  const hasSftpMap = proxyResourceGroups !== undefined;
  const isSftpMapLoading =
    (!hasSftpMap || !isSftpMapFetchedAfterMount) && isSftpMapFetching;

  // TODO(needs-backend): lablup/backend.ai#16372, lablup/backend.ai#16373 the V2 resource group
  // inputs have no `scheduler_opts`; move create/update to `adminCreateResourceGroupV2` / `updateResourceGroup` then.
  const [commitUpdateResourceGroup, isInFlightCommitUpdateResourceGroup] =
    useMutation<ResourceGroupSettingModalUpdateMutation>(graphql`
      mutation ResourceGroupSettingModalUpdateMutation(
        $name: String!
        $input: ModifyScalingGroupInput!
      ) {
        modify_scaling_group(name: $name, props: $input) {
          ok
          msg
        }
      }
    `);
  const [commitCreateResourceGroup, isInFlightCommitCreateResourceGroup] =
    useMutation<ResourceGroupSettingModalCreateMutation>(graphql`
      mutation ResourceGroupSettingModalCreateMutation(
        $name: String!
        $input: CreateScalingGroupInput!
      ) {
        create_scaling_group(name: $name, props: $input) {
          ok
          msg
        }
      }
    `);
  const [commitAssociateDomain, isInFlightCommitAssociateDomain] =
    useMutation<ResourceGroupSettingModalAssociateDomainMutation>(graphql`
      mutation ResourceGroupSettingModalAssociateDomainMutation(
        $input: UpdateAllowedDomainsForResourceGroupInput!
      ) {
        adminUpdateAllowedDomainsForResourceGroupV2(input: $input) {
          items
        }
      }
    `);

  const schedulerOpts: Partial<ScalingGroupOpts> = JSON.parse(
    resourceGroup?.scheduler_opts || '{}',
  );

  const INITIAL_FORM_VALUES = omitNullAndUndefinedFields({
    name: resourceGroup?.name,
    description: resourceGroup?.description,
    scheduler: resourceGroup?.scheduler ?? 'fifo',
    allowedSessionTypes: schedulerOpts?.allowed_session_types ?? [
      'batch',
      'interactive',
    ],
    active: resourceGroup?.is_active ?? true,
    public: resourceGroup?.is_public ?? true,
    pendingTimeout:
      schedulerOpts?.pending_timeout != null
        ? _.toNumber(schedulerOpts?.pending_timeout)
        : null,
    retriesToSkip:
      schedulerOpts?.config?.num_retries_to_skip != null
        ? _.toNumber(schedulerOpts?.config?.num_retries_to_skip)
        : null,
    wsProxyAddress: resourceGroup?.wsproxy_addr,
  });

  return (
    <BAIModal
      title={
        resourceGroup
          ? t('resourceGroup.ModifyResourceGroup')
          : t('resourceGroup.CreateResourceGroup')
      }
      onCancel={() => {
        onRequestClose?.(false);
      }}
      okText={resourceGroup ? t('button.Save') : t('button.Create')}
      okButtonProps={{
        loading:
          isInFlightCommitCreateResourceGroup ||
          isInFlightCommitAssociateDomain ||
          isInFlightCommitUpdateResourceGroup ||
          // A failed map skips only the proxy sync (with a warning on save).
          (baiClient.is_superadmin && isSftpMapLoading),
      }}
      onOk={() => {
        formRef.current
          ?.validateFields()
          .then((values: FormInputType) => {
            // The manager replaces the whole scheduler_opts value, so merge
            // over the stored one: keys the form does not show survive, and a
            // cleared shown field removes its key.
            const mergedSchedulerOpts: Record<string, unknown> = {
              ...schedulerOpts,
              allowed_session_types: values.allowedSessionTypes,
            };
            for (const { formKey, optsKey } of SCHEDULER_OPT_FIELDS) {
              const value = values[formKey];
              if (value == null) {
                _.unset(mergedSchedulerOpts, optsKey);
              } else {
                _.set(mergedSchedulerOpts, optsKey, value);
              }
            }
            const input = {
              scheduler: values.scheduler,
              description: values.description ?? null,
              scheduler_opts: JSON.stringify(mergedSchedulerOpts),
              is_public: values.public,
              is_active: values.active,
              wsproxy_addr: values.wsProxyAddress,
            };

            // After the group is saved, sync its SFTP proxy membership to the
            // selected proxies (add to newly-selected proxies, remove from
            // deselected ones, preserving other groups on each proxy).
            // Deselection here removes without a separate confirm — unlike the
            // bulk modal — because Update is an explicit, per-group edit.
            // Superadmin-only.
            const applySftpProxies = (groupName: string): Promise<void> => {
              if (!baiClient.is_superadmin) {
                return Promise.resolve();
              }
              // Not loaded must not mean "deselect all" (a deliberate clear is []).
              if (values.sftpProxies === undefined) {
                message.warning(t('storageProxy.SFTPStorageProxiesNotSaved'));
                return Promise.resolve();
              }
              // Create mode diffs against the live map, so a group recreated
              // under an old name drops stale proxy entries — except where it is
              // the proxy's only group: an emptied list deletes the key, which
              // means "all groups".
              const baseline = resourceGroup
                ? (values.sftpProxiesBaseline ?? [])
                : proxiesServingGroups(proxyResourceGroups, [groupName]);
              const delta = computeProxyDelta(baseline, values.sftpProxies);
              const added = delta.added;
              const removed = resourceGroup
                ? delta.removed
                : delta.removed.filter(
                    (proxy) =>
                      _.without(proxyResourceGroups?.[proxy] ?? [], groupName)
                        .length > 0,
                  );
              return applyGroupProxyDelta([groupName], added, removed).then(
                (results) => {
                  const failed = results.filter((r) => r.status === 'rejected');
                  if (failed.length > 0) {
                    failed.forEach((r) => {
                      if (r.status === 'rejected') {
                        logger.error(
                          'Failed to update SFTP storage proxies:',
                          r.reason,
                        );
                      }
                    });
                    message.error(
                      t('storageProxy.FailedToUpdateSFTPResourceGroups'),
                    );
                  }
                },
              );
            };

            if (resourceGroup) {
              commitUpdateResourceGroup({
                variables: {
                  name: resourceGroup.name,
                  input: input,
                },
                onCompleted: ({ modify_scaling_group: res }, errors) => {
                  if (errors && errors.length > 0) {
                    const errorMsgList = _.map(
                      errors,
                      (error) => error.message,
                    );
                    for (const error of errorMsgList) {
                      message.error(error);
                    }
                    return;
                  }
                  if (!res?.ok) {
                    message.error(res?.msg);
                    return;
                  }
                  message.success(t('resourceGroup.ResourceGroupModified'));
                  applySftpProxies(resourceGroup.name).finally(() =>
                    onRequestClose?.(true),
                  );
                },
                onError: (err) => {
                  message.error(getErrorMessage(err));
                },
              });
              return;
            }

            commitCreateResourceGroup({
              variables: {
                name: values.name,
                // `driver` is required by the schema but unused by the manager.
                input: { ...input, driver: 'static' },
              },
              onCompleted: ({ create_scaling_group: res }, errors) => {
                if (errors && errors.length > 0) {
                  const errorMsgList = _.map(errors, (error) => error.message);
                  for (const error of errorMsgList) {
                    message.error(error);
                  }
                  return;
                }

                if (!res?.ok) {
                  message.error(res?.msg);
                  return;
                }

                commitAssociateDomain({
                  variables: {
                    input: {
                      resourceGroupName: values.name,
                      add: [currentDomain],
                    },
                  },
                  onCompleted: (_res, errors) => {
                    if (errors && errors.length > 0) {
                      const errorMsgList = _.map(
                        errors,
                        (error) => error.message,
                      );
                      for (const error of errorMsgList) {
                        message.error(error);
                      }
                      return;
                    }

                    message.success(t('resourceGroup.ResourceGroupCreated'));
                    applySftpProxies(values.name).finally(() =>
                      onRequestClose?.(true),
                    );
                  },
                  onError: (err) => {
                    message.error(getErrorMessage(err));
                  },
                });
              },
              onError: (err) => {
                message.error(getErrorMessage(err));
              },
            });
          })
          .catch(() => {});
      }}
      {...modalProps}
    >
      <Suspense fallback={<BAISkeleton rows={6} />}>
        <Form
          ref={formRef}
          initialValues={INITIAL_FORM_VALUES}
          layout="vertical"
        >
          <BAIFormItem
            label={t('resourceGroup.Name')}
            name="name"
            rules={[
              {
                required: true,
                message: t('general.ValueRequired', {
                  name: t('resourceGroup.Name'),
                }),
              },
            ]}
          >
            <BAITextInput
              aria-label={t('resourceGroup.Name')}
              disabled={!!resourceGroup}
            />
          </BAIFormItem>
          <BAIFormItem
            label={t('resourceGroup.Description')}
            name="description"
          >
            <BAITextArea aria-label={t('resourceGroup.Description')} />
          </BAIFormItem>
          <BAIFormItem
            label={t('resourceGroup.AllowedSessionTypes')}
            name="allowedSessionTypes"
            rules={[
              {
                required: true,
                message: t('general.ValueRequired', {
                  name: t('resourceGroup.AllowedSessionTypes'),
                }),
              },
            ]}
          >
            <BAIMultiSelector
              aria-label={t('resourceGroup.AllowedSessionTypes')}
              options={_.map(
                ['batch', 'interactive', 'inference', 'system'],
                (value) => ({ label: getSessionTypeLabel(t, value), value }),
              )}
            />
          </BAIFormItem>
          <BAIFormItem
            label={t('resourceGroup.AppProxyAddress')}
            name="wsProxyAddress"
            rules={[{ type: 'url', message: t('error.InvalidUrl') }]}
          >
            <BAITextInput
              aria-label={t('resourceGroup.AppProxyAddress')}
              placeholder="http://localhost:10200"
            />
          </BAIFormItem>
          {baiClient.is_superadmin ? (
            !hasSftpMap && isSftpMapError && !isSftpMapFetching ? (
              <BAIFormItem label={t('storageProxy.SFTPStorageProxies')}>
                <ErrorState
                  tone="warning"
                  title={t('storageProxy.FailedToLoadSFTPStorageProxies')}
                  message={t('storageProxy.SFTPStorageProxiesNotSavedDesc')}
                  primaryAction={{
                    label: t('button.Retry'),
                    onClick: () => {
                      refetchSftpMap();
                    },
                  }}
                />
              </BAIFormItem>
            ) : !hasSftpMap || isSftpMapLoading ? (
              <BAIFormItem label={t('storageProxy.SFTPStorageProxies')}>
                <BAISkeleton variant="input" />
              </BAIFormItem>
            ) : (
              // Suspense wraps the Form.Items (not the select, which would break
              // the value binding): BAIStorageProxySelect's options query suspends.
              <Suspense fallback={<BAISkeleton variant="input" />}>
                <BAIFormItem
                  hidden
                  name="sftpProxiesBaseline"
                  initialValue={currentSftpProxies}
                />
                <BAIFormItem
                  label={t('storageProxy.SFTPStorageProxies')}
                  name="sftpProxies"
                  initialValue={currentSftpProxies}
                  tooltip={t('storageProxy.SFTPStorageProxiesDescription')}
                >
                  <BAIStorageProxySelect mode="multiple" allowClear />
                </BAIFormItem>
              </Suspense>
            )
          ) : null}
          {/* antd Row + Col span={12}×2 → Grid columns={2} (MAPPING §3.9 R2:
              fixed equal-width columns, no breakpoint props involved). */}
          <Grid columns={2}>
            <BAIFormItem
              layout="horizontal"
              label={t('resourceGroup.Active')}
              name="active"
            >
              <BAISwitch aria-label={t('resourceGroup.Active')} />
            </BAIFormItem>
            <BAIFormItem
              layout="horizontal"
              label={t('resourceGroup.Public')}
              name="public"
              tooltip={t('resourceGroup.PublicDesc')}
            >
              <BAISwitch aria-label={t('resourceGroup.Public')} />
            </BAIFormItem>
          </Grid>
          <BAIFormItem
            label={t('resourceGroup.Scheduler')}
            name="scheduler"
            rules={[
              {
                required: true,
                message: t('general.ValueRequired', {
                  name: t('resourceGroup.Scheduler'),
                }),
              },
            ]}
          >
            <BAISelect
              showSearch={false}
              aria-label={t('resourceGroup.Scheduler')}
              options={[
                {
                  label: 'FIFO',
                  value: 'fifo',
                },
                {
                  label: 'LIFO',
                  value: 'lifo',
                },
                {
                  label: 'DRF',
                  value: 'drf',
                },
                {
                  label: 'Fair Share',
                  value: 'fair-share',
                },
              ]}
            />
          </BAIFormItem>
          <BAIFormItem label={t('resourceGroup.SchedulerOptions')}>
            <BAICard>
              <BAIFormItem
                label={
                  <BAIFlex gap="xxs">
                    {t('resourceGroup.PendingTimeout')}
                    <BAIQuestionIconWithTooltip
                      title={newLineToBrElement(
                        t('resourceGroup.PendingTimeoutDesc'),
                      )}
                    />
                  </BAIFlex>
                }
                name="pendingTimeout"
              >
                <BAINumberInput
                  width="100%"
                  aria-label={t('resourceGroup.PendingTimeout')}
                  units={t('resourceGroup.TimeoutSeconds')}
                  min={0}
                />
              </BAIFormItem>
              <BAIFormItem
                label={
                  <BAIFlex style={{ whiteSpace: 'pre' }}>
                    {t('resourceGroup.RetriesToSkipDesc')}
                  </BAIFlex>
                }
                name="retriesToSkip"
              >
                <BAINumberInput
                  width="100%"
                  aria-label={t('resourceGroup.RetriesToSkipDesc')}
                  units={t('resourceGroup.RetriesToSkip')}
                  min={0}
                />
              </BAIFormItem>
            </BAICard>
          </BAIFormItem>
        </Form>
      </Suspense>
    </BAIModal>
  );
};

export default ResourceGroupSettingModal;
