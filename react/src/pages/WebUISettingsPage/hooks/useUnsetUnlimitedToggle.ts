/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useState } from 'react';

/**
 * The Unlimited toggle of a cap whose unset value means no cap. Unticking it
 * stores nothing until a value is entered; `endEntry` leaves that state when a
 * commit stores nothing (a cleared field).
 */
export const useUnsetUnlimitedToggle = (
  hasToggle: boolean,
  value: number | undefined,
) => {
  'use memo';
  const [isEnteringLimit, setIsEnteringLimit] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setIsEnteringLimit(false);
  }
  return {
    isUnlimited: hasToggle && value === undefined && !isEnteringLimit,
    toggle: (checked: boolean) => setIsEnteringLimit(!checked),
    endEntry: () => setIsEnteringLimit(false),
  };
};
