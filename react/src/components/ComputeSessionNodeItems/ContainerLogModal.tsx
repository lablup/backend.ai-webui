/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ContainerLogModalFragment$key } from '../../__generated__/ContainerLogModalFragment.graphql';
import { downloadBlob } from '../../helper/csv-util';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useTanQuery } from '../../hooks/reactQueryAlias';
import { useMemoWithPrevious } from '../../hooks/useMemoWithPrevious';
import AutoRefreshSwitch from '../AutoRefreshSwitch';
import { ReloadOutlined } from '@ant-design/icons';
import { LazyLog, ScrollFollow } from '@melloware/react-logviewer';
import {
  Button,
  Divider,
  Grid,
  InputNumber,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import { BAIFlex, BAIModal, BAIModalProps, BAISelect } from 'backend.ai-ui';
import _ from 'lodash';
import { DownloadIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { useBAISettingUserState } from 'src/hooks/useBAISetting';

interface ContainerLogModalProps extends BAIModalProps {
  sessionFrgmt: ContainerLogModalFragment$key | null;
  defaultKernelId?: string;
}

const ContainerLogModal: React.FC<ContainerLogModalProps> = ({
  sessionFrgmt,
  defaultKernelId,
  ...modalProps
}) => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const { token } = theme.useToken();

  const [autoRefreshEnabled, setAutoRefreshEnabled] = useBAISettingUserState(
    'container_log_auto_refresh_enabled',
  );
  const [autoRefreshInterval, setAutoRefreshInterval] = useBAISettingUserState(
    'container_log_auto_refresh_interval',
  );
  const autoRefreshIntervalValue = autoRefreshInterval || 5_000;

  const session = useFragment(
    graphql`
      fragment ContainerLogModalFragment on ComputeSessionNode {
        id
        row_id @required(action: NONE)
        name
        status
        access_key
        kernel_nodes {
          edges {
            node {
              id
              row_id
              container_id
              cluster_idx
              cluster_role
              cluster_hostname
            }
          }
        }
      }
    `,
    sessionFrgmt,
  );

  const kernelNodes = session?.kernel_nodes?.edges?.map((e) => e?.node) || [];
  const [selectedKernelId, setSelectedKernelId] = useState(
    defaultKernelId ||
      _.find(kernelNodes, (e) => e?.cluster_role === 'main')?.row_id ||
      kernelNodes[0]?.row_id,
  );

  const {
    data: logs,
    refetch,
    isPending,
    isRefetching,
    dataUpdatedAt,
  } = useTanQuery<string>({
    queryKey: [
      'containerLog',
      session?.row_id,
      session?.access_key,
      selectedKernelId,
      modalProps.open,
    ],
    queryFn: async () => {
      if (
        !modalProps.open ||
        !session?.row_id ||
        !session?.access_key ||
        !selectedKernelId
      ) {
        return '';
      }
      return await baiClient
        .get_logs(session?.row_id, session?.access_key, selectedKernelId, 15000)
        .then((req: any) => req.result.logs);
    },
    staleTime: autoRefreshIntervalValue,
  });

  const [lastLineNumbers, { resetPrevious: resetPreviousLineNumber }] =
    useMemoWithPrevious(() => logs?.split('\n').length || 0, [logs]);

  const { md } = Grid.useBreakpoint();
  const { t } = useTranslation();

  return (
    <BAIModal
      title={
        <BAIFlex style={{ maxWidth: '100%' }} gap={'sm'}>
          <Typography.Title level={4} style={{ margin: 0, flexShrink: 0 }}>
            {t('kernel.ContainerLogs')}
          </Typography.Title>
          {session ? (
            <>
              <Typography.Text style={{ fontWeight: 'normal' }} ellipsis>
                {session?.name}
              </Typography.Text>
              <Typography.Text
                style={{ fontWeight: 'normal', fontFamily: 'monospace' }}
                copyable={{
                  text: session?.row_id,
                  tooltips: t('button.CopySomething', {
                    name: t('session.SessionId'),
                  }),
                }}
              >
                ({md ? session?.row_id : session?.row_id.split('-')?.[0]})
              </Typography.Text>
            </>
          ) : null}
        </BAIFlex>
      }
      width={'100%'}
      styles={{
        header: {
          width: '100%',
        },
        body: {
          height: 'calc(100vh - 100px)',
          maxHeight: 'calc(100vh - 100px)',
        },
      }}
      {...modalProps}
      footer={null}
      destroyOnHidden
    >
      <BAIFlex
        direction="column"
        align="start"
        style={{ height: '100%' }}
        gap={'sm'}
      >
        <BAIFlex gap="sm" wrap="wrap">
          <BAISelect
            value={selectedKernelId}
            onChange={(value) => {
              setSelectedKernelId(value);
              resetPreviousLineNumber();
            }}
            autoSelectOption
            options={_.chain(session?.kernel_nodes?.edges)
              .sortBy((e) => `${e?.node?.cluster_role} ${e?.node?.cluster_idx}`)
              .map((e) => {
                return {
                  label: (
                    <>
                      {e?.node?.cluster_hostname}
                      <Typography.Text
                        style={{
                          fontFamily: 'monospace',
                          fontSize: token.fontSizeSM,
                        }}
                        type="secondary"
                      >
                        ({(e?.node?.row_id || '').substring(0, 5)})
                      </Typography.Text>
                    </>
                  ),
                  value: e?.node?.row_id,
                };
              })
              .value()}
          />
          <Divider type="vertical" />
          <Tooltip title={t('button.Download')}>
            <Button
              size="middle"
              icon={<DownloadIcon />}
              disabled={isPending || isRefetching}
              onClick={() => {
                const blob = new Blob([logs || ''], { type: 'text/plain' });
                downloadBlob(
                  blob,
                  `${session?.name || 'session'}-logs-${selectedKernelId}-${new Date().toISOString()}.txt`,
                );
              }}
            />
          </Tooltip>
          <Tooltip title={t('button.Refresh')}>
            <Button
              size="middle"
              loading={isPending || isRefetching}
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
            />
          </Tooltip>
          <BAIFlex gap="xs" align="center">
            <AutoRefreshSwitch
              checked={autoRefreshEnabled}
              onChange={setAutoRefreshEnabled}
              interval={isRefetching ? null : autoRefreshIntervalValue}
              onRefresh={() => {
                refetch();
              }}
            >
              {t('button.AutoRefresh')}:
            </AutoRefreshSwitch>
            <InputNumber
              min={3}
              value={(autoRefreshIntervalValue ?? 1000) / 1000}
              onChange={(value) => {
                if (typeof value === 'number') {
                  setAutoRefreshInterval(value * 1000);
                }
              }}
              suffix={t('time.Sec')}
              style={{ maxWidth: 150 }}
            />
          </BAIFlex>
        </BAIFlex>

        <div
          style={{
            height: 'calc(100% - 50px)',
            alignSelf: 'stretch',

            border: `1px solid ${token.colorBorder}`,
            overflow: 'hidden',
          }}
        >
          <ScrollFollow
            key={dataUpdatedAt} // to scroll to bottom on new data
            startFollowing={true}
            render={({ follow, onScroll }) => (
              <LazyLog
                caseInsensitive
                enableSearch
                enableSearchNavigation
                selectableLines
                text={logs || ''}
                highlight={lastLineNumbers.previous}
                extraLines={1}
                // url={signed.uri}
                // fetchOptions={
                //   {
                //     headers: signed.headers
                //   }
                // }
                // stream
                follow={follow}
                onScroll={onScroll}
              />
            )}
          />
        </div>
      </BAIFlex>
    </BAIModal>
  );
};

export default ContainerLogModal;
