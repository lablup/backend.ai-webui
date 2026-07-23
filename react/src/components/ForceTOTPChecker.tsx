/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ForceTOTPCheckerQuery } from '../__generated__/ForceTOTPCheckerQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTOTPSupported } from '../hooks/backendai';
import TOTPActivateModal from './TOTPActivateModal';
import { useToggle } from 'ahooks';
import { useUpdatableState } from 'backend.ai-ui';
import { graphql, useLazyLoadQuery } from 'react-relay';

const ForceTOTPChecker = () => {
  const [, { toggle: toggleTOTPActivateModal }] = useToggle(false);
  const { isTOTPSupported } = useTOTPSupported();
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const baiClient = useSuspendedBackendaiClient();

  const { myUserV2: user } = useLazyLoadQuery<ForceTOTPCheckerQuery>(
    graphql`
      query ForceTOTPCheckerQuery($isNotSupportTotp: Boolean!) {
        myUserV2 {
          security {
            totpActivated @skipOnClient(if: $isNotSupportTotp)
          }
          ...TOTPActivateModalFragment
        }
      }
    `,
    {
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
    user?.security?.totpActivated === false;
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
