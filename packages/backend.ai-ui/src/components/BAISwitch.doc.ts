import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAISwitch',
      uiCommon: 'Switch',
      description: 'An on/off toggle; visible text goes in children.',
    },
  ],
  ['switch', 'toggle'],
) satisfies ComponentDoc;

export default docs;
