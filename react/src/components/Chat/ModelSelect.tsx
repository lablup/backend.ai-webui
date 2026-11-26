/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ChatModel } from './ChatModel';
import type { SelectorOptionType } from '@lablup/ui-common/Selector';
import { BAISelect, type BAISelectProps } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';

interface ModelSelectProps extends Omit<BAISelectProps, 'options'> {
  models?: Array<ChatModel>;
  deploymentName?: string | null;
}

const ModelSelect: React.FC<ModelSelectProps> = ({
  models,
  deploymentName,
  ...selectProps
}) => {
  'use memo';

  const { t } = useTranslation();

  const modelOptions = _.map(models, ({ name }) => ({
    label: name,
    value: name ?? '',
  }));
  const options: Array<SelectorOptionType> = deploymentName
    ? [
        {
          type: 'section',
          title: t('chatui.DeploymentModels', { name: deploymentName }),
          options: modelOptions,
        },
      ]
    : modelOptions;

  return (
    <BAISelect
      placeholder={t('chatui.SelectModel')}
      controlStyle={{
        fontWeight: 'normal',
      }}
      options={options}
      {...selectProps}
    />
  );
};

export default ModelSelect;
