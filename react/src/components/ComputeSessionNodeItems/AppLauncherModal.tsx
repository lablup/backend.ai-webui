import { AppLauncherModalFragment$key } from '../../__generated__/AppLauncherModalFragment.graphql';
import { AppLauncherModalLegacyFragment$key } from '../../__generated__/AppLauncherModalLegacyFragment.graphql';
import { useSuspendedBackendaiClient } from '../../hooks';
import {
  ServicePort,
  TemplateItem,
  useSuspendedFilteredAppTemplate,
} from '../../hooks/useSuspendedFilteredAppTemplate';
import BAIModal from '../BAIModal';
import Flex from '../Flex';
import { QuestionCircleOutlined } from '@ant-design/icons';
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
  Tooltip,
  Typography,
} from 'antd';
import _ from 'lodash';
import { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface AppLauncherModalProps extends ModalProps {
  onRequestClose: () => void;
  sessionFrgmt: AppLauncherModalFragment$key | null;
  legacySessionFrgmt?: AppLauncherModalLegacyFragment$key | null;
}

const AppLauncherModal: React.FC<AppLauncherModalProps> = ({
  onRequestClose,
  sessionFrgmt,
  legacySessionFrgmt,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const formRef = useRef<FormInstance>(null);
  const [openToPublic, setOpenToPublic] = useState<boolean>(false);
  const [tryPreferredPort, setTryPreferredPort] = useState<boolean>(false);
  const [forceUseV1Proxy, setForceUseV1Proxy] = useState<boolean>(false);
  const [forceUseV2Proxy, setForceUseV2Proxy] = useState<boolean>(false);
  const [useSubDomain, setUseSubDomain] = useState<boolean>(false);

  const session = useFragment(
    graphql`
      fragment AppLauncherModalFragment on ComputeSessionNode {
        id
        row_id
        service_ports
        access_key
      }
    `,
    sessionFrgmt,
  );

  const legacySession = useFragment(
    graphql`
      fragment AppLauncherModalLegacyFragment on ComputeSession {
        id
        session_id
        service_ports
        access_key
      }
    `,
    legacySessionFrgmt,
  );

  const servicePorts: ServicePort[] = JSON.parse(
    session?.service_ports ?? legacySession?.service_ports ?? '{}',
  );

  const { preOpenAppTemplate, baseAppTemplate } =
    useSuspendedFilteredAppTemplate(servicePorts);

  // TODO: This should be merged into `useBackendAIAppLauncher` hook
  const handleAppLaunch = async (app: Partial<TemplateItem> | null) => {
    if (!app?.name) return;

    await formRef.current?.validateFields().then((values) => {
      if (openToPublic) {
        // @ts-ignore
        globalThis.appLauncher.clientIps = values.clientIps;
      }
      if (tryPreferredPort) {
        // @ts-ignore
        globalThis.appLauncher.userPort = values.preferredPort ?? 10250;
      }
      if (useSubDomain) {
        // @ts-ignore
        globalThis.appLauncher.subDomain = values.subDomain;
      }
      if (forceUseV1Proxy) {
        // @ts-ignore
        globalThis.appLauncher.forceUseV1Proxy = true;
      }
      if (forceUseV2Proxy) {
        // @ts-ignore
        globalThis.appLauncher.forceUseV2Proxy = true;
      }
    });

    const appController = {
      'app-name': app?.name ?? '',
      'session-uuid': session?.row_id ?? '',
      'url-postfix': app?.redirect ?? '',
    };

    if (['nniboard', 'mlflow-ui'].includes(app?.name ?? '')) {
      // @ts-ignore
      globalThis.appLauncher._openAppLaunchConfirmationDialog(appController);
      return;
    }
    if (app?.name === 'tensorboard') {
      // @ts-ignore
      globalThis.appLauncher._openTensorboardDialog();
      onRequestClose();
      return;
    }
    // @ts-ignore
    globalThis.appLauncher._runApp(appController).then(() => {});
    setOpenToPublic(false);
    setTryPreferredPort(false);
    onRequestClose();
  };

  return (
    <BAIModal
      title={t('session.appLauncher.App')}
      width={450}
      onCancel={onRequestClose}
      footer={null}
      destroyOnClose
      {...modalProps}
    >
      <Flex direction="column" gap={'md'} align="stretch">
        {_.map(baseAppTemplate, (apps, category) => {
          return (
            <div key={category}>
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                {category.split('.')[1]}
              </Typography.Title>
              <Row gutter={[24, 24]}>
                {_.map(apps, (app) => {
                  return (
                    <Col
                      key={app?.name}
                      span={6}
                      style={{ alignContent: 'center' }}
                    >
                      <Flex
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
                        </Typography.Text>
                      </Flex>
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
                    <Flex
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
                      </Typography.Text>
                    </Flex>
                  </Col>
                );
              })}
            </Row>
          </>
        ) : null}
        <Form ref={formRef} layout="vertical">
          <Row gutter={16}>
            {/* @ts-ignore */}
            {!globalThis.isElectron && baiClient._config.openPortToPublic ? (
              <Col span={12}>
                <Form.Item
                  name={'clientIps'}
                  label={
                    <Flex gap={'xs'}>
                      <Checkbox
                        value={openToPublic}
                        onChange={(value) =>
                          setOpenToPublic(value.target.checked)
                        }
                      />
                      {t('session.OpenToPublic')}
                      <Tooltip
                        title={<Trans i18nKey="session.OpenToPublicDesc" />}
                      >
                        <QuestionCircleOutlined style={{ cursor: 'pointer' }} />
                      </Tooltip>
                    </Flex>
                  }
                >
                  <Input
                    disabled={!openToPublic}
                    placeholder={t('session.AllowedClientIps')}
                  />
                </Form.Item>
              </Col>
            ) : null}
            {baiClient._config.allowPreferredPort ? (
              <Col span={12}>
                <Form.Item
                  name={'preferredPort'}
                  label={
                    <Flex gap={'xs'}>
                      <Checkbox
                        value={tryPreferredPort}
                        onChange={(value) =>
                          setTryPreferredPort(value.target.checked)
                        }
                      />
                      {t('session.TryPreferredPort')}
                    </Flex>
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
              </Col>
            ) : null}
            {/* TODO: add debug value into baiClient._config */}
            {/* @ts-ignore */}
            {globalThis?.backendaiwebui?.debug ? (
              <>
                <Col span={12}>
                  <Form.Item
                    name="subDomain"
                    label={
                      <Flex gap={'xs'}>
                        <Checkbox
                          value={useSubDomain}
                          onChange={(value) =>
                            setUseSubDomain(value.target.checked)
                          }
                        />
                        {t('session.UseSubdomain')}
                      </Flex>
                    }
                  >
                    <Input disabled={!useSubDomain} />
                  </Form.Item>
                </Col>
                <Col></Col>
                <Col span={12}>
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
                </Col>
                <Col span={12}>
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
                </Col>
              </>
            ) : null}
          </Row>
        </Form>
      </Flex>
    </BAIModal>
  );
};

export default AppLauncherModal;
