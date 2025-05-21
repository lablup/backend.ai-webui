import { useSuspendedBackendaiClient } from '../../hooks';
import { useSetBAINotification } from '../../hooks/useBAINotification';
import BAIModal, { BAIModalProps } from '../BAIModal';
import Flex from '../Flex';
import { ContainerCommitModalFragment$key } from './__generated__/ContainerCommitModalFragment.graphql';
import {
  Descriptions,
  Divider,
  Form,
  FormInstance,
  Input,
  Typography,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

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
      destroyOnClose
    >
      <Flex
        direction="column"
        gap={'xs'}
        align="stretch"
        style={{ overflow: 'hidden' }}
      >
        <Typography.Text>{t('session.DescCommitSession')}</Typography.Text>
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label={t('session.SessionName')}>
            {session?.name}
          </Descriptions.Item>
          <Descriptions.Item label={t('session.SessionId')}>
            {session?.row_id}
          </Descriptions.Item>
          {/* FIXME: need to use legacy_session */}
          {/* <Descriptions.Item label={t('session.launcher.Environments')}>
          </Descriptions.Item>  */}
        </Descriptions>
        <Divider style={{ marginTop: 12, marginBottom: 12 }} />
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
      </Flex>
    </BAIModal>
  );
};

export default ContainerCommitModal;
