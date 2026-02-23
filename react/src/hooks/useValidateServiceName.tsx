/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { type FormItemProps } from 'antd';
import type { RuleObject } from 'antd/es/form';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

export const useValidateServiceName = (): Exclude<
  FormItemProps['rules'],
  undefined
> => {
  'use memo';
  const { t } = useTranslation();
  return [
    {
      min: 4,
      message: t('modelService.ServiceNameMinLength'),
    },
    {
      max: 24,
      message: t('modelService.ServiceNameMaxLength'),
      type: 'string',
    },
    {
      validator(_f: RuleObject, value: string) {
        if (_.isEmpty(value)) {
          return Promise.resolve();
        }
        if (!/^\w/.test(value)) {
          return Promise.reject(t('modelService.ServiceNameShouldStartWith'));
        }

        if (!/\w$/.test(value)) {
          return Promise.reject(t('modelService.ServiceNameShouldEndWith'));
        }

        if (!/^[\w-]*$/.test(value)) {
          return Promise.reject(t('modelService.ServiceNameInvalidCharacter'));
        }
        return Promise.resolve();
      },
    },
    {
      required: true,
    },
  ];
};
