import { SessionInfoCellFragment$key } from '../../__generated__/SessionInfoCellFragment.graphql';
import {
  // useBackendaiImageMetaData,
  useSuspendedBackendaiClient,
} from '../../hooks';
import { useTanMutation } from '../../hooks/reactQueryAlias';
import Flex from '../Flex';
import { EditOutlined } from '@ant-design/icons';
import { Button, Form, FormInstance, Input, Typography, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

const isRunningStatus = (status: string = '') => {
  return [
    'RUNNING',
    'RESTARTING',
    'TERMINATING',
    'PENDING',
    'SCHEDULED',
    'PREPARING',
    'PREPARED',
    'CREATING',
    'PULLING',
  ].includes(status);
};

const isPreparing = (status: string = '') => {
  return [
    'RESTARTING',
    'PREPARING',
    'PREPARED',
    'CREATING',
    'PULLING',
  ].includes(status);
};

const SessionInfoCell: React.FC<{
  sessionFrgmt: SessionInfoCellFragment$key;
  sessionNameList: string[];
  onRename?: () => void;
}> = ({ sessionFrgmt, sessionNameList, onRename }) => {
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
    sessionFrgmt,
  );

  // const metadata = useBackendaiImageMetaData();

  const mutation = useTanMutation({
    mutationFn: (newName: string) => {
      const sessionId =
        baiClient.APIMajorVersion < 5 ? session.name : session.session_id;
      return baiClient.rename(sessionId, newName);
    },
  });

  const formRef = useRef<FormInstance>(null);
  const { t } = useTranslation();

  const [editing, setEditing] = useState(false);
  const [optimisticName, setOptimisticName] = useState(session.name);
  const editable =
    isRunningStatus(session.status || undefined) &&
    !isPreparing(session.status || undefined) &&
    baiClient.email === session.user_email;

  const save = () => {
    formRef.current
      ?.validateFields()
      .then(({ name }) => {
        setEditing(false);
        if (session.name === name) return;
        setOptimisticName(name);
        mutation.mutate(name, {
          onSuccess: (result) => {
            onRename && onRename();
          },
          onError: (error) => {
            setOptimisticName(session.name);
          },
        });
      })
      .catch(() => {});
  };

  const isPendingRename = mutation.isPending || optimisticName !== session.name;

  // sessions[objectKey].icon = this._getKernelIcon(session.image);
  //         sessions[objectKey].sessionTags = this._getKernelInfo(session.image);
  return (
    <Form ref={formRef}>
      {editing ? (
        <Form.Item
          style={{ margin: 0 }}
          name={'name'}
          rules={[
            {
              required: true,
            },
            {
              max: 64,
            },
            {
              pattern: /^(?:[a-zA-Z0-9][-a-zA-Z0-9._]{2,}[a-zA-Z0-9])?$/,
              message: t('session.validation.EnterValidSessionName'),
            },
            () => ({
              validator(form, value) {
                if (
                  _.without(sessionNameList, session.name).includes(
                    String(value),
                  )
                ) {
                  return Promise.reject(
                    new Error(t('session.validation.SessionNameAlreadyExist')),
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input
            autoFocus
            onPressEnter={() => save()}
            onKeyUp={(e) => {
              if (e.key === 'Escape') setEditing(false);
            }}
          />
        </Form.Item>
      ) : (
        <Flex style={{ maxWidth: 250 }}>
          <Typography.Text
            ellipsis={{
              tooltip: { overlayInnerStyle: { width: 'max-content' } },
            }}
            style={{ opacity: isPendingRename ? 0.5 : 1 }}
          >
            {optimisticName}
          </Typography.Text>
          {editable && (
            <Button
              loading={isPendingRename}
              type="text"
              icon={<EditOutlined />}
              style={{ color: token.colorLink }}
              onClick={() => {
                formRef.current?.setFieldsValue({
                  name: session.name,
                });
                setEditing(true);
              }}
            ></Button>
          )}
        </Flex>
      )}
    </Form>
  );
};

export default SessionInfoCell;
