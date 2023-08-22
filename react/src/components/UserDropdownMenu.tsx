import React from "react";
import { Button, Dropdown, MenuProps } from "antd";
import {
  UserOutlined,
  MailOutlined,
  SecurityScanOutlined,
  ExclamationCircleOutlined,
  LockOutlined,
  HolderOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useSuspendedBackendaiClient } from "../hooks";
import { useTanQuery } from "../hooks/reactQueryAlias";
import { useTranslation } from "react-i18next";

const UserDropdownMenu: React.FC = () => {
  const { t } = useTranslation();

  const baiClient = useSuspendedBackendaiClient();
  console.log(baiClient);

  const email = baiClient.email;
  const full_name = baiClient.full_name;
  const { data: userInfo } = useTanQuery(
    "getUserRole",
    () => {
      return baiClient.user.get(baiClient.email, ["role"]);
    },
    {
      suspense: false,
    }
  );
  const userRole = userInfo?.user.role;

  const items: MenuProps["items"] = [
    {
      label: (
        <Button type="text">
          <UserOutlined /> {full_name}
        </Button>
      ),
      key: "0",
    },
    {
      label: (
        <Button type="text">
          <MailOutlined /> {email}
        </Button>
      ),
      key: "1",
    },
    {
      type: "divider",
    },
    {
      label: (
        <Button type="text">
          <SecurityScanOutlined /> {userRole}
        </Button>
      ),
      key: "2",
    },
    {
      type: "divider",
    },
    {
      label: (
        <Button type="text">
          <ExclamationCircleOutlined /> {t("webui.menu.AboutBackendAI")}
        </Button>
      ),
      key: "3",
    },
    {
      label: (
        <Button type="text">
          <LockOutlined /> {t("webui.menu.MyAccount")}
        </Button>
      ),
      key: "4",
    },
    {
      label: (
        <Button type="text">
          <HolderOutlined /> {t("webui.menu.Preferences")}
        </Button>
      ),
      key: "5",
    },
    {
      label: (
        <Button type="text">
          <FileTextOutlined /> {t("webui.menu.LogsErrors")}
        </Button>
      ),
      key: "6",
    },
    {
      label: (
        <Button type="text">
          <LogoutOutlined /> {t("webui.menu.LogOut")}
        </Button>
      ),
      key: "7",
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={["click"]}>
      <Button type="text" shape="circle">
        <UserOutlined style={{ fontSize: "20px" }} />
      </Button>
    </Dropdown>
  );
};

export default UserDropdownMenu;
