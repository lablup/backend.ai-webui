import { useState } from "react";
import { CheckOutlined, WarningOutlined } from "@ant-design/icons";
import {
  Descriptions,
  Typography,
  Tag,
  Card,
  theme,
  DescriptionsProps,
  Spin,
} from "antd";
import { useWebComponentInfo } from "./DefaultProviders";
import { useTranslation, Trans } from "react-i18next";
import Flex from "./Flex";
import { useQuery } from "react-query";
import { useSuspendedBackendaiClient } from "../hooks";

const { Text } = Typography;

const DescriptionLabel: React.FC<{
  title: string;
  subtitle?: string | null;
}> = ({ title, subtitle }) => {
  const { token } = theme.useToken();
  return (
    <Flex direction="column" align="start">
      <Typography.Text strong>{title}</Typography.Text>
      {subtitle && (
        <Typography.Text type="secondary">{subtitle}</Typography.Text>
      )}
    </Flex>
  );
};

const DoubleTag: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => {
  return (
    <Flex direction="row">
      <Tag style={{ margin: 0, marginRight: -1, zIndex: 1 }}>{label}</Tag>
      <Tag color="green">{value}</Tag>
    </Flex>
  );
};

interface InformationProps {}
const Information: React.FC<InformationProps> = () => {
  const [useSsl, setUseSsl] = useState(true);

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const backendaiclient = useSuspendedBackendaiClient();

  let { data: licenseInfo, isLoading: isLoadingLicenseInfo } = useQuery<{
    valid: boolean;
    type: string;
    licensee: string;
    key: string;
    expiration: string;
  }>(
    "licenseInfo",
    () => {
      return backendaiclient?.enterprise.getLicense();
    },
    {
      // for to render even this fail query failed
      suspense: false,
    }
  );

  if (!licenseInfo) {
    licenseInfo = {
      valid: false,
      type: t("information.CannotRead"),
      licensee: t("information.CannotRead"),
      key: t("information.CannotRead"),
      expiration: t("information.CannotRead"),
    };
  }

  const columnSetting: DescriptionsProps["column"] = {
    xxl: 4,
    xl: 4,
    lg: 2,
    md: 1,
    sm: 1,
    xs: 1,
  };

  return (
    <Flex
      direction="column"
      align="stretch"
      style={{ margin: token.marginSM, gap: token.margin }}
    >
      <Card>
        <Descriptions
          title={t("information.Core")}
          bordered
          column={columnSetting}
        >
          <Descriptions.Item
            label={<DescriptionLabel title={t("information.ManagerVersion")} />}
          >
            <Flex
              direction="column"
              style={{ gap: token.marginXXS }}
              align="start"
            >
              Backend.AI {backendaiclient.managerVersion}
              <DoubleTag
                label={t("information.Installation")}
                value={backendaiclient.managerVersion}
              />
              {/* TODO: get manager_version_latest  */}
              {/* <DoubleTag
                label={t("information.LatestRelease")}
                value={"manager_version_latest"}
              /> */}
            </Flex>
          </Descriptions.Item>
          <Descriptions.Item
            label={<DescriptionLabel title={t("information.APIVersion")} />}
          >
            {backendaiclient.apiVersion}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card>
        <Descriptions
          title={t("information.Security")}
          bordered
          column={columnSetting}
        >
          <Descriptions.Item
            label={
              <DescriptionLabel
                title={t("information.DefaultAdministratorAccountChanged")}
                subtitle={t(
                  "information.DescDefaultAdministratorAccountChanged"
                )}
              />
            }
          >
            {/* TODO: accountChanged  */}
            {true ? (
              <CheckOutlined title="Yes" />
            ) : (
              <WarningOutlined style={{ color: "red" }} title="No" />
            )}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <DescriptionLabel
                title={t("information.UsesSSL")}
                subtitle={t("information.DescUsesSSL")}
              />
            }
          >
            {backendaiclient?._config.endpoint.startsWith("https:") ? (
              <CheckOutlined title="Yes" />
            ) : (
              <WarningOutlined style={{ color: "red" }} title="No" />
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card>
        <Descriptions
          title={t("information.Component")}
          bordered
          column={{ xxl: 4, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
        >
          <Descriptions.Item
            label={
              <DescriptionLabel
                title={t("information.DockerVersion")}
                subtitle={t("information.DescDockerVersion")}
              />
            }
          >
            <Tag>{t("information.Compatible")}</Tag>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <DescriptionLabel
                title={t("information.PostgreSQLVersion")}
                subtitle={t("information.DescPostgreSQLVersion")}
              />
            }
          >
            <Tag>{t("information.Compatible")}</Tag>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <DescriptionLabel
                title={t("information.ETCDVersion")}
                subtitle={t("information.DescETCDVersion")}
              />
            }
          >
            <Tag>{t("information.Compatible")}</Tag>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <DescriptionLabel
                title={t("information.RedisVersion")}
                subtitle={t("information.DescRedisVersion").replace(
                  "<br />",
                  "\n"
                )}
              />
            }
          >
            <Tag>{t("information.Compatible")}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card>
        <Spin spinning={isLoadingLicenseInfo}>
          <Descriptions
            title={t("information.License")}
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
                  title={t("information.IsLicenseValid")}
                  subtitle={t("information.DescIsLicenseValid")}
                />
              }
            >
              {licenseInfo.valid ? (
                <CheckOutlined />
              ) : (
                <WarningOutlined style={{ color: "red" }} />
              )}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <DescriptionLabel
                  title={t("information.LicenseType")}
                  subtitle={t("information.DescLicenseType").replace(
                    "<br/>",
                    "\n"
                  )}
                />
              }
            >
              {licenseInfo.type == "fixed"
                ? t("information.FixedLicense")
                : t("information.DynamicLicense")}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <DescriptionLabel
                  title={t("information.Licensee")}
                  subtitle={t("information.DescLicensee").replace(
                    "<br/>",
                    "\n"
                  )}
                />
              }
            >
              <Tag>{licenseInfo.licensee}</Tag>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <DescriptionLabel
                  title={t("information.LicenseKey")}
                  subtitle={t("information.DescLicenseKey").replace(
                    "<br/>",
                    "\n"
                  )}
                />
              }
            >
              <Tag>{licenseInfo.key}</Tag>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <DescriptionLabel
                  title={t("information.Expiration")}
                  subtitle={t("information.DescExpiration").replace(
                    "<br/>",
                    "\n"
                  )}
                />
              }
            >
              <Tag>{licenseInfo.expiration}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Spin>
      </Card>
    </Flex>
  );
};

export default Information;
