/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  buildTemplateFieldsValue,
  omitOwnedPaths,
  pickOwnedPaths,
} from './template';
import { describe, expect, it, vi } from 'vitest';

describe('template restore (P-22)', () => {
  it('merges the stored values over the reset object and suffixes the name', () => {
    const suffix = vi.fn(() => 'abcd');
    expect(
      buildTemplateFieldsValue(
        { sessionName: 'tpl', batch: { command: 'ls' }, ports: ['8080'] },
        suffix,
      ),
    ).toEqual({
      sessionName: 'tpl-abcd',
      ports: ['8080'],
      vfolderMounts: [],
      bootstrap_script: '',
      num_of_sessions: 1,
      environments: { manual: '' },
      batch: { enabled: false, command: 'ls', scheduleDate: undefined },
      reuseIfExists: false,
      agent: ['auto'],
    });
  });

  it('H10 [bug-compat] leaves resource fields out, and suffixes no empty name', () => {
    const suffix = vi.fn(() => 'abcd');
    const value = buildTemplateFieldsValue({ sessionType: 'batch' }, suffix);
    expect(value.sessionName).toBe('');
    expect(suffix).not.toHaveBeenCalled();
    expect(value).not.toHaveProperty('resource');
    expect(value).not.toHaveProperty('allocationPreset');
    expect(value).not.toHaveProperty('hpcOptimization');
  });

  it('P-33 migrates legacy mount fields', () => {
    expect(
      buildTemplateFieldsValue(
        {
          mount_ids: ['0123456789abcdef0123456789abcdef'],
          vfoldersNameMap: { '0123456789abcdef0123456789abcdef': 'legacy' },
        },
        () => '',
      ).vfolderMounts,
    ).toEqual([
      {
        vfolderId: '01234567-89ab-cdef-0123-456789abcdef',
        name: 'legacy',
        mountDestination: '',
        subpath: '',
      },
    ]);
  });

  it('splits at owned paths; an owned path the values lack keeps its current value', () => {
    const owned = [['sessionName'], ['batch', 'command'], ['batch', 'timeout']];
    const values = {
      sessionName: 'a',
      batch: { command: 'ls', enabled: false },
      agent: ['auto'],
    };
    expect(omitOwnedPaths(values, owned)).toEqual({
      batch: { enabled: false },
      agent: ['auto'],
    });
    expect(values.batch.command).toBe('ls');
    expect(pickOwnedPaths(values, owned, { batch: { timeout: 30 } })).toEqual({
      sessionName: 'a',
      batch: { command: 'ls', timeout: 30 },
    });
  });
});
