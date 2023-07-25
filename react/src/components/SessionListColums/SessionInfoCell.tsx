import React, { useState } from "react";
import { useFragment } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import { SessionInfoCellFragment$key } from "./__generated__/SessionInfoCellFragment.graphql";

import { Button, Form, Input, Typography, theme } from "antd";
import { EditOutlined } from "@ant-design/icons";
import Flex from "../Flex";
import { useTranslation } from "react-i18next";
import {
  useBackendaiImageMetaData,
  useSuspendedBackendaiClient,
} from "../../hooks";
import ImageMetaIcon from "../ImageMetaIcon";
import SessionKernelTag from "../SessionKernelTag";
import { useTanMutation } from "../../hooks/reactQueryAlias";

const isRunningStatus = (status: string = "") => {
  return [
    "RUNNING",
    "RESTARTING",
    "TERMINATING",
    "PENDING",
    "SCHEDULED",
    "PREPARING",
    "PULLING",
  ].includes(status);
};

const isPreparing = (status: string = "") => {
  return ["RESTARTING", "PREPARING", "PULLING"].includes(status);
};

const SessionInfoCell: React.FC<{
  sessionFrgmt: SessionInfoCellFragment$key;
  onRename?: () => void;
}> = ({ sessionFrgmt, onRename }) => {
  const baiClient = useSuspendedBackendaiClient();
  const { token } = theme.useToken();
  const session = useFragment(
    graphql`
      fragment SessionInfoCellFragment on ComputeSession {
        id
        session_id
        name
        status
        user_email
        image
      }
    `,
    sessionFrgmt
  );

  const metadata = useBackendaiImageMetaData();

  const mutation = useTanMutation({
    mutationFn: (newName: string) => {
      const sessionId =
        baiClient.APIMajorVersion < 5 ? session.name : session.session_id;
      return baiClient.rename(sessionId, newName);
    },
  });

  const [form] = Form.useForm();
  const { t } = useTranslation();

  const [editing, setEditing] = useState(false);
  const [optimisticName, setOptimisticName] = useState(session.name);
  const editable =
    isRunningStatus(session.status || undefined) &&
    !isPreparing(session.status || undefined) &&
    baiClient.email === session.user_email;

  const save = () => {
    form.validateFields().then(({ name }) => {
      setEditing(false);
      setOptimisticName(name);
      mutation.mutate(name, {
        onSuccess: (result) => {
          onRename && onRename();
        },
        onError: (error) => {
          setOptimisticName(session.name);
        },
      });
    });
  };

  const isPendingRename = mutation.isLoading || optimisticName !== session.name;

  // sessions[objectKey].icon = this._getKernelIcon(session.image);
  //         sessions[objectKey].sessionTags = this._getKernelInfo(session.image);
  return (
    <Flex direction="column">
      <Flex direction="row">
        <Form form={form}>
          {editing ? (
            <Form.Item
              style={{ margin: 0 }}
              name={"name"}
              rules={[
                {
                  required: true,
                },
                {
                  max: 64,
                },
                {
                  pattern: /^(?:[a-zA-Z0-9][a-zA-Z0-9._-]{2,}[a-zA-Z0-9])?$/,
                  message: t(
                    "session.Validation.EnterValidSessionName"
                  ).toString(),
                },
              ]}
            >
              <Input
                autoFocus
                onPressEnter={() => save()}
                onKeyUp={(e) => {
                  if (e.key === "Escape") setEditing(false);
                }}
              />
            </Form.Item>
          ) : (
            <>
              <Typography.Text style={{ opacity: isPendingRename ? 0.5 : 1 }}>
                {optimisticName}
              </Typography.Text>
              {editable && (
                <Button
                  loading={isPendingRename}
                  type="ghost"
                  icon={<EditOutlined />}
                  style={{ color: token.colorLink }}
                  onClick={() => {
                    form.setFieldsValue({
                      name: session.name,
                    });
                    setEditing(true);
                  }}
                ></Button>
              )}
            </>
          )}
        </Form>
      </Flex>
      <ImageMetaIcon image={session.image} />
      <SessionKernelTag image={session.image} />
    </Flex>
  );
};

export default SessionInfoCell;
