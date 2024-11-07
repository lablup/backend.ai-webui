import { downloadBlob } from '../../helper/csv-util';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useTanQuery } from '../../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from '../BAIModal';
import Flex from '../Flex';
import { ContainerLogModalFragment$key } from './__generated__/ContainerLogModalFragment.graphql';
import { ReloadOutlined } from '@ant-design/icons';
import { LazyLog, ScrollFollow } from '@melloware/react-logviewer';
import {
  Button,
  Divider,
  Grid,
  Select,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { DownloadIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

interface ContainerLogModalProps extends BAIModalProps {
  sessionFrgmt: ContainerLogModalFragment$key;
}

const ContainerLogModal: React.FC<ContainerLogModalProps> = ({
  sessionFrgmt,
  ...modalProps
}) => {
  const baiClient = useSuspendedBackendaiClient();
  const { token } = theme.useToken();

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
    _.find(kernelNodes, (e) => e?.cluster_role === 'main')?.row_id ||
      kernelNodes[0]?.row_id,
  );

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

  // let queryParams: Array<string> = [];
  // if (session?.access_key != null) {
  //   queryParams.push(`owner_access_key=${session.access_key}`);
  // }
  // if (baiClient.supports('per-kernel-logs') && selectedKernelId !== null) {
  //   queryParams.push(`kernel_id=${selectedKernelId}`);
  // }
  // let queryString = `/session/${session?.row_id}/logs`;
  // if (queryParams.length > 0) {
  //   queryString += `?${queryParams.join('&')}`;
  // }
  // // const url = `${baiClient._endpoint}${queryString}`

  // const signed = baiClient.newSignedRequest('GET', queryString, null);
  // console.log(signed)
  // console.log(signed.uri);

  const previousLastLineNumber = useRef(0);

  useEffect(() => {
    previousLastLineNumber.current = logs?.split('\n').length || 0;
  }, [logs]);

  const { md } = Grid.useBreakpoint();
  const { t } = useTranslation();
  const fixedPreviousLastLineNumber = previousLastLineNumber.current;

  return (
    <BAIModal
      title={
        <Flex style={{ maxWidth: '100%' }} gap={'sm'}>
          <Typography.Title level={4} style={{ margin: 0, flexShrink: 0 }}>
            Logs
          </Typography.Title>
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
        </Flex>
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
    >
      <Flex
        direction="column"
        align="start"
        style={{ height: '100%' }}
        gap={'sm'}
      >
        <Flex gap="sm" wrap="wrap">
          Kernel Role
          <Select
            value={selectedKernelId}
            onChange={(value) => {
              setSelectedKernelId(value);
              previousLastLineNumber.current = 0; // reset previous last line number
            }}
            options={_.chain(session?.kernel_nodes?.edges)
              .map((e) => {
                return {
                  label: e?.node?.cluster_role,
                  value: e?.node?.row_id,
                };
              })
              .sortBy('label')
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
                previousLastLineNumber.current = 0; // reset previous last line number
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
        </Flex>

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
                enableLinks
                caseInsensitive
                enableSearch
                enableSearchNavigation
                selectableLines
                text={logs || ''}
                highlight={fixedPreviousLastLineNumber}
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
      </Flex>
    </BAIModal>
  );
};

export default ContainerLogModal;