import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAIMultiSelector',
      uiCommon: 'MultiSelector',
      description:
        'Several choices from a static option list; the trigger names the selection.',
    },
  ],
  ['multi select', 'multiple', 'selector'],
) satisfies ComponentDoc;

export default docs;
