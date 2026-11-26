/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Its one call site (`KeypairSettingModal`, inside a `BAIFormItem`) passes no
 props: the Form injects `value` and `onChange`.
*/
import { KeypairResourcePolicySelectQuery } from '../../../__generated__/KeypairResourcePolicySelectQuery.graphql';
import { localeCompare } from '../../../helper';
import useControllableState_deprecated from '../../../hooks/useControllableState';
import type { SelectorOptionData } from '@lablup/ui-common/Selector';
import { BAISelect } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface KeypairResourcePolicySelectProps {
  /** Injected by `Form.Item`. */
  value?: string;
  /** Injected by `Form.Item`. */
  onChange?: (value: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  controlStyle?: CSSProperties;
}

const KeypairResourcePolicySelect: React.FC<
  KeypairResourcePolicySelectProps
> = ({ disabled, isLoading, controlStyle, ...selectProps }) => {
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

  const options: SelectorOptionData[] = _.map(
    keypair_resource_policies,
    (policy) => ({
      value: policy?.name ?? '',
      label: policy?.name ?? '',
    }),
  ).sort((a, b) => localeCompare(a.label, b.label));

  return (
    <BAISelect
      aria-label={t('credential.SelectPolicy')}
      placeholder={t('credential.SelectPolicy')}
      options={options}
      value={value ?? ''}
      onChange={(next) => {
        if (next !== null) setValue(next);
      }}
      disabled={disabled}
      isLoading={isLoading}
      width="100%"
      controlStyle={controlStyle}
    />
  );
};

export default KeypairResourcePolicySelect;
