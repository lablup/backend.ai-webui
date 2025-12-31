import { AppLauncherModalFragment$key } from '../../__generated__/AppLauncherModalFragment.graphql';
import { useSuspendedBackendaiClient } from '../../hooks';
import {
  ServicePort,
  TemplateItem,
  useSuspendedFilteredAppTemplate,
} from '../../hooks/useSuspendedFilteredAppTemplate';
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
  BAILink,
  BAIModal,
  BAISelect,
  BAIText,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { useNavigate } from 'react-router-dom';
import { useSetBAINotification } from 'src/hooks/useBAINotification';

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
  const baiClient = useSuspendedBackendaiClient();
  const formRef = useRef<FormInstance>(null);
  const [openToPublic, setOpenToPublic] = useState<boolean>(false);
  const [tryPreferredPort, setTryPreferredPort] = useState<boolean>(false);
  const [forceUseV1Proxy, setForceUseV1Proxy] = useState<boolean>(false);
  const [forceUseV2Proxy, setForceUseV2Proxy] = useState<boolean>(false);
  const [useSubDomain, setUseSubDomain] = useState<boolean>(false);

  const { upsertNotification } = useSetBAINotification();
  const navigate = useNavigate();

  const session = useFragment(
    graphql`
      fragment AppLauncherModalFragment on ComputeSessionNode {
        id
        row_id
        name
        service_ports
        access_key
      }
    `,
    sessionFrgmt,
  );

  const servicePorts: ServicePort[] = JSON.parse(
    session?.service_ports ?? '{}',
  );

  const { preOpenAppTemplate, baseAppTemplate } =
    useSuspendedFilteredAppTemplate(servicePorts);

  // TODO: This should be merged into `useBackendAIAppLauncher` hook
  const handleAppLaunch = async (app: Partial<TemplateItem> | null) => {
    if (!app?.name) return;

    await formRef.current?.validateFields().then((values) => {
      if (openToPublic) {
        // @ts-ignore
        globalThis.appLauncher.openToPublic = true;
        // @ts-ignore
        globalThis.appLauncher.clientIps = values.clientIps?.join(',') || '';
      }
      if (tryPreferredPort) {
        // @ts-ignore
        globalThis.appLauncher.preferredPort = values.preferredPort ?? 10250;
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

    // set notification for lit-element component
    upsertNotification({
      key: `session-app-${session?.row_id}`,
      message: (
        <span>
          {t('general.Session')}:&nbsp;
          <BAILink
            style={{
              fontWeight: 'normal',
            }}
            onClick={() => {
              const newSearchParams = new URLSearchParams(location.search);
              newSearchParams.set('sessionDetail', session?.row_id || '');
              navigate({
                pathname: `/session`,
                search: newSearchParams.toString(),
              });
            }}
          >
            {session?.name}
          </BAILink>
        </span>
      ),
      description: t('session.appLauncher.LaunchingApp', {
        appName: app?.title || '',
      }),
    });

    const appController = {
      'app-name': app?.name ?? '',
      'session-uuid': session?.row_id ?? '',
      'session-name': session?.name ?? '',
      'url-postfix': app?.redirect ?? '',
    };

    if (['nniboard', 'mlflow-ui'].includes(app?.name ?? '')) {
      // @ts-ignore
      // eslint-disable-next-line react-hooks/immutability
      globalThis.appLauncher.appController['app-name'] = app?.name ?? '';
      // @ts-ignore
      // eslint-disable-next-line react-hooks/immutability
      globalThis.appLauncher.appController['session-uuid'] =
        session?.row_id ?? '';
      // @ts-ignore
      // eslint-disable-next-line react-hooks/immutability
      globalThis.appLauncher.appController['url-postfix'] = app?.redirect ?? '';
      // @ts-ignore
      globalThis.appLauncher._openAppLaunchConfirmationDialog();
      onRequestClose();
      return;
    }
    // @ts-ignore
    await globalThis.appLauncher._runApp(appController).then(() => {});
  };

  return (
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
                              onRequestClose();
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
                    onChange={(value) => setOpenToPublic(value.target.checked)}
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
                <Input disabled={!useSubDomain} />
              </Form.Item>
              <Form.Item name={'forceUseV1Proxy'}>
                <Checkbox
                  disabled={forceUseV2Proxy}
                  onChange={(value) => setForceUseV1Proxy(value.target.checked)}
                >
                  {t('session.ForceUseV1Proxy')}
                </Checkbox>
              </Form.Item>
              <Form.Item name={'forceUseV2Proxy'}>
                <Checkbox
                  disabled={forceUseV1Proxy}
                  onChange={(value) => setForceUseV2Proxy(value.target.checked)}
                >
                  {t('session.ForceUseV2Proxy')}
                </Checkbox>
              </Form.Item>
            </>
          ) : null}
        </Form>
      </BAIFlex>
    </BAIModal>
  );
};

export default AppLauncherModal;
