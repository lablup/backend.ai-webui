/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ContainerLogModalFragment$key } from '../../__generated__/ContainerLogModalFragment.graphql';
import { downloadBlob } from '../../helper/csv-util';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useTanQuery } from '../../hooks/reactQueryAlias';
import { useMemoWithPrevious } from '../../hooks/useMemoWithPrevious';
import { useBAIBreakpoint } from '../../theme-shim';
import AutoUpdateFetchKeyButton from '../AutoUpdateFetchKeyButton';
import { Divider } from '@astryxdesign/core/Divider';
import { Heading } from '@astryxdesign/core/Heading';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import { LazyLog, ScrollFollow } from '@melloware/react-logviewer';
import { BAIFlex, BAIModal, BAIModalProps, BAISelect } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CheckIcon, CopyIcon, DownloadIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface ContainerLogModalProps extends BAIModalProps {
  sessionFrgmt: ContainerLogModalFragment$key | null;
  defaultKernelId?: string;
}

/**
 * Height cap for the log dialog — the `95vh` the sibling full-height viewers
 * use (`VFolderTextFileEditorModal`, `FolderExplorerModalV2`). Astryx `Dialog`
 * otherwise caps itself at 75vh, well under the body this viewer asks for.
 *
 * The body is measured against that same cap rather than the viewport, so the
 * two cannot cross over on a tall screen. It subtracts only the chrome above
 * it: the dialog's own block padding (a published theme token) and the header
 * row (measured 52px; this modal renders `footer={null}`).
 */
const LOG_MODAL_MAX_HEIGHT = '95vh';
const LOG_MODAL_HEADER_HEIGHT = '52px';
const LOG_BODY_HEIGHT = `calc(${LOG_MODAL_MAX_HEIGHT} - ${LOG_MODAL_HEADER_HEIGHT} - var(--astryx-dialog-padding-block-start) - var(--astryx-dialog-padding-block-end))`;

const ContainerLogModal: React.FC<ContainerLogModalProps> = ({
  sessionFrgmt,
  defaultKernelId,
  ...modalProps
}) => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const [copiedSessionId, setCopiedSessionId] = useState(false);

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
  });

  const [lastLineNumbers, { resetPrevious: resetPreviousLineNumber }] =
    useMemoWithPrevious(() => logs?.split('\n').length || 0, [logs]);

  const { md } = useBAIBreakpoint();
  const { t } = useTranslation();

  return (
    <BAIModal
      title={
        <BAIFlex style={{ maxWidth: '100%' }} gap={'sm'}>
          {/* A modal title: antd's `.ant-modal-title` is 16px, which the
              restored antd type ramp puts on heading-5 (heading-4 is 20px). */}
          <Heading level={5}>{t('kernel.ContainerLogs')}</Heading>
          {session ? (
            <>
              <Text maxLines={1}>{session?.name}</Text>
              <Text type="code">
                ({md ? session?.row_id : session?.row_id.split('-')?.[0]})
              </Text>
              <IconButton
                variant="ghost"
                size="sm"
                icon={
                  copiedSessionId ? (
                    <CheckIcon aria-hidden />
                  ) : (
                    <CopyIcon aria-hidden />
                  )
                }
                label={t('button.CopySomething', {
                  name: t('session.SessionId'),
                })}
                tooltip={t('button.CopySomething', {
                  name: t('session.SessionId'),
                })}
                isDisabled={copiedSessionId}
                onClick={() => {
                  void navigator.clipboard?.writeText(session?.row_id ?? '');
                  setCopiedSessionId(true);
                  setTimeout(() => setCopiedSessionId(false), 1500);
                }}
              />
            </>
          ) : null}
        </BAIFlex>
      }
      width={'100%'}
      maxHeight={LOG_MODAL_MAX_HEIGHT}
      styles={{
        header: {
          width: '100%',
        },
        body: {
          height: LOG_BODY_HEIGHT,
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
            options={_.map(
              _.sortBy(
                session?.kernel_nodes?.edges,
                (e) => `${e?.node?.cluster_role} ${e?.node?.cluster_idx}`,
              ),
              (e) => {
                return {
                  label: (
                    <>
                      {e?.node?.cluster_hostname}
                      <Text type="code" color="secondary" size="sm">
                        ({(e?.node?.row_id || '').substring(0, 5)})
                      </Text>
                    </>
                  ),
                  value: e?.node?.row_id,
                };
              },
            )}
          />
          <Divider orientation="vertical" />
          <IconButton
            icon={<DownloadIcon />}
            label={t('button.Download')}
            tooltip={t('button.Download')}
            isDisabled={isPending || isRefetching}
            onClick={() => {
              const blob = new Blob([logs || ''], { type: 'text/plain' });
              downloadBlob(
                blob,
                `${session?.name || 'session'}-logs-${selectedKernelId}-${new Date().toISOString()}.txt`,
              );
            }}
          />
          <AutoUpdateFetchKeyButton
            settingId="container-log"
            // Logs are the archetypal live-watch surface: the modal is opened
            // precisely to watch new lines arrive, so poll by default until the
            // user picks their own interval (including "Off").
            defaultAutoUpdateDelay={10_000}
            size="middle"
            value=""
            loading={isPending || isRefetching}
            onChange={() => {
              refetch();
            }}
          />
        </BAIFlex>

        <div
          style={{
            height: 'calc(100% - 50px)',
            alignSelf: 'stretch',

            border: `1px solid var(--color-border)`,
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
