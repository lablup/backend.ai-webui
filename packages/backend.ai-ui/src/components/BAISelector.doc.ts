import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAISelector',
      uiCommon: 'Selector',
      description:
        'A single choice from a static option list; opens below the trigger. Relay-backed or paged lists use BAISelect / BAIComplexSelect instead.',
    },
  ],
  ['select', 'selector', 'dropdown'],
) satisfies ComponentDoc;

export default docs;
