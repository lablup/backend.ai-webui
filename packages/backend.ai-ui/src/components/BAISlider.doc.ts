import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAISlider',
      uiCommon: 'Slider',
      description: 'A value or a range on a track.',
    },
  ],
  ['slider', 'range'],
) satisfies ComponentDoc;

export default docs;
