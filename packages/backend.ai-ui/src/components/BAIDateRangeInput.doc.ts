import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAIDateRangeInput',
      uiCommon: 'DateRangeInput',
      description: 'A start and an end date.',
    },
  ],
  ['date range', 'range picker', 'period'],
) satisfies ComponentDoc;

export default docs;
