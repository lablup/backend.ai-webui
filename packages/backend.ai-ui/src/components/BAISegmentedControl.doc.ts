import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAISegmentedControl',
      uiCommon: 'SegmentedControl',
      description:
        'A single choice shown as segments; its options are BAISegmentedControlItem.',
    },
  ],
  ['segmented control', 'toggle group', 'radio button'],
) satisfies ComponentDoc;

export default docs;
