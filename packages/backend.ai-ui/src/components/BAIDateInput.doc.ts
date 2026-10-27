import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [{ name: 'BAIDateInput', uiCommon: 'DateInput', description: 'A date.' }],
  ['date', 'date picker'],
) satisfies ComponentDoc;

export default docs;
