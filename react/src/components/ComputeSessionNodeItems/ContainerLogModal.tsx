import { ContainerLogModalFragment$key } from '../../__generated__/ContainerLogModalFragment.graphql';
import { downloadBlob } from '../../helper/csv-util';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useCurrentUserRole } from '../../hooks/backendai';
import { useTanQuery } from '../../hooks/reactQueryAlias';
import { useMemoWithPrevious } from '../../hooks/useMemoWithPrevious';
import BAIModal, { BAIModalProps } from '../BAIModal';
import BAISelect from '../BAISelect';
import { ReloadOutlined } from '@ant-design/icons';
import { LazyLog, ScrollFollow } from '@melloware/react-logviewer';
import { Button, Divider, Grid, theme, Tooltip, Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import { DownloadIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface ContainerLogModalProps extends BAIModalProps {
  sessionFrgmt: ContainerLogModalFragment$key | null;
  defaultKernelId?: string;
}

const ContainerLogModal: React.FC<ContainerLogModalProps> = ({
  sessionFrgmt,
  defaultKernelId,
  ...modalProps
}) => {
  const baiClient = useSuspendedBackendaiClient();
  const { token } = theme.useToken();
  const userRole = useCurrentUserRole();

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

  useEffect(() => {
    if (modalProps.open === false) {
      setSelectedKernelId(undefined);
    }
  }, [modalProps.open]);

  // Currently we can only fetch full logs
  // const [logSize, setLogSize] = useState<100|'full'>('full');
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
    staleTime: 5000,
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
            Logs
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
      destroyOnClose
    >
      <BAIFlex
        direction="column"
        align="start"
        style={{ height: '100%' }}
        gap={'sm'}
      >
        <BAIFlex gap="sm" wrap="wrap">
          Kernel Role
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
                      {e?.node?.cluster_role}
                      {e?.node?.cluster_role !== 'main'
                        ? e?.node?.cluster_idx
                        : ''}
                      {userRole === 'admin' || userRole === 'superadmin' ? (
                        <Typography.Text
                          style={{
                            fontFamily: 'monospace',
                            fontSize: token.fontSizeSM,
                          }}
                          type="secondary"
                        >
                          ({(e?.node?.row_id || '').substring(0, 5)})
                        </Typography.Text>
                      ) : null}
                    </>
                  ),
                  value: e?.node?.row_id,
                };
              })
              .value()}
          />
          <Divider type="vertical" />
          {/* Request logs
          <Select
            value={logSize}
            options={[
              {
                label: 'last 100 lines',
                value: 100,
              },
              {
                label: 'Full logs',
                value: 'full',
              },
            ]}
            onChange={(value) => { 
              setLogSize(value);
              if(value!=='full'){
                resetPreviousLineNumber();
              }
              refetch();
            }}
          ></Select> */}
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
