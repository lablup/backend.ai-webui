import { BAIPullingArtifactRevisionAlertFragment$key } from '../../__generated__/BAIPullingArtifactRevisionAlertFragment.graphql';
import { Alert, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export interface BAIPullingArtifactRevisionAlertProps {
  pullingArtifactRevisionFrgmt: BAIPullingArtifactRevisionAlertFragment$key;
}

const BAIPullingArtifactRevisionAlert = ({
  pullingArtifactRevisionFrgmt,
}: BAIPullingArtifactRevisionAlertProps) => {
  const { t } = useTranslation();

  const pullingArtifactRevision =
    useFragment<BAIPullingArtifactRevisionAlertFragment$key>(
      graphql`
        fragment BAIPullingArtifactRevisionAlertFragment on ArtifactRevision {
          id
          version
        }
      `,
      pullingArtifactRevisionFrgmt,
    );

  return (
    <Alert
      type="info"
      showIcon
      message={`version ${pullingArtifactRevision.version} is pulling now`}
      action={<Button>{t('general.button.Cancel')}</Button>}
    />
  );
};

export default BAIPullingArtifactRevisionAlert;
