/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import { Token } from '@lablup/ui-common/Token';
import React from 'react';

export interface BAIBooleanTokenProps {
  /** Non-boolean values render `fallback`. */
  value: boolean | null | undefined;
  trueLabel?: string;
  falseLabel?: string;
  fallback?: React.ReactNode;
}

/**
 * An on/off setting as a Token (ADR 0007): green for true, the quiet default
 * outline for false, and `fallback` when the value is not a boolean.
 */
const BAIBooleanToken: React.FC<BAIBooleanTokenProps> = ({
  value,
  fallback = '-',
  trueLabel = 'True',
  falseLabel = 'False',
}) => {
  if (typeof value !== 'boolean') {
    return fallback;
  }
  return value ? (
    <Token color="green" label={trueLabel} />
  ) : (
    <Token color="default" label={falseLabel} />
  );
};

export default BAIBooleanToken;
