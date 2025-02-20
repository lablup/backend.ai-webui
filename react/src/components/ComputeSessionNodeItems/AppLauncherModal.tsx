import BAIModal from '../BAIModal';
import { AppLauncherModalFragment$key } from './__generated__/AppLauncherModalFragment.graphql';
import { AppLauncherModalQuery } from './__generated__/AppLauncherModalQuery.graphql';
import { ModalProps } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import { useTranslation } from 'react-i18next';
import { useFragment, useLazyLoadQuery } from 'react-relay';

interface AppLauncherModalProps extends ModalProps {
  onRequestClose: () => void;
  sessionFrgmt: AppLauncherModalFragment$key | null;
}

const AppLauncherModal: React.FC<AppLauncherModalProps> = ({
  onRequestClose,
  sessionFrgmt,
  ...modalProps
}) => {
  const { t } = useTranslation();

  const session = useFragment(
    graphql`
      fragment AppLauncherModalFragment on ComputeSessionNode {
        id
        row_id
        service_ports
      }
    `,
    sessionFrgmt,
  );

  const { legacy_session } = useLazyLoadQuery<AppLauncherModalQuery>(
    graphql`
      query AppLauncherModalQuery($id: UUID!) {
        legacy_session: compute_session(id: $id) {
          service_ports
        }
      }
    `,
    {
      id: session?.row_id ?? '',
    },
    {
      fetchPolicy:
        modalProps.open && session?.row_id ? 'network-only' : 'store-only',
    },
  );

  console.log(legacy_session);

  return (
    <BAIModal
      title={t('session.appLauncher.App')}
      onCancel={onRequestClose}
      loading={!legacy_session}
      {...modalProps}
    ></BAIModal>
  );
};

export default AppLauncherModal;
