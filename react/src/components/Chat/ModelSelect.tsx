/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ChatModel } from './ChatModel';
import { Select, type SelectProps } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

interface ModelSelectProps extends SelectProps {
  models?: Array<ChatModel>;
}

const ModelSelect: React.FC<ModelSelectProps> = ({
  models,
  ...selectProps
}) => {
  const { t } = useTranslation();

  return (
    <Select
      placeholder={t('chatui.SelectModel')}
      style={{
        fontWeight: 'normal',
      }}
      showSearch
      options={_.chain(models)
        .groupBy('group')
        .mapValues((ms) =>
          _.map(ms, ({ name }) => ({
            label: name,
            value: name,
          })),
        )
        .map((v, k) => ({
          label: k === 'undefined' ? 'Others' : k,
          options: v,
        }))
        .value()}
      popupMatchSelectWidth={false}
      {...selectProps}
    />
  );
};

export default ModelSelect;
