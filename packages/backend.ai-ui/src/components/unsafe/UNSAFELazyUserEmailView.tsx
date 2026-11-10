/*
 to-astryx W2-D: `GetProps<typeof Typography.Text>` -> `BAITextProps`.

 `GetProps` has no Astryx analog (MAPPING §6 rule 2), and it was the ONLY
 reason this module sat in the antd import graph — as a 572-file taint hub.
 `BAIText` is the Astryx-backed frontier wrapper that already restates antd's
 `Typography.Text` prop surface locally, so the props these call sites pass
 (`type`, `ellipsis`, `copyable`, `style`) are unchanged.
*/
import {
  UNSAFELazyUserEmailViewQuery,
  UserScope,
} from '../../__generated__/UNSAFELazyUserEmailViewQuery.graphql';
import BAIText, { type BAITextProps } from '../BAIText';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface UNSAFELazyUserEmailViewProps extends Omit<
  BAITextProps,
  'children'
> {
  uuid?: string;
  /** The users this scope reaches are looked up, usually the current domain (ADR 0012). */
  scope: UserScope;
  fetchKey?: string;
}

/**
 * @warning This component should only be used as a last resort.
 * @internal
 */
const UNSAFELazyUserEmailView: React.FC<UNSAFELazyUserEmailViewProps> = ({
  uuid,
  scope,
  fetchKey,
  ...textProps
}) => {
  const { scopedUsersV2 } = useLazyLoadQuery<UNSAFELazyUserEmailViewQuery>(
    graphql`
      query UNSAFELazyUserEmailViewQuery($scope: UserScope!, $uuid: UUID!) {
        scopedUsersV2(
          scope: $scope
          filter: { entityId: { equals: $uuid } }
          limit: 1
        ) {
          edges {
            node {
              id
              basicInfo {
                email
              }
            }
          }
        }
      }
    `,
    {
      scope,
      uuid: uuid ?? '',
    },
    {
      fetchPolicy: !uuid
        ? 'store-only'
        : fetchKey === undefined
          ? 'store-or-network'
          : 'network-only',
      fetchKey,
    },
  );
  const email = scopedUsersV2?.edges?.[0]?.node?.basicInfo?.email;
  return email && <BAIText {...textProps}>{email}</BAIText>;
};

export default UNSAFELazyUserEmailView;
