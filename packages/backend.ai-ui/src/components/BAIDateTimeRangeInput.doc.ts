import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAIDateTimeRangeInput',
      uiCommon: 'DateTimeRangeInput',
      description: 'A start and an end date and time, with optional presets.',
    },
  ],
  ['date time range', 'time range', 'period', 'range picker'],
) satisfies ComponentDoc;

export default docs;
