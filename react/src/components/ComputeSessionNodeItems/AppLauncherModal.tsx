import { useSuspendedBackendaiClient } from '../../hooks';
import { useBackendAIAppLauncher } from '../../hooks/useBackendAIAppLauncher';
import {
  ServicePort,
  useSuspendedFilteredAppTemplate,
} from '../../hooks/useSuspendedFilteredAppTemplate';
import BAIModal from '../BAIModal';
import Flex from '../Flex';
import { AppLauncherModalFragment$key } from './__generated__/AppLauncherModalFragment.graphql';
import { Button, Col, Image, ModalProps, Row, Typography } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

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
  const appLauncher = useBackendAIAppLauncher();

  const session = useFragment(
    graphql`
      fragment AppLauncherModalFragment on ComputeSessionNode {
        id
        row_id
        service_ports
      }
    `,
    sessionFrgmt,
  );

  const servicePorts: ServicePort[] = JSON.parse(
    session?.service_ports || '{}',
  );

  const { appTemplate, preOpenAppTemplate, baseAppTemplate } =
    useSuspendedFilteredAppTemplate(servicePorts);
  console.log(baseAppTemplate);

  return (
    <BAIModal
      title={t('session.appLauncher.App')}
      onCancel={onRequestClose}
      {...modalProps}
    >
      {/* <Flex direction="column" gap={'sm'} align="stretch">
        {!_.isEmpty(appTemplate) &&
        baiClient.supports('local-vscode-remote-connection') &&
        allowTCPApps ? (
          <Row gutter={[24, 24]}>
            <Col span={6}>
              <Flex direction="column" gap="xs">
                <Button
                  style={{ width: '60px', height: '60px' }}
                  icon={
                    <Image
                      width="32px"
                      src={appTemplate.vscode[0].src}
                      alt={appTemplate.vscode[0].name}
                      preview={false}
                    />
                  }
                />
                <Typography.Text style={{ textAlign: 'center' }}>
                  {appTemplate.vscode[0].title}
                </Typography.Text>
              </Flex>
            </Col>
          </Row>
        ) : null}
        {_.map(filteredAppTemplate, (apps, category) => {
          return (
            <>
              <Typography.Title level={5}>
                {category.split('.')[1]}
              </Typography.Title>
              <Row gutter={[24, 24]}>
                {_.map(apps, (app) => {
                  return (
                    <Col span={6}>
                      <Flex direction="column" gap="xs">
                        <Button
                          style={{ width: '60px', height: '60px' }}
                          icon={
                            <Image
                              width="32px"
                              src={appTemplate.vscode[0].src}
                              alt={appTemplate.vscode[0].name}
                              preview={false}
                            />
                          }
                        />
                        <Typography.Text style={{ textAlign: 'center' }}>
                          {appTemplate.vscode[0].title}
                        </Typography.Text>
                      </Flex>
                    </Col>
                  );
                })}
              </Row>
            </>
          );
        })}
      </Flex> */}
    </BAIModal>
  );
};

export default AppLauncherModal;
