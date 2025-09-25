import { BAIPullingArtifactRevisionAlertCancelMutation } from '../../__generated__/BAIPullingArtifactRevisionAlertCancelMutation.graphql';
import { BAIPullingArtifactRevisionAlertFragment$key } from '../../__generated__/BAIPullingArtifactRevisionAlertFragment.graphql';
import { toLocalId } from '../../helper';
import BAIFlex from '../BAIFlex';
import BAIText from '../BAIText';
import { Alert, App, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

export interface BAIPullingArtifactRevisionAlertProps {
  pullingArtifactRevisionFrgmt: BAIPullingArtifactRevisionAlertFragment$key;
  onOk?: () => void;
}

const BAIPullingArtifactRevisionAlert = ({
  pullingArtifactRevisionFrgmt,
  onOk,
}: BAIPullingArtifactRevisionAlertProps) => {
  const { t } = useTranslation();
  const { modal, message } = App.useApp();

  const pullingArtifactRevision =
    useFragment<BAIPullingArtifactRevisionAlertFragment$key>(
      graphql`
        fragment BAIPullingArtifactRevisionAlertFragment on ArtifactRevision {
          id
          status
          version
        }
      `,
      pullingArtifactRevisionFrgmt,
    );

  const [cancelPulling, isInflightCancelPulling] =
    useMutation<BAIPullingArtifactRevisionAlertCancelMutation>(graphql`
      mutation BAIPullingArtifactRevisionAlertCancelMutation(
        $input: CancelArtifactInput!
      ) {
        cancelImportArtifact(input: $input) {
          artifactRevision {
            id
            status
          }
        }
      }
    `);

  return (
    <Alert
      type="info"
      showIcon
      message={t('comp:BAIPullingArtifactRevisionAlert.VersionIsPullingNow', {
        version: pullingArtifactRevision.version,
      })}
      action={
        <Button
          type="text"
          onClick={() => {
            modal.confirm({
              title: t('comp:BAIPullingArtifactRevisionAlert.CancelPull'),
              content: (
                <BAIFlex direction="column" align="stretch">
                  <BAIText>
                    {t(
                      'comp:BAIPullingArtifactRevisionAlert.YouAreAboutToCancelThisVersion',
                    )}
                    :
                    <BAIText strong>
                      &nbsp;{pullingArtifactRevision.version}
                    </BAIText>
                  </BAIText>
                  <br />
                  <BAIText type="danger">
                    <BAIText type="danger" strong>
                      {t('comp:BAIPullingArtifactRevisionAlert.WARNING')}:
                    </BAIText>
                    &nbsp;
                    {t(
                      'comp:BAIPullingArtifactRevisionAlert.CancelingWillRestartThePulling',
                    )}
                  </BAIText>
                </BAIFlex>
              ),
              cancelText: t('general.button.Close'),
              okButtonProps: {
                danger: true,
                loading: isInflightCancelPulling,
              },
              onOk: () => {
                cancelPulling({
                  variables: {
                    input: {
                      artifactRevisionId: toLocalId(pullingArtifactRevision.id),
                    },
                  },
                  onCompleted: (_res, errors) => {
                    if (errors && errors.length > 0) {
                      errors.forEach((err) =>
                        message.error(
                          err.message ??
                            t(
                              'comp:BAIPullingArtifactRevisionAlert.FailedToCancelThePulling',
                            ),
                        ),
                      );
                      return;
                    }
                    onOk?.();
                    message.success(
                      t(
                        'comp:BAIPullingArtifactRevisionAlert.VersionPullCanceledSuccessfully',
                        {
                          version: pullingArtifactRevision.version,
                        },
                      ),
                    );
                  },
                  onError: (error) => {
                    message.error(
                      error.message ??
                        t(
                          'comp:BAIPullingArtifactRevisionAlert.FailedToCancelThePulling',
                        ),
                    );
                  },
                });
              },
            });
          }}
        >
          {t('general.button.Cancel')}
        </Button>
      }
    />
  );
};

export default BAIPullingArtifactRevisionAlert;
