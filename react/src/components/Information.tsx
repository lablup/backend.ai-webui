/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { newLineToBrElement } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import DescriptionLabel from './DescriptionLabel';
import { CheckOutlined, WarningOutlined } from '@ant-design/icons';
import {
  Descriptions,
  Tag,
  Card,
  theme,
  DescriptionsProps,
  Spin,
  Row,
  Col,
} from 'antd';
import { BAIDoubleTag, BAIFlex } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

interface InformationProps {}
const Information: React.FC<InformationProps> = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const baiClient = useSuspendedBackendaiClient();

  let { data: licenseInfo, isLoading: isLoadingLicenseInfo } = useTanQuery<{
    valid: boolean;
    type: string;
    licensee: string;
    key: string;
    expiration: string;
  }>({
    queryKey: ['licenseInfo'],
    queryFn: () => {
      return baiClient.enterprise.getLicense();
    },
    // for to render even this fail query failed
  });

  if (!licenseInfo) {
    licenseInfo = {
      valid: false,
      type: t('information.CannotRead'),
      licensee: t('information.CannotRead'),
      key: t('information.CannotRead'),
      expiration: t('information.CannotRead'),
    };
  }

  const columnSetting: DescriptionsProps['column'] = {
    xxl: 4,
    xl: 4,
    lg: 2,
    md: 1,
    sm: 1,
    xs: 1,
  };

  return (
    <BAIFlex direction="column" align="stretch" style={{ gap: token.margin }}>
      <Row gutter={[token.margin, token.margin]}>
        <Col xs={24} xxl={12}>
          <Card
            style={{
              height: '100%',
            }}
          >
            <Descriptions
              title={t('information.Core')}
              bordered
              column={columnSetting}
            >
              <Descriptions.Item
                label={
                  <DescriptionLabel title={t('information.ManagerVersion')} />
                }
              >
                <BAIFlex
                  direction="column"
                  style={{ gap: token.marginXXS }}
                  align="start"
                >
                  Backend.AI {baiClient.managerVersion}
                  <BAIDoubleTag
                    values={[
                      t('information.Installation'),
                      baiClient.managerVersion,
                    ]}
                  />
                  {/* TODO: get manager_version_latest  */}
                  {/* <DoubleTag
                label={t("information.LatestRelease")}
                value={"manager_version_latest"}
              /> */}
                </BAIFlex>
              </Descriptions.Item>
              <Descriptions.Item
                label={<DescriptionLabel title={t('information.APIVersion')} />}
              >
                {baiClient.apiVersion}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} xxl={12}>
          <Card>
            <Descriptions
              title={t('information.Security')}
              bordered
              column={columnSetting}
            >
              <Descriptions.Item
                label={
                  <DescriptionLabel
                    title={t('information.DefaultAdministratorAccountChanged')}
                    subtitle={t(
                      'information.DescDefaultAdministratorAccountChanged',
                    )}
                  />
                }
              >
                {/* TODO: accountChanged  */}
                {true ? (
                  <CheckOutlined title="Yes" />
                ) : (
                  <WarningOutlined
                    style={{ color: token.colorWarning }}
                    title="No"
                  />
                )}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <DescriptionLabel
                    title={t('information.UsesSSL')}
                    subtitle={t('information.DescUsesSSL')}
                  />
                }
              >
                {baiClient?._config.endpoint.startsWith('https:') ? (
                  <CheckOutlined title="Yes" />
                ) : (
                  <WarningOutlined
                    style={{ color: token.colorWarning }}
                    title="No"
                  />
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Card>
        <Descriptions
          title={t('information.Component')}
          bordered
          column={{ xxl: 4, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
        >
          <Descriptions.Item
            label={
              <DescriptionLabel
                title={t('information.DockerVersion')}
                subtitle={t('information.DescDockerVersion')}
              />
            }
          >
            <Tag>{t('information.Compatible')}</Tag>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <DescriptionLabel
                title={t('information.PostgreSQLVersion')}
                subtitle={t('information.DescPostgreSQLVersion')}
              />
            }
          >
            <Tag>{t('information.Compatible')}</Tag>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <DescriptionLabel
                title={t('information.ETCDVersion')}
                subtitle={t('information.DescETCDVersion')}
              />
            }
          >
            <Tag>{t('information.Compatible')}</Tag>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <DescriptionLabel
                title={t('information.RedisVersion')}
                subtitle={newLineToBrElement(t('information.DescRedisVersion'))}
              />
            }
          >
            <Tag>{t('information.Compatible')}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card>
        <Spin spinning={isLoadingLicenseInfo}>
          <Descriptions
            title={t('information.License')}
            bordered
            column={{
              xxl: 2,
              xl: 2,
              lg: 2,
              md: 1,
              sm: 1,
              xs: 1,
            }}
          >
            <Descriptions.Item
              label={
                <DescriptionLabel
                  title={t('information.IsLicenseValid')}
                  subtitle={t('information.DescIsLicenseValid')}
                />
              }
            >
              {licenseInfo.valid ? (
                <CheckOutlined />
              ) : (
                <WarningOutlined style={{ color: token.colorWarning }} />
              )}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <DescriptionLabel
                  title={t('information.LicenseType')}
                  subtitle={newLineToBrElement(
                    t('information.DescLicenseType'),
                  )}
                />
              }
            >
              <Tag>
                {licenseInfo.type === 'fixed'
                  ? t('information.FixedLicense')
                  : t('information.DynamicLicense')}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <DescriptionLabel
                  title={t('information.Licensee')}
                  subtitle={t('information.DescLicensee')}
                />
              }
            >
              <Tag>{licenseInfo.licensee}</Tag>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <DescriptionLabel
                  title={t('information.LicenseKey')}
                  subtitle={t('information.DescLicenseKey')}
                />
              }
            >
              <Tag>{licenseInfo.key}</Tag>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <DescriptionLabel
                  title={t('information.Expiration')}
                  subtitle={t('information.DescExpiration')}
                />
              }
            >
              <Tag>{licenseInfo.expiration}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Spin>
      </Card>
    </BAIFlex>
  );
};

export default Information;
