/*
 to-astryx W2-D: `GetProps<typeof Typography.Text>` -> `BAITextProps`.

 `GetProps` has no Astryx analog (MAPPING §6 rule 2), and it was the ONLY
 reason this module sat in the antd import graph — as a 572-file taint hub.
 `BAIText` is the Astryx-backed frontier wrapper that already restates antd's
 `Typography.Text` prop surface locally, so the props these call sites pass
 (`type`, `ellipsis`, `copyable`, `style`) are unchanged.
*/
import { UNSAFELazyUserEmailViewQuery } from '../../__generated__/UNSAFELazyUserEmailViewQuery.graphql';
import { toGlobalId } from '../../helper';
import BAIText, { type BAITextProps } from '../BAIText';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface UNSAFELazyUserEmailViewProps extends Omit<
  BAITextProps,
  'children'
> {
  uuid?: string;
  fetchKey?: string;
}

/**
 * @warning This component should only be used as a last resort.
 * @internal
 */
const UNSAFELazyUserEmailView: React.FC<UNSAFELazyUserEmailViewProps> = ({
  uuid,
  fetchKey,
  ...textProps
}) => {
  const { user_node } = useLazyLoadQuery<UNSAFELazyUserEmailViewQuery>(
    graphql`
      query UNSAFELazyUserEmailViewQuery($uuid: String!) {
        user_node(id: $uuid) {
          email
        }
      }
    `,
    {
      uuid: uuid ? toGlobalId('UserNode', uuid) : '',
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
  return (
    user_node?.email && <BAIText {...textProps}>{user_node?.email}</BAIText>
  );
};

export default UNSAFELazyUserEmailView;
