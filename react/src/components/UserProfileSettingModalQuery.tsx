import { graphql } from 'react-relay';

export const UserProfileQuery = graphql`
  query UserProfileSettingModalQuery(
    $email: String!
    $isNotSupportTotp: Boolean!
  ) {
    user(email: $email) {
      id
      totp_activated @skipOnClient(if: $isNotSupportTotp)
      full_name

      # This is edge case for TOTP activation modal
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...TOTPActivateModalFragment
    }
  }
`;
