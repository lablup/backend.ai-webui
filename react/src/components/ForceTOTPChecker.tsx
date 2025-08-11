import { ForceTOTPCheckerQuery } from '../__generated__/ForceTOTPCheckerQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTOTPSupported } from '../hooks/backendai';
import TOTPActivateModal from './TOTPActivateModal';
import { useToggle } from 'ahooks';
import { useFetchKey } from 'backend.ai-ui';
import { graphql, useLazyLoadQuery } from 'react-relay';

const ForceTOTPChecker = () => {
  const [, { toggle: toggleTOTPActivateModal }] = useToggle(false);
  const { isTOTPSupported } = useTOTPSupported();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const baiClient = useSuspendedBackendaiClient();

  const { user } = useLazyLoadQuery<ForceTOTPCheckerQuery>(
    graphql`
      query ForceTOTPCheckerQuery($email: String, $isNotSupportTotp: Boolean!) {
        user(email: $email) {
          totp_activated @skipOnClient(if: $isNotSupportTotp)
          ...TOTPActivateModalFragment
        }
      }
    `,
    {
      email: baiClient?.email ?? '',
      isNotSupportTotp: !isTOTPSupported,
    },
    {
      fetchKey,
      fetchPolicy: 'network-only',
    },
  );
  const open =
    baiClient?.supports('force2FA') &&
    baiClient?._config.force2FA &&
    user?.totp_activated === false;
  return (
    !!isTOTPSupported && (
      <TOTPActivateModal
        userFrgmt={user}
        closable={false}
        cancelButtonProps={{
          style: { display: 'none' },
        }}
        open={open}
        onRequestClose={(success) => {
          if (success) {
            updateFetchKey();
          } else {
            // formRef.current?.setFieldValue('totp_activated', false);
          }
          toggleTOTPActivateModal();
        }}
      />
    )
  );
};

export default ForceTOTPChecker;
