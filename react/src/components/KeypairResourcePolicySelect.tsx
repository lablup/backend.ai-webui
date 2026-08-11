/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 antd `Select` → Astryx `Selector` (MAPPING §3.1, "everything else" branch:
 static options, `showSearch`, no `mode`, no scroll source).

 PILOT-DECISION: the `extends SelectProps` prop surface is gone. P1 says never
 narrow a wrapper's interface from memory, so the replacement was grepped: the
 component has exactly ONE call site (`KeypairSettingModal`, inside a
 `BAIFormItem`) and it passes NO props at all — the Form injects `value` and
 `onChange`. The interface below is that measured surface plus the antd
 spellings the adapter layer uses elsewhere.
*/
import { KeypairResourcePolicySelectQuery } from '../__generated__/KeypairResourcePolicySelectQuery.graphql';
import { localeCompare } from '../helper';
import useControllableState_deprecated from '../hooks/useControllableState';
import { Selector } from '@astryxdesign/core/Selector';
import type { SelectorOptionData } from '@astryxdesign/core/Selector';
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
  loading?: boolean;
  style?: CSSProperties;
}

const KeypairResourcePolicySelect: React.FC<
  KeypairResourcePolicySelectProps
> = ({ disabled, loading, style, ...selectProps }) => {
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
    <Selector
      // `label` is a required string the control renders itself; the
      // surrounding form item already shows the visible one.
      label={t('credential.SelectPolicy')}
      isLabelHidden
      placeholder={t('credential.SelectPolicy')}
      // antd `showSearch` -> `hasSearch`.
      hasSearch
      options={options}
      value={value ?? ''}
      onChange={(next) => setValue(next)}
      isDisabled={disabled}
      isLoading={loading}
      width="100%"
      style={style}
    />
  );
};

export default KeypairResourcePolicySelect;
