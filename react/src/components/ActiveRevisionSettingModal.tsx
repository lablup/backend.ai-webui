import BAIModal, { BAIModalProps } from './BAIModal';
import { App, Typography } from 'antd';
import { BAIFlex, toLocalId } from 'backend.ai-ui';
import _ from 'lodash';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';
import { ActiveRevisionSettingModalFragment$key } from 'src/__generated__/ActiveRevisionSettingModalFragment.graphql';
import { ActiveRevisionSettingModalMutation } from 'src/__generated__/ActiveRevisionSettingModalMutation.graphql';

interface ActiveRevisionSettingModalProps extends BAIModalProps {
  deploymentId: string;
  revisionFrgmt?: ActiveRevisionSettingModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
}

const ActiveRevisionSettingModal: React.FC<ActiveRevisionSettingModalProps> = ({
  deploymentId,
  revisionFrgmt = null,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const revision = useFragment(
    graphql`
      fragment ActiveRevisionSettingModalFragment on ModelRevision {
        id
        name
      }
    `,
    revisionFrgmt,
  );

  const [commitSetCurrentRevision, isInFlightSetCurrentRevision] =
    useMutation<ActiveRevisionSettingModalMutation>(graphql`
      mutation ActiveRevisionSettingModalMutation(
        $input: UpdateModelDeploymentInput!
      ) {
        updateModelDeployment(input: $input) {
          deployment {
            revision {
              id
            }
          }
        }
      }
    `);

  const handleOk = () => {
    if (!revision?.id) return;
    commitSetCurrentRevision({
      variables: {
        input: {
          activeRevisionId: toLocalId(revision.id),
          id: deploymentId,
        },
      },
      onCompleted: (res, errors) => {
        const resultID = res?.updateModelDeployment?.deployment?.revision?.id;
        if (_.isEmpty(resultID) || resultID !== revision.id) {
          message.error(t('deployment.launcher.DeploymentUpdateFailed'));
          return;
        }
        if (errors && errors.length > 0) {
          const errorMsgList = _.map(errors, (error) => error.message);
          for (const error of errorMsgList) {
            message.error(error);
          }
        } else {
          message.success(t('maintenance.SuccessfullyUpdated'));
          onRequestClose(true);
        }
      },
      onError: (err) => {
        message.error(
          err.message || t('deployment.launcher.DeploymentUpdateFailed'),
        );
      },
    });
  };

  return (
    <BAIModal
      title={t('deployment.SetAsActiveRevision')}
      open={modalProps.open}
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      confirmLoading={isInFlightSetCurrentRevision}
      {...modalProps}
    >
      <BAIFlex direction="column" gap="md">
        <Typography.Text>
          <Trans
            i18nKey="deployment.ConfirmUpdateActiveRevision"
            values={{ name: revision?.name || '' }}
          />
        </Typography.Text>
      </BAIFlex>
    </BAIModal>
  );
};

export default ActiveRevisionSettingModal;
