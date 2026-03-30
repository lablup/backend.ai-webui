/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { graphql } from 'react-relay';

export const UserProfileSettingModalFragment = graphql`
  fragment UserProfileSettingModalFragment on User {
    id
    full_name
    totp_activated @skipOnClient(if: $isNotSupportTotp)
    allowed_client_ip @skipOnClient(if: $isNotSupportUpdateUserV2)

    # This is edge case for TOTP activation modal
    # eslint-disable-next-line relay/must-colocate-fragment-spreads
    ...TOTPActivateModalFragment
  }
`;
