/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIDynamicStepInputNumber` on Astryx (to-astryx phase 3, wave 2 / W2-D).

 antd `InputNumber` -> Astryx `NumberInput` (MAPPING §3.17). The public
 contract (`dynamicSteps`, `value`, `onChange`, `min`, `max`, `placeholder`,
 `disabled`, `addonAfter`) is unchanged, and `InputNumberProps` is replaced by
 a locally-declared interface so the module drops out of the antd import graph.

 PILOT-DECISION — **`onStep` has no Astryx counterpart, so the ladder gets
 explicit controls.** MAPPING §3.17 lists `onStep` as NONE. The component's
 entire substance is the non-linear ladder (`1, 2, 4, 8, …`), which antd drove
 through `onStep` with `step={0}` to disable its own arithmetic. Astryx's
 `NumberInput` is a native `<input type="number">` whose browser spinner steps
 LINEARLY and reports nothing, so leaving it in place would silently replace
 the ladder — a P10 regression `tsc` cannot see. The spinner is therefore
 suppressed in CSS and two `IconButton`s drive the same ladder arithmetic,
 ported unchanged (see `astryxNumberStepper.tsx`).

 PILOT-DECISION — **the `useUpdatableState` remount workaround is deleted.**
 It existed because antd's `InputNumber` kept its own internal display string
 and did not always re-derive it from a controlled `value`. Astryx's
 `NumberInput` renders `value` directly, so the timeout + key churn has nothing
 left to fix.

 PILOT-DECISION — **`addonAfter` becomes `units`.** MAPPING §3.17 calls
 `NumberInput units="GiB"` "genuinely better than antd's suffix slot"; both
 `addonAfter` sites pass a plain unit string.
*/
import { nodeToAccessibleLabel } from '../helper/astryxLabel';
import { useBAIi18n } from '../hooks/useBAIi18n';
import {
  AstryxNumberStepper,
  nextLadderIndex,
  type StepDirection,
} from './astryxNumberStepper';
import { InputGroup } from '@astryxdesign/core/InputGroup';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { useControllableValue } from 'ahooks';
import * as _ from 'lodash-es';
import React from 'react';
import type { CSSProperties, ReactNode } from 'react';

export interface BAIDynamicStepInputNumberProps {
  dynamicSteps?: Array<number>;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  disabled?: boolean;
  /** antd's trailing addon — a unit string. */
  addonAfter?: ReactNode;
  /** Accessible name. Hidden when absent (the field usually sits under one). */
  label?: string;
  isLabelHidden?: boolean;
  style?: CSSProperties;
  className?: string;
  [key: `data-${string}`]: string | undefined;
}

const BAIDynamicStepInputNumber: React.FC<BAIDynamicStepInputNumberProps> = ({
  dynamicSteps = [
    0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512,
    1024, 2048, 4096, 8192, 16384, 32768, 65536,
  ],
  min,
  max,
  placeholder,
  disabled,
  addonAfter,
  label,
  isLabelHidden,
  ...inputNumberProps
}) => {
  const { t } = useBAIi18n();
  const [value, setValue] = useControllableValue<number>(inputNumberProps, {
    defaultValue: dynamicSteps[0],
  });

  const handleStep = (direction: StepDirection) => {
    const nextIndex = nextLadderIndex(dynamicSteps, value, direction);
    if (nextIndex < 0 || nextIndex >= dynamicSteps.length) return;
    let nextValue = dynamicSteps[nextIndex];
    if (_.isNumber(min) && nextValue < min) {
      nextValue = min;
    } else if (_.isNumber(max) && nextValue > max) {
      nextValue = max;
    }
    setValue(nextValue);
  };

  const accessibleLabel = label ?? placeholder ?? t('general.Select');

  return (
    <InputGroup
      className="bai-number-stepper"
      label={accessibleLabel}
      isLabelHidden={isLabelHidden ?? label === undefined}
      isDisabled={disabled}
    >
      <NumberInput
        label={accessibleLabel}
        isLabelHidden
        value={value}
        onChange={(next) => setValue(next ?? 0)}
        min={min}
        max={max}
        units={
          addonAfter === undefined
            ? undefined
            : nodeToAccessibleLabel(addonAfter)
        }
        placeholder={placeholder}
        isDisabled={disabled}
        width="100%"
      />
      <AstryxNumberStepper
        onStep={handleStep}
        isDisabled={disabled}
        increaseLabel={t('general.Increase')}
        decreaseLabel={t('general.Decrease')}
      />
    </InputGroup>
  );
};

export default BAIDynamicStepInputNumber;
