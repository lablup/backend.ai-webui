/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ChatModel } from './ChatModel';
import { Select, type SelectProps } from 'antd';
import * as _ from 'lodash-es';
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
      options={_.map(
        _.mapValues(_.groupBy(models, 'group'), (ms) =>
          _.map(ms, ({ name }) => ({
            label: name,
            value: name,
          })),
        ),
        (v, k) => ({
          label: k === 'undefined' ? 'Others' : k,
          options: v,
        }),
      )}
      popupMatchSelectWidth={false}
      {...selectProps}
    />
  );
};

export default ModelSelect;
