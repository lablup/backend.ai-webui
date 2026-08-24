/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { theme } from '../theme-shim';
import { Button } from '@astryxdesign/core/Button';
import { Overlay } from '@astryxdesign/core/Overlay';
import { Spinner } from '@astryxdesign/core/Spinner';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIPopconfirmAstryx,
  BAIModal,
  BAIModalProps,
  BAIFlex,
  BAIText,
} from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SSHKeypairGenerationModalProps extends BAIModalProps {
  onRequestClose: () => void;
  isRefreshModalPending?: boolean;
}

const SSHKeypairGenerationModal: React.FC<SSHKeypairGenerationModalProps> = ({
  onRequestClose,
  isRefreshModalPending,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();

  const { data } = useTanQuery<{
    ssh_public_key: string;
    ssh_private_key: string;
  }>({
    queryKey: ['refreshSSHKeypair', baiModalProps.open],
    queryFn: () => {
      return baiModalProps.open ? baiClient.refreshSSHKeypair() : null;
    },
  });

  return (
    <BAIModal
      title={t('userSettings.SSHKeypairGeneration')}
      closeIcon={false}
      footer={[
        <BAIPopconfirmAstryx
          key="close"
          title={t('button.Confirm')}
          description={t('userSettings.ClearSSHKeypairInput')}
          onConfirm={onRequestClose}
        >
          <Button variant="secondary" label={t('button.Close')} />
        </BAIPopconfirmAstryx>,
      ]}
      {...baiModalProps}
    >
      <Overlay
        isOpen={!!isRefreshModalPending}
        scrim="light"
        content={<Spinner />}
      >
        <Text weight="semibold">{t('userSettings.PublicKey')}</Text>
        <BAIFlex direction="row" align="start" justify="between">
          <pre
            style={{
              width: 430,
              maxHeight: 100,
              overflowY: 'scroll',
              scrollbarWidth: 'none', // Firefox
            }}
          >
            {data?.ssh_public_key}
          </pre>
          {data?.ssh_public_key ? (
            <BAIFlex style={{ marginTop: token.margin }}>
              <BAIText copyable={{ text: data.ssh_public_key }} />
            </BAIFlex>
          ) : null}
        </BAIFlex>
        <Text weight="semibold">{t('userSettings.PrivateKey')}</Text>
        <BAIFlex direction="row" align="start" justify="between">
          <BAIFlex direction="column" align="start" style={{ flex: 1 }}>
            <pre
              style={{
                width: 430,
                maxHeight: 100,
                overflowY: 'scroll',
                scrollbarWidth: 'none', // Firefox
              }}
            >
              {data?.ssh_private_key}
            </pre>
            {/* PILOT-DECISION: antd `Typography.Text type="danger"` has no
                Astryx TextColor equivalent (MAPPING §3.4) — same drop as
                AdminModelCard.tsx: red tint dropped, `type="supporting"`
                keeps the small caption size. */}
            <Text type="supporting" color="primary">
              {t('userSettings.SSHKeypairGenerationWarning')}
            </Text>
          </BAIFlex>
          {data?.ssh_private_key ? (
            <BAIFlex style={{ marginTop: token.margin }}>
              <BAIText copyable={{ text: data.ssh_private_key }} />
            </BAIFlex>
          ) : null}
        </BAIFlex>
      </Overlay>
    </BAIModal>
  );
};

export default SSHKeypairGenerationModal;
