import { KeypairResourcePolicySelectorQuery } from '../__generated__/KeypairResourcePolicySelectorQuery.graphql';
import { localeCompare } from '../helper';
import useControllableState_deprecated from '../hooks/useControllableState';
import { Select, SelectProps } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface KeypairResourcePolicySelectorProps extends SelectProps {}

const KeypairResourcePolicySelector: React.FC<
  KeypairResourcePolicySelectorProps
> = ({ ...selectProps }) => {
  const { t } = useTranslation();
  const [value, setValue] = useControllableState_deprecated<string>({
    value: selectProps.value,
    onChange: selectProps.onChange,
  });

  const { keypair_resource_policies } =
    useLazyLoadQuery<KeypairResourcePolicySelectorQuery>(
      graphql`
        query KeypairResourcePolicySelectorQuery {
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

export default KeypairResourcePolicySelector;
