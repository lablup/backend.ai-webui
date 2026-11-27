import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAIDateTimeRangeInput',
      uiCommon: 'DateTimeRangeInput',
      description:
        'A start and an end, each a date and a time, with presets and a range limit.',
    },
  ],
  ['date time range', 'range picker', 'period', 'time range'],
) satisfies ComponentDoc;

export default docs;
