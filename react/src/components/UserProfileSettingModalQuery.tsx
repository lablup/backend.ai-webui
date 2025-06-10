import { graphql } from 'react-relay';

export const UserProfileQuery = graphql`
  query UserProfileSettingModalQuery(
    $email: String!
    $isNotSupportTotp: Boolean!
  ) {
    user(email: $email) {
      id
      totp_activated @skipOnClient(if: $isNotSupportTotp)
      ...TOTPActivateModalFragment
    }
  }
`;
