/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  proxiesServingGroups,
  useSFTPProxyResourceGroupsQuery,
  useSFTPResourceGroups,
} from '../hooks/useSFTPResourceGroups';
import { App, Form, Skeleton, Typography } from 'antd';
import {
  BAIFlex,
  BAIListAlert,
  BAIModal,
  BAIModalProps,
  BAIStorageProxySelect,
  useBAILogger,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense, useDeferredValue, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

interface UpdateResourceGroupsModalProps extends BAIModalProps {
  /** Resource group names pre-selected on the caller's list. */
  resourceGroupNames: string[];
  onRequestClose: (success: boolean) => void;
}

const UpdateResourceGroupsModal: React.FC<UpdateResourceGroupsModalProps> = ({
  resourceGroupNames,
  onRequestClose,
  open,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const { logger } = useBAILogger();
  const [form] = Form.useForm();
  const { applyGroupProxyDelta } = useSFTPResourceGroups();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read the proxy -> resource-groups map without suspending: gate it on a
  // deferred `open` so enabling the query runs in a transition, and surface the
  // fetch through the modal's own loading skeleton (below) instead of a Suspense
  // fallback. The modal body — and thus the form's `initialValues` — only mounts
  // once the map resolves, so the prefill is always computed from real data.
  const deferredOpen = useDeferredValue(open);
  const { data: proxyResourceGroups, isFetching } =
    useSFTPProxyResourceGroupsQuery({ enabled: !!deferredOpen });

  // Proxies currently serving any of the selected groups: the field prefill and
  // the baseline for the submit delta.
  const currentProxies = proxiesServingGroups(
    proxyResourceGroups,
    resourceGroupNames,
  );

  const applyDelta = async (added: string[], removed: string[]) => {
    setIsSubmitting(true);
    const results = await applyGroupProxyDelta(
      resourceGroupNames,
      added,
      removed,
    );
    setIsSubmitting(false);

    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length > 0) {
      failed.forEach((r) => {
        if (r.status === 'rejected') {
          logger.error('Failed to update SFTP resource groups:', r.reason);
        }
      });
      if (failed.length === results.length) {
        message.error(t('storageProxy.FailedToUpdateSFTPResourceGroups'));
        return;
      }
    }
    message.success(t('storageProxy.SFTPResourceGroupsUpdated'));
    onRequestClose(true);
  };

  const handleOk = () => {
    return form
      .validateFields()
      .then((values) => {
        const target: string[] = values.proxies ?? [];
        // Bulk intent: every selected group must end up on every chosen proxy.
        // `currentProxies` is a union (a proxy shows as selected when it serves
        // ANY one of the groups), so it can't drive the delta — a proxy that
        // already serves one selected group would be skipped, leaving the other
        // groups unassigned. Compute additions from the full per-proxy map: a
        // chosen proxy needs a write if it is missing at least one selected
        // group. Removals stay union-based: proxies deselected here drop the
        // selected groups.
        const added = target.filter(
          (proxy) =>
            _.difference(resourceGroupNames, proxyResourceGroups?.[proxy] ?? [])
              .length > 0,
        );
        const removed = _.difference(currentProxies, target);

        if (added.length === 0 && removed.length === 0) {
          onRequestClose(true);
          return;
        }
        // Deselecting a proxy removes the selected groups from it, a
        // destructive change, so confirm first; pure additions apply directly.
        if (removed.length > 0) {
          modal.confirm({
            title: t('storageProxy.ConfirmRemoveSFTPProxiesTitle'),
            content: (
              <Trans
                i18nKey="storageProxy.ConfirmRemoveSFTPProxiesContent"
                values={{ proxies: removed.join(', ') }}
                components={{ code: <Typography.Text code /> }}
              />
            ),
            okText: t('button.Remove'),
            okButtonProps: { danger: true },
            cancelText: t('button.Cancel'),
            onOk: () => applyDelta(added, removed),
          });
          return;
        }
        return applyDelta(added, removed);
      })
      .catch((error) => {
        setIsSubmitting(false);
        logger.error('SFTP resource group form validation failed:', error);
      });
  };

  return (
    <BAIModal
      open={open}
      title={t('resourceGroup.UpdateResourceGroups')}
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      confirmLoading={isSubmitting}
      loading={proxyResourceGroups === undefined || isFetching}
      destroyOnHidden
      {...baiModalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <BAIListAlert
          type="info"
          showIcon
          ghostInfoBg={false}
          title={t('storageProxy.FollowingResourceGroupsWillBeConfigured')}
          items={_.map(resourceGroupNames, (name) => ({
            key: name,
            content: name,
          }))}
        />
        <Form
          form={form}
          layout="vertical"
          preserve={false}
          requiredMark="optional"
          initialValues={{ proxies: currentProxies }}
        >
          {/* The proxy options come from a Relay query that suspends, so wrap
              the whole Form.Item (not the select — that would break Form's
              value/onChange binding) in its own Suspense boundary. */}
          <Suspense fallback={<Skeleton.Input active block />}>
            <Form.Item
              name="proxies"
              label={t('storageProxy.SFTPStorageProxies')}
              tooltip={t('storageProxy.SFTPStorageProxiesDescription')}
            >
              <BAIStorageProxySelect mode="multiple" allowClear />
            </Form.Item>
          </Suspense>
        </Form>
      </BAIFlex>
    </BAIModal>
  );
};

export default UpdateResourceGroupsModal;
