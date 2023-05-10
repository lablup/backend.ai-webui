import { useState } from "react";
import { CheckOutlined, WarningOutlined } from "@ant-design/icons";
import {
  Descriptions,
  Typography,
  Tag,
  Card,
  theme,
  DescriptionsProps,
} from "antd";
import { useWebComponentInfo } from "./DefaultProviders";
import { useTranslation, Trans } from "react-i18next";
import Flex from "./Flex";

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
  const [accountChanged, setAccountChanged] = useState(true);
  const [useSsl, setUseSsl] = useState(true);
  const [licenseValid, setLicenseValid] = useState(false);
  const [licenseType, setLicenseType] = useState("information.CannotRead");
  const [licensee, setLicensee] = useState("information.CannotRead");
  const [licenseKey, setLicenseKey] = useState("information.CannotRead");
  const [licenseExpiration, setLicenseExpiration] = useState(
    "information.CannotRead"
  );

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const {
    props: { value },
  } = useWebComponentInfo();

  const columnSetting: DescriptionsProps["column"] = {
    xxl: 4,
    xl: 4,
    lg: 2,
    md: 1,
    sm: 1,
    xs: 1,
  };
  return (
    <div>
      <Card style={{ margin: token.margin }}>
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
              Backend.AI manager_version
              <DoubleTag
                label={t("information.Installation")}
                value={"manager_version"}
              />
              <DoubleTag
                label={t("information.LatestRelease")}
                value={"manager_version_latest"}
              />
            </Flex>
          </Descriptions.Item>
          <Descriptions.Item
            label={<DescriptionLabel title={t("information.APIVersion")} />}
          >
            <Flex>api_version</Flex>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card style={{ margin: "20px" }}>
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
            <Flex>
              {accountChanged ? (
                <CheckOutlined title="Yes" />
              ) : (
                <WarningOutlined style={{ color: "red" }} title="No" />
              )}
            </Flex>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <DescriptionLabel
                title={t("information.UsesSSL")}
                subtitle={t("information.DescUsesSSL")}
              />
            }
          >
            <Flex>
              {useSsl ? (
                <CheckOutlined title="Yes" />
              ) : (
                <WarningOutlined style={{ color: "red" }} title="No" />
              )}
            </Flex>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card style={{ margin: "20px" }}>
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
      <Card style={{ margin: "20px" }}>
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
            {licenseValid ? <CheckOutlined /> : <WarningOutlined />}
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
            {licenseType
              ? t("information.FixedLicense")
              : t("information.DynamicLicense")}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <DescriptionLabel
                title={t("information.Licensee")}
                subtitle={t("information.DescLicensee").replace("<br/>", "\n")}
              />
            }
          >
            <Tag>{licensee}</Tag>
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
            <Tag>{licenseKey}</Tag>
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
            <Tag>{licenseExpiration}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default Information;
