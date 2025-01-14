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
  const formRef = useRef<FormInstance>(null);
  const baiClient = useSuspendedBackendaiClient();

  const { upsertNotification } = useSetBAINotification();
  const [isConfirmLoading, setIsConfirmLoading] = useState<boolean>(false);

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
        baiClient.computeSession
          .convertSessionToImage(session?.name ?? '', values.imageName)
          .then((res: { task_id: string }) => {
            onRequestClose();
            upsertNotification({
              key: 'commitSession:' + session?.name,
              backgroundTask: {
                taskId: res.task_id,
                status: 'pending',
                statusDescriptions: {
                  pending: t('session.CommitOnGoing'),
                  resolved: t('session.CommitFinished'),
                  rejected: t('session.CommitFailed'),
                },
              },
              duration: 0,
              message: 'commitSession: ' + session?.name,
              open: true,
            });
          })
          .catch((err: any) => {
            if (err?.message) {
              throw new Error(err.message);
            } else {
              throw err;
            }
          })
          .finally(() => {
            setIsConfirmLoading(false);
          });
      })
      .catch((err) => {
        console.log(err);
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
                message: t('session.Validation.EnterValidSessionName'),
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
