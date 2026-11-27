/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { RuleObject } from '../form-engine';
import { FormItemProps } from '../form-engine';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';

export type SessionNameProblem = 'start' | 'end' | 'characters';

/** The session name's character rules, shared with `bai_prepare_session`. */
export const findSessionNameProblem = (
  name: string,
): SessionNameProblem | null => {
  if (!/^\w/.test(name)) return 'start';
  if (!/\w$/.test(name)) return 'end';
  if (!/^[\w.-]*$/.test(name)) return 'characters';
  return null;
};

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
        const problem = findSessionNameProblem(value);
        if (problem === 'start') {
          return Promise.reject(
            t('session.validation.SessionNameShouldStartWith'),
          );
        }

        if (problem === 'end') {
          return Promise.reject(
            t('session.validation.SessionNameShouldEndWith'),
          );
        }

        if (problem === 'characters') {
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
