/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Stand-ins for the launcher's heavy children. Each keeps the form contract
 * the page relies on (field names) and nothing else.
 */
import { Form } from '../../form-engine';
import { pageRefs, registerPageForm } from './mockState';
import { atom } from 'jotai';
import React from 'react';

/** Registers `vfolderMounts` like the real step (no rule, no V-07 pruning). */
const StorageStepStub: React.FC = () => {
  const form = Form.useFormInstance();
  registerPageForm(form);
  return (
    <Form.Item name="vfolderMounts" noStyle>
      <MountsProbe />
    </Form.Item>
  );
};
const MountsProbe: React.FC<{ value?: unknown }> = ({ value }) => (
  <output data-testid="stub-vfolder-mounts">
    {JSON.stringify(value ?? null)}
  </output>
);

/** "Apply" hands `pageRefs.template` back like a picked history row. */
const SessionTemplateModalStub: React.FC<{
  open?: boolean;
  onRequestClose: (formValue?: Record<string, unknown>) => void;
}> = ({ open, onRequestClose }) =>
  open ? (
    <button
      type="button"
      data-testid="stub-template-apply"
      onClick={() => onRequestClose(pageRefs.template)}
    >
      apply
    </button>
  ) : null;

export const storageStepModule = { default: StorageStepStub };
export const templateModalModule = { default: SessionTemplateModalStub };
export const nullModule = { default: () => null };
export const mainLayoutModule = {
  mainContentDivRefState: atom<React.RefObject<HTMLElement | null>>({
    current: null,
  }),
  default: () => null,
};
