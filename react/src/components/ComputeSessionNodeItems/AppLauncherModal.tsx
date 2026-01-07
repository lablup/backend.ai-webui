import { AppLauncherModalFragment$key } from '../../__generated__/AppLauncherModalFragment.graphql';
import { useSuspendedBackendaiClient } from '../../hooks';
import {
  ServicePort,
  TemplateItem,
  useSuspendedFilteredAppTemplate,
} from '../../hooks/useSuspendedFilteredAppTemplate';
import AppLaunchConfirmationModal from './AppLaunchConfirmationModal';
import SFTPConnectionInfoModal from './SFTPConnectionInfoModal';
import TCPConnectionInfoModal from './TCPConnectionInfoModal';
import TensorboardPathModal from './TensorboardPathModal';
import VNCConnectionInfoModal from './VNCConnectionInfoModal';
import VSCodeDesktopConnectionModal from './VSCodeDesktopConnectionModal';
import XRDPConnectionInfoModal from './XRDPConnectionInfoModal';
import {
  Button,
  Checkbox,
  Col,
  Form,
  FormInstance,
  Image,
  Input,
  InputNumber,
  ModalProps,
  Row,
  Typography,
} from 'antd';
import {
  BAIButton,
  BAIFlex,
  BAIModal,
  BAISelect,
  BAIText,
  BAIUnmountAfterClose,
  useBAILogger,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import {
  TCP_APPS,
  useBackendAIAppLauncher,
} from 'src/hooks/useBackendAIAppLauncher';

interface AppLauncherModalProps extends ModalProps {
  onRequestClose: () => void;
  sessionFrgmt: AppLauncherModalFragment$key | null;
}

const AppLauncherModal: React.FC<AppLauncherModalProps> = ({
  onRequestClose,
  sessionFrgmt,
  ...modalProps
}) => {
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

    const values = await formRef.current?.validateFields();

    // Handle special apps that require confirmation before launching (nniboard, mlflow-ui)
    // These apps need to run before tunneling, so show confirmation dialog first
    if (['nniboard', 'mlflow-ui'].includes(app?.name ?? '')) {
      setConfirmationModalState({
        open: true,
        appName: app?.name ?? '',
      });
      return;
    }

    // Tensorboard - show path input modal BEFORE starting proxy
    // This matches legacy behavior where modal is shown first, then proxy starts after path submission
    if (app?.name === 'tensorboard') {
      setOpenTensorboardModal(true);
      return;
    }

    // Use new launchApp API for regular apps
    // Errors are handled by the notification system in launchApp
    await launchAppWithNotification({
      app: app?.name ?? '',
      port: tryPreferredPort ? values?.preferredPort : undefined,
      openToPublic: openToPublic,
      allowedClientIps: openToPublic ? values?.clientIps : undefined,
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
          setOpenTensorboardModal(true);
          return;
        }

        // Generic TCP apps (non-standard protocols)
        // Apps that use TCP protocol but aren't handled by specific modals above
        const servicePort = servicePorts.find((port) => port.name === app.name);
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
  const [openTensorboardModal, setOpenTensorboardModal] = useState(false);
  const [tcpModalState, setTcpModalState] = useState({
    open: false,
    appName: '',
    host: '127.0.0.1',
    port: 0,
  });
  const [confirmationModalState, setConfirmationModalState] = useState({
    open: false,
    appName: '',
  });

  return (
    <>
      <BAIModal
        data-testid="app-launcher-modal"
        title={
          <BAIText
            ellipsis
            title={session?.name ?? ''}
            style={{
              maxWidth: 375,
            }}
          >
            {`${t('session.appLauncher.App')}: ${session?.name ?? ''}`}
          </BAIText>
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
                <Typography.Title
                  level={5}
                  style={{ marginTop: 0 }}
                  data-testid={`category-${category.split('.')[1]}`}
                >
                  {category.split('.')[1]}
                </Typography.Title>
                <Row gutter={[24, 24]}>
                  {_.map(apps, (app) => {
                    return (
                      <Col
                        key={app?.name}
                        data-testid={`app-${app?.name}`}
                        span={6}
                        style={{ alignContent: 'center' }}
                      >
                        <BAIFlex
                          direction="column"
                          gap={'xs'}
                          style={{ height: '100%' }}
                        >
                          <BAIButton
                            icon={
                              <Image
                                src={app?.src}
                                alt={app?.name}
                                preview={false}
                                style={{ height: 36, width: 36 }}
                              />
                            }
                            action={async () => {
                              await handleAppLaunch(app).then(() => {
                                setOpenToPublic(false);
                                setTryPreferredPort(false);
                              });
                            }}
                            style={{ height: 72, width: 72 }}
                          />
                          <Typography.Text style={{ textAlign: 'center' }}>
                            {app?.title}
                          </Typography.Text>
                        </BAIFlex>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            );
          })}
          {preOpenAppTemplate.length > 0 ? (
            <>
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                {t('session.launcher.PreOpenPortTitle')}
              </Typography.Title>
              <Row gutter={[12, 12]}>
                {_.map(preOpenAppTemplate, (app) => {
                  return (
                    <Col
                      key={app?.name}
                      span={6}
                      style={{ alignContent: 'center' }}
                    >
                      <BAIFlex
                        direction="column"
                        gap={'xs'}
                        style={{ height: '100%' }}
                      >
                        <Button
                          icon={
                            <Image
                              src={app?.src}
                              alt={app?.name}
                              preview={false}
                              style={{ height: 36, width: 36 }}
                            />
                          }
                          onClick={() => {
                            handleAppLaunch(app);
                          }}
                          style={{ height: 72, width: 72 }}
                        />
                        <Typography.Text style={{ textAlign: 'center' }}>
                          {app?.title}
                          {app?.ports?.length > 0 &&
                            ` (${app.ports.join(', ')})`}
                        </Typography.Text>
                      </BAIFlex>
                    </Col>
                  );
                })}
              </Row>
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
                    <Checkbox
                      value={openToPublic}
                      onChange={(value) =>
                        setOpenToPublic(value.target.checked)
                      }
                    >
                      {t('session.OpenToPublic')}
                    </Checkbox>
                  </BAIFlex>
                }
              >
                <BAISelect
                  mode="tags"
                  suffixIcon={null}
                  open={false}
                  tokenSeparators={[',', ' ']}
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
                    <Checkbox
                      value={tryPreferredPort}
                      onChange={(value) =>
                        setTryPreferredPort(value.target.checked)
                      }
                    >
                      {t('session.TryPreferredPort')}
                    </Checkbox>
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
                <InputNumber
                  placeholder="10250"
                  disabled={!tryPreferredPort}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            ) : null}
            {/* TODO: add debug value into baiClient._config */}
            {/* @ts-ignore */}
            {globalThis?.backendaiwebui?.debug ? (
              <>
                <Form.Item
                  name="subDomain"
                  label={
                    <BAIFlex gap={'xs'}>
                      <Checkbox
                        value={useSubDomain}
                        onChange={(value) =>
                          setUseSubDomain(value.target.checked)
                        }
                      >
                        {t('session.UseSubdomain')}
                      </Checkbox>
                    </BAIFlex>
                  }
                >
                  <Input
                    disabled={!useSubDomain}
                    value={subDomainValue}
                    onChange={(e) => setSubDomainValue(e.target.value)}
                  />
                </Form.Item>
                <Form.Item name={'forceUseV1Proxy'}>
                  <Checkbox
                    disabled={forceUseV2Proxy}
                    onChange={(value) =>
                      setForceUseV1Proxy(value.target.checked)
                    }
                  >
                    {t('session.ForceUseV1Proxy')}
                  </Checkbox>
                </Form.Item>
                <Form.Item name={'forceUseV2Proxy'}>
                  <Checkbox
                    disabled={forceUseV1Proxy}
                    onChange={(value) =>
                      setForceUseV2Proxy(value.target.checked)
                    }
                  >
                    {t('session.ForceUseV2Proxy')}
                  </Checkbox>
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
              open={openTensorboardModal}
              onRequestClose={() => {
                setOpenTensorboardModal(false);
              }}
              onCancel={() => {
                setOpenTensorboardModal(false);
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
              onRequestClose={() => {
                setConfirmationModalState({
                  open: false,
                  appName: '',
                });
              }}
              onCancel={() => {
                setConfirmationModalState({
                  open: false,
                  appName: '',
                });
              }}
            />
          </BAIUnmountAfterClose>
        </>
      ) : null}
    </>
  );
};

export default AppLauncherModal;
