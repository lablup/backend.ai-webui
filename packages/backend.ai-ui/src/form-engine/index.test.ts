import BAIFormItemAdapter from '../components/BAIFormItem';
import FormDefault, {
  BAIFormItem,
  BAIFormItemVisual,
  Form,
  FormItemInputContext,
} from './index';
import * as UiCommonForm from '@lablup/ui-common/Form';
import { describe, expect, it } from 'vitest';

describe('form-engine alias', () => {
  it('resolves to the ui-common engine', () => {
    expect(Form).toBe(UiCommonForm.Form);
    expect(FormDefault).toBe(UiCommonForm.Form);
    expect(FormItemInputContext).toBe(UiCommonForm.FormItemInputContext);
  });

  it('keeps the BUI names for the item and its shell', () => {
    expect(BAIFormItem).toBe(BAIFormItemAdapter);
    expect(BAIFormItemVisual).toBe(UiCommonForm.FormItemVisual);
  });
});
