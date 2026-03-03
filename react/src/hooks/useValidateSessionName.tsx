/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { RuleObject } from 'antd/es/form';
import { FormItemProps } from 'antd/lib';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

export const useValidateSessionName = (
  currentName?: string | null,
): Exclude<FormItemProps['rules'], undefined> => {
  'use memo';
  const { t } = useTranslation();
  return [
    {
      min: 4,
      message: t('session.validation.SessionNameTooShort'),
    },
    {
      max: 64,
      message: t('session.validation.SessionNameTooLong64'),
    },
    {
      validator(_f: RuleObject, value: string) {
        if (_.isEmpty(value)) {
          return Promise.resolve();
        }
        if (!/^\w/.test(value)) {
          return Promise.reject(
            t('session.validation.SessionNameShouldStartWith'),
          );
        }

        if (!/\w$/.test(value)) {
          return Promise.reject(
            t('session.validation.SessionNameShouldEndWith'),
          );
        }

        if (!/^[\w.-]*$/.test(value)) {
          return Promise.reject(
            t('session.validation.SessionNameInvalidCharacter'),
          );
        }
        return Promise.resolve();
      },
    },
    currentName ? { required: true } : {},
  ];
};
