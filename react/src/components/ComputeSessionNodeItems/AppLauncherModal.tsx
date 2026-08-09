/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AppLauncherModalFragment$key } from '../../__generated__/AppLauncherModalFragment.graphql';
import { App } from '../../app-shim';
import { Form, FormInstance } from '../../form-engine';
import { useSuspendedBackendaiClient } from '../../hooks';
import {
  ServicePort,
  TemplateItem,
  useSuspendedFilteredAppTemplate,
} from '../../hooks/useAppTemplate';
import {
  TCP_APPS,
  useBackendAIAppLauncher,
} from '../../hooks/useBackendAIAppLauncher';
import {
  AstryxFormNumberInput,
  AstryxFormTagsInput,
} from '../astryx-bui/astryxFormControls';
import AppLaunchConfirmationModal from './AppLaunchConfirmationModal';
import SFTPConnectionInfoModal from './SFTPConnectionInfoModal';
import TCPConnectionInfoModal from './TCPConnectionInfoModal';
import TensorboardPathModal from './TensorboardPathModal';
import VNCConnectionInfoModal from './VNCConnectionInfoModal';
import VSCodeDesktopConnectionModal from './VSCodeDesktopConnectionModal';
import XRDPConnectionInfoModal from './XRDPConnectionInfoModal';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import * as stylex from '@stylexjs/stylex';
// FRONTIER (ticket 17): the Form ENGINE is self-hosted since ticket 34 (live
// again since ticket 35). The CONTROLS inside the items are Astryx now — the
// `astryxFormControls` adapters where a `Form.Item` injects `value`/`onChange`,
// raw Astryx components where it does not.
import {
  BAIFlex,
  BAIModal,
  type BAIModalProps,
  BAIUnmountAfterClose,
  useBAILogger,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

// PILOT-DECISION: antd `ModalProps` -> BUI `BAIModalProps` (§6 — a type-only
// antd import is still an antd import). The render was already `BAIModal`, so
// this only removes the mismatch between the declared and the actual surface.
interface AppLauncherModalProps extends BAIModalProps {
  onRequestClose: () => void;
  sessionFrgmt: AppLauncherModalFragment$key | null;
}

const styles = stylex.create({
  modalTitle: {
    maxWidth: 375,
  },
  // 72px app tile with a 36px logo — off the IconButton size enum, kept as an
  // explicit layout override (antd BAIButton style height/width 72).
  appTile: {
    height: 72,
    width: 72,
  },
});

const AppLauncherModal: React.FC<AppLauncherModalProps> = ({
  onRequestClose,
  sessionFrgmt,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { logger } = useBAILogger();
  const baiClient = useSuspendedBackendaiClient();
  const formRef = useRef<FormInstance>(null);
  const [openToPublic, setOpenToPublic] = useState<boolean>(false);
  const [tryPreferredPort, setTryPreferredPort] = useState<boolean>(false);
  const [forceUseV1Proxy, setForceUseV1Proxy] = useState<boolean>(false);
  const [forceUseV2Proxy, setForceUseV2Proxy] = useState<boolean>(false);
  const [useSubDomain, setUseSubDomain] = useState<boolean>(false);
  const [subDomainValue, setSubDomainValue] = useState<string>('');
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();

  const session = useFragment(
    graphql`
      fragment AppLauncherModalFragment on ComputeSessionNode {
        id
        row_id
        name
        service_ports
        access_key
        ...useBackendAIAppLauncherFragment
        ...SFTPConnectionInfoModalFragment
        ...TensorboardPathModalFragment
        ...AppLaunchConfirmationModalFragment
      }
    `,
    sessionFrgmt,
  );

  const servicePorts: ServicePort[] = JSON.parse(
    session?.service_ports ?? '{}',
  );

  const { preOpenAppTemplate, baseAppTemplate } =
    useSuspendedFilteredAppTemplate(servicePorts);

  const { launchAppWithNotification } = useBackendAIAppLauncher(session, {
    forceUseV1Proxy: forceUseV1Proxy,
    forceUseV2Proxy: forceUseV2Proxy,
    subdomain: subDomainValue ?? undefined,
  });

  const handleAppLaunch = async (app: Partial<TemplateItem> | null) => {
    if (!app?.name) return;

    try {
      const values = await formRef.current?.validateFields().catch(() => {
        return;
      });
      const allowedClientIps = openToPublic ? values?.clientIps : undefined;
      const preferredPort = tryPreferredPort
        ? values?.preferredPort
        : undefined;

      // Handle special apps that require confirmation before launching (nniboard, mlflow-ui)
      // These apps need to run before tunneling, so show confirmation dialog first
      if (['nniboard', 'mlflow-ui'].includes(app?.name ?? '')) {
        setConfirmationModalState({
          open: true,
          appName: app?.name ?? '',
          port: preferredPort,
          openToPublic,
          allowedClientIps,
        });
        return;
      }

      // Tensorboard - show path input modal BEFORE starting proxy
      // This matches legacy behavior where modal is shown first, then proxy starts after path submission
      if (app.name === 'tensorboard') {
        setTensorboardModalState({
          open: true,
          port: preferredPort,
          openToPublic,
          allowedClientIps,
        });
        return;
      }

      // Use new launchApp API for regular apps
      // Errors are handled by the notification system in launchApp
      await launchAppWithNotification({
        app: app?.name ?? '',
        port: preferredPort,
        openToPublic,
        allowedClientIps,
        onPrepared(workerInfo) {
          // SFTP (SSH) connection
          if (app.name === 'sshd') {
            setSftpModalState({
              open: true,
              host: workerInfo.tcpHost || '127.0.0.1',
              port: parseInt(workerInfo.tcpPort || '0', 10),
            });
            return;
          }

          // VNC connection
          if (app.name === 'vnc') {
            setVncModalState({
              open: true,
              host: workerInfo.tcpHost || '127.0.0.1',
              port: parseInt(workerInfo.tcpPort || '0', 10),
            });
            return;
          }

          // XRDP connection
          if (app.name === 'xrdp') {
            setXrdpModalState({
              open: true,
              host: workerInfo.tcpHost || '127.0.0.1',
              port: parseInt(workerInfo.tcpPort || '0', 10),
            });
            return;
          }

          // VS Code Desktop connection
          if (app.name === 'vscode-desktop') {
            setVscodeModalState({
              open: true,
              host: workerInfo.tcpHost || '127.0.0.1',
              port: parseInt(workerInfo.tcpPort || '0', 10),
            });
            return;
          }

          // Tensorboard - This code path should not be reached
          // because tensorboard should be handled before launchAppWithNotification
          if (app.name === 'tensorboard') {
            logger.warn('Tensorboard reached onPrepared callback unexpectedly');
            setTensorboardModalState({
              open: true,
              port: preferredPort,
              openToPublic,
              allowedClientIps,
            });
            return;
          }

          // Generic TCP apps (non-standard protocols)
          // Apps that use TCP protocol but aren't handled by specific modals above
          const servicePort = servicePorts.find(
            (port) => port.name === app.name,
          );
          const isTCP = servicePort?.protocol === 'tcp';

          if (isTCP && !TCP_APPS.includes(app.name ?? '')) {
            setTcpModalState({
              open: true,
              appName: app.name ?? '',
              host: workerInfo.tcpHost || '127.0.0.1',
              port: parseInt(workerInfo.tcpPort || '0', 10),
            });
            return;
          }

          // HTTP apps (most apps) - open in new window
          if (workerInfo.appConnectUrl && !isTCP) {
            setTimeout(() => {
              window.open(workerInfo.appConnectUrl?.href, '_blank');
            }, 1000);
          }
        },
      });
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const [sftpModalState, setSftpModalState] = useState({
    open: false,
    host: '127.0.0.1',
    port: 0,
  });
  const [vncModalState, setVncModalState] = useState({
    open: false,
    host: '127.0.0.1',
    port: 0,
  });
  const [xrdpModalState, setXrdpModalState] = useState({
    open: false,
    host: '127.0.0.1',
    port: 0,
  });
  const [vscodeModalState, setVscodeModalState] = useState({
    open: false,
    host: '127.0.0.1',
    port: 0,
  });
  const [tensorboardModalState, setTensorboardModalState] = useState<{
    open: boolean;
    port?: number;
    openToPublic?: boolean;
    allowedClientIps?: Array<string>;
  }>({
    open: false,
  });
  const [tcpModalState, setTcpModalState] = useState({
    open: false,
    appName: '',
    host: '127.0.0.1',
    port: 0,
  });
  const [confirmationModalState, setConfirmationModalState] = useState<{
    open: boolean;
    appName: string;
    port?: number;
    openToPublic?: boolean;
    allowedClientIps?: Array<string>;
  }>({
    open: false,
    appName: '',
  });

  return (
    <>
      <BAIModal
        data-testid="app-launcher-modal"
        title={
          <Text maxLines={1} xstyle={styles.modalTitle}>
            {`${t('session.appLauncher.App')}: ${session?.name ?? ''}`}
          </Text>
        }
        width={450}
        onCancel={onRequestClose}
        footer={null}
        destroyOnHidden
        {...modalProps}
      >
        <BAIFlex direction="column" gap={'md'} align="stretch">
          {_.map(baseAppTemplate, (apps, category) => {
            return (
              <div key={category}>
                <Heading
                  level={5}
                  data-testid={`category-${category.split('.')[1]}`}
                >
                  {category.split('.')[1]}
                </Heading>
                {/* antd `Row gutter={[24,24]}` + `Col span={6}` (fixed 4-up,
                    R2 — not responsive) -> Astryx Grid columns={4}. */}
                <Grid columns={4} gap={6}>
                  {_.map(apps, (app) => {
                    return (
                      <BAIFlex
                        key={app?.name}
                        data-testid={`app-${app?.name}`}
                        direction="column"
                        gap={'xs'}
                        style={{ height: '100%' }}
                      >
                        <IconButton
                          icon={
                            <img
                              src={app?.src}
                              alt={app?.name}
                              style={{ height: 36, width: 36 }}
                            />
                          }
                          label={app?.title ?? app?.name ?? ''}
                          clickAction={() => handleAppLaunch(app)}
                          xstyle={styles.appTile}
                        />
                        <Text justify="center">{app?.title}</Text>
                      </BAIFlex>
                    );
                  })}
                </Grid>
              </div>
            );
          })}
          {preOpenAppTemplate.length > 0 ? (
            <>
              <Heading level={5}>
                {t('session.launcher.PreOpenPortTitle')}
              </Heading>
              <Grid columns={4} gap={3}>
                {_.map(preOpenAppTemplate, (app) => {
                  return (
                    <BAIFlex
                      key={app?.name}
                      direction="column"
                      gap={'xs'}
                      style={{ height: '100%' }}
                    >
                      <IconButton
                        icon={
                          <img
                            src={app?.src}
                            alt={app?.name}
                            style={{ height: 36, width: 36 }}
                          />
                        }
                        label={app?.title ?? app?.name ?? ''}
                        clickAction={() => handleAppLaunch(app)}
                        xstyle={styles.appTile}
                      />
                      <Text justify="center">
                        {app?.title}
                        {app?.ports?.length > 0 && ` (${app.ports.join(', ')})`}
                      </Text>
                    </BAIFlex>
                  );
                })}
              </Grid>
            </>
          ) : null}
          <Form ref={formRef} layout="vertical" requiredMark={false}>
            {/* @ts-ignore */}
            {!globalThis.isElectron && baiClient._config.openPortToPublic ? (
              <Form.Item
                name={'clientIps'}
                tooltip={<Trans i18nKey="session.OpenToPublicDesc" />}
                label={
                  <BAIFlex gap={'xs'}>
                    <CheckboxInput
                      label={t('session.OpenToPublic')}
                      value={openToPublic}
                      onChange={(checked) => setOpenToPublic(checked)}
                    />
                  </BAIFlex>
                }
              >
                <AstryxFormTagsInput
                  tokenSeparators={[',', ' ']}
                  label={t('session.OpenToPublic')}
                  disabled={!openToPublic}
                  placeholder={t('session.AllowedMultipleClientsIps')}
                />
              </Form.Item>
            ) : null}
            {baiClient._config.allowPreferredPort ? (
              <Form.Item
                name={'preferredPort'}
                label={
                  <BAIFlex gap={'xs'}>
                    <CheckboxInput
                      label={t('session.TryPreferredPort')}
                      value={tryPreferredPort}
                      onChange={(checked) => setTryPreferredPort(checked)}
                    />
                  </BAIFlex>
                }
                rules={[
                  {
                    type: 'number',
                    min: 1025,
                  },
                  {
                    type: 'number',
                    max: 65534,
                  },
                ]}
              >
                <AstryxFormNumberInput
                  label={t('session.TryPreferredPort')}
                  placeholder="10250"
                  disabled={!tryPreferredPort}
                />
              </Form.Item>
            ) : null}
            {/* TODO: add debug value into baiClient._config */}
            {/* @ts-ignore */}
            {globalThis?.backendaiwebui?.debug ? (
              <>
                <Form.Item
                  label={
                    <BAIFlex gap={'xs'}>
                      <CheckboxInput
                        label={t('session.UseSubdomain')}
                        value={useSubDomain}
                        onChange={(checked) => setUseSubDomain(checked)}
                      />
                    </BAIFlex>
                  }
                >
                  {/* Not a bound field (the `Form.Item` has no `name`), so
                      the raw Astryx control is used rather than an adapter.
                      `onChange` takes the VALUE, not the event (P3). */}
                  <TextInput
                    label={t('session.UseSubdomain')}
                    isLabelHidden
                    isDisabled={!useSubDomain}
                    value={subDomainValue}
                    onChange={(next) => setSubDomainValue(next)}
                    width="100%"
                  />
                </Form.Item>
                <Form.Item>
                  <CheckboxInput
                    label={t('session.ForceUseV1Proxy')}
                    value={forceUseV1Proxy}
                    isDisabled={forceUseV2Proxy}
                    onChange={(checked) => setForceUseV1Proxy(checked)}
                  />
                </Form.Item>
                <Form.Item>
                  <CheckboxInput
                    label={t('session.ForceUseV2Proxy')}
                    value={forceUseV2Proxy}
                    isDisabled={forceUseV1Proxy}
                    onChange={(checked) => setForceUseV2Proxy(checked)}
                  />
                </Form.Item>
              </>
            ) : null}
          </Form>
        </BAIFlex>
      </BAIModal>
      {session ? (
        <>
          <BAIUnmountAfterClose>
            <SFTPConnectionInfoModal
              sessionFrgmt={session}
              open={sftpModalState.open}
              host={sftpModalState.host}
              port={sftpModalState.port}
              onCancel={() => {
                setSftpModalState({ open: false, host: '127.0.0.1', port: 0 });
              }}
            />
          </BAIUnmountAfterClose>
          <BAIUnmountAfterClose>
            <VNCConnectionInfoModal
              open={vncModalState.open}
              host={vncModalState.host}
              port={vncModalState.port}
              onCancel={() => {
                setVncModalState({ open: false, host: '127.0.0.1', port: 0 });
              }}
            />
          </BAIUnmountAfterClose>
          <BAIUnmountAfterClose>
            <XRDPConnectionInfoModal
              open={xrdpModalState.open}
              host={xrdpModalState.host}
              port={xrdpModalState.port}
              onCancel={() => {
                setXrdpModalState({ open: false, host: '127.0.0.1', port: 0 });
              }}
            />
          </BAIUnmountAfterClose>
          {session.row_id && (
            <BAIUnmountAfterClose>
              <VSCodeDesktopConnectionModal
                sessionId={session.row_id}
                open={vscodeModalState.open}
                host={vscodeModalState.host}
                port={vscodeModalState.port}
                onCancel={() => {
                  setVscodeModalState({
                    open: false,
                    host: '127.0.0.1',
                    port: 0,
                  });
                }}
              />
            </BAIUnmountAfterClose>
          )}
          <BAIUnmountAfterClose>
            <TensorboardPathModal
              sessionFrgmt={session}
              open={tensorboardModalState.open}
              port={tensorboardModalState.port}
              openToPublic={tensorboardModalState.openToPublic}
              allowedClientIps={tensorboardModalState.allowedClientIps}
              onRequestClose={() => {
                setTensorboardModalState((prev) => ({ ...prev, open: false }));
              }}
              onCancel={() => {
                setTensorboardModalState((prev) => ({ ...prev, open: false }));
              }}
            />
          </BAIUnmountAfterClose>
          <BAIUnmountAfterClose>
            <TCPConnectionInfoModal
              open={tcpModalState.open}
              appName={tcpModalState.appName}
              host={tcpModalState.host}
              port={tcpModalState.port}
              onCancel={() => {
                setTcpModalState({
                  open: false,
                  appName: '',
                  host: '127.0.0.1',
                  port: 0,
                });
              }}
            />
          </BAIUnmountAfterClose>
          <BAIUnmountAfterClose>
            <AppLaunchConfirmationModal
              sessionFrgmt={session}
              open={confirmationModalState.open}
              appName={confirmationModalState.appName}
              port={confirmationModalState.port}
              openToPublic={confirmationModalState.openToPublic}
              allowedClientIps={confirmationModalState.allowedClientIps}
              onRequestClose={() => {
                setConfirmationModalState((prev) => ({ ...prev, open: false }));
              }}
              onCancel={() => {
                setConfirmationModalState((prev) => ({ ...prev, open: false }));
              }}
            />
          </BAIUnmountAfterClose>
        </>
      ) : null}
    </>
  );
};

export default AppLauncherModal;
