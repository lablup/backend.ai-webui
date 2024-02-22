import graphql from 'babel-plugin-relay/macro';

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
