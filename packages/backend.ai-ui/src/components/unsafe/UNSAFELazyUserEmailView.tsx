import { UNSAFELazyUserEmailViewQuery } from '../../__generated__/UNSAFELazyUserEmailViewQuery.graphql';
import { toGlobalId } from '../../helper';
import { Typography, type GetProps } from 'antd';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface UNSAFELazyUserEmailViewProps
  extends Omit<GetProps<typeof Typography.Text>, 'children'> {
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
    user_node?.email && (
      <Typography.Text {...textProps}>{user_node?.email}</Typography.Text>
    )
  );
};

export default UNSAFELazyUserEmailView;
