import { KeypairResourcePolicySelectQuery } from '../__generated__/KeypairResourcePolicySelectQuery.graphql';
import { localeCompare } from '../helper';
import useControllableState_deprecated from '../hooks/useControllableState';
import { Select, SelectProps } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface KeypairResourcePolicySelectProps extends SelectProps {}

const KeypairResourcePolicySelect: React.FC<
  KeypairResourcePolicySelectProps
> = ({ ...selectProps }) => {
  const { t } = useTranslation();
  const [value, setValue] = useControllableState_deprecated<string>({
    value: selectProps.value,
    onChange: selectProps.onChange,
  });

  const { keypair_resource_policies } =
    useLazyLoadQuery<KeypairResourcePolicySelectQuery>(
      graphql`
        query KeypairResourcePolicySelectQuery {
          keypair_resource_policies {
            name
          }
        }
      `,
      {},
      { fetchPolicy: 'store-and-network' },
    );

  return (
    <Select
      showSearch
      placeholder={t('credential.SelectPolicy')}
      options={_.map(keypair_resource_policies, (policy) => {
        return {
          value: policy?.name,
          label: policy?.name,
        };
      }).sort((a, b) => localeCompare(a?.label, b?.label))}
      {...selectProps}
      value={value}
      onChange={(value, option) => {
        setValue(value, option);
      }}
    />
  );
};

export default KeypairResourcePolicySelect;
