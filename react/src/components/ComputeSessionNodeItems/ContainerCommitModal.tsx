/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ContainerCommitModalFragment$key } from '../../__generated__/ContainerCommitModalFragment.graphql';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useSetBAINotification } from '../../hooks/useBAINotification';
import { Divider } from '@astryxdesign/core/Divider';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { Text } from '@astryxdesign/core/Text';
// FRONTIER (ticket 17 / ticket 34): Form + Form.Item + Input stay on the antd
// form engine (locked SHIM decision).
import { Form, FormInstance, Input } from 'antd';
import { BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface ContainerCommitModalProps extends BAIModalProps {
  sessionFrgmt: ContainerCommitModalFragment$key | null;
  onRequestClose: () => void;
}

const ContainerCommitModal: React.FC<ContainerCommitModalProps> = ({
  sessionFrgmt,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { upsertNotification } = useSetBAINotification();
  const [isConfirmLoading, setIsConfirmLoading] = useState<boolean>(false);
  const formRef = useRef<FormInstance>(null);
  const baiClient = useSuspendedBackendaiClient();

  const session = useFragment(
    graphql`
      fragment ContainerCommitModalFragment on ComputeSessionNode {
        id
        name
        row_id @required(action: NONE)
      }
    `,
    sessionFrgmt,
  );

  const convertSessionToImage = () => {
    setIsConfirmLoading(true);
    formRef?.current
      ?.validateFields()
      .then((values: { imageName: string }) => {
        upsertNotification({
          message: 'commitSession: ' + session?.name,
          open: true,
          backgroundTask: {
            status: 'pending',
            promise: baiClient.computeSession.convertSessionToImage(
              session?.name ?? '',
              values.imageName,
            ),
            onChange: {
              pending: t('session.CommitOnGoing'),
              resolved: (data) => {
                const task_id = (data as { task_id: string }).task_id;
                onRequestClose();
                return {
                  duration: 0,
                  backgroundTask: {
                    status: 'pending',
                    taskId: task_id,
                    promise: null,
                    percent: 0,
                    onChange: {
                      pending: t('session.CommitOnGoing'),
                      resolved: t('session.CommitFinished'),
                      rejected: t('session.CommitFailed'),
                    },
                  },
                };
              },
              rejected: (err: any) => {
                return {
                  open: true,
                  type: 'error',
                  message: 'commitSession: ' + session?.name,
                  description: err?.message,
                  toText: t('button.SeeErrorLogs'),
                  to: `/usersettings?tab=logs`,
                };
              },
            },
          },
        });
      })
      .catch(() => {})
      .finally(() => {
        setIsConfirmLoading(false);
      });
  };

  return (
    <BAIModal
      title={t('session.CommitSession')}
      onOk={() => convertSessionToImage()}
      okButtonProps={{ loading: isConfirmLoading }}
      onCancel={onRequestClose}
      {...modalProps}
      destroyOnHidden
    >
      <BAIFlex
        direction="column"
        gap={'xs'}
        align="stretch"
        style={{ overflow: 'hidden' }}
      >
        <Text>{t('session.DescCommitSession')}</Text>
        <MetadataList columns="single">
          <MetadataListItem label={t('session.SessionName')}>
            {session?.name}
          </MetadataListItem>
          <MetadataListItem label={t('session.SessionId')}>
            {session?.row_id}
          </MetadataListItem>
          {/* FIXME: need to use legacy_session */}
        </MetadataList>
        <Divider />
        <Form ref={formRef}>
          <Form.Item
            label={t('session.CommitImageName')}
            name="imageName"
            required
            rules={[
              { required: true },
              {
                min: 4,
                max: 32,
              },
              {
                pattern: /^[a-zA-Z0-9-_.]+$/,
                message: t('session.validation.EnterValidSessionName'),
              },
            ]}
          >
            <Input placeholder={t('inputLimit.4to32chars')} />
          </Form.Item>
        </Form>
      </BAIFlex>
    </BAIModal>
  );
};

export default ContainerCommitModal;
