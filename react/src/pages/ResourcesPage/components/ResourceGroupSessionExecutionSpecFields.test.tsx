/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  toKernelExecutionSpecInput,
  toSessionExecutionSpecFormValue,
} from './ResourceGroupSessionExecutionSpecFields';

const spec = {
  imageId: 'image-1',
  resources: [{ resourceType: 'cpu', quantity: '1' }],
  resourceOpts: null,
  startupCommand: null,
  bootstrapScript: 'pip install -r requirements.txt',
  startsAt: null,
  batchTimeoutSec: null,
};

describe('bootstrap script outside the batch session toggle', () => {
  it('does not open the batch box for a spec with only a bootstrap script', () => {
    expect(toSessionExecutionSpecFormValue(spec).isBatchSession).toBe(false);
  });

  it.each([
    { startupCommand: 'python train.py' },
    { startsAt: '2026-11-01T00:00:00Z' },
    { batchTimeoutSec: 3600 },
  ])('opens the batch box for a stored batch field (%o)', (batchField) => {
    expect(
      toSessionExecutionSpecFormValue({ ...spec, ...batchField })
        .isBatchSession,
    ).toBe(true);
  });

  it('keeps the bootstrap script when the batch box is unticked', () => {
    const value = toSessionExecutionSpecFormValue({
      ...spec,
      startupCommand: 'python train.py',
    });
    const input = toKernelExecutionSpecInput({
      ...value,
      isBatchSession: false,
    });
    expect(input?.bootstrapScript).toBe('pip install -r requirements.txt');
    expect(input?.startupCommand).toBeNull();
  });
});
