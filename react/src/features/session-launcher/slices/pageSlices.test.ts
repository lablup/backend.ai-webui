/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// Pure tests for the page-level slices; rows are Dependency map v2 ids (#10454).
import {
  compose,
  pathKey,
  transition,
  type AppliedPatch,
  type LauncherEvent,
  type LauncherValues,
} from '../model';
import { batchSlice } from './batch';
import { networkSlice } from './network';
import { sessionSlice } from './session';
import { storageSlice } from './storage';
import { describe, expect, it } from 'vitest';

const model = compose([sessionSlice, batchSlice, networkSlice, storageSlice]);

const run = (values: LauncherValues, event: LauncherEvent) =>
  transition(model, { values, provenance: {} }, event, {});

const summary = (patches: AppliedPatch[]) =>
  patches.map((patch) => [
    pathKey(patch.path),
    patch.value,
    patch.write.method,
    patch.write.validateAfter?.map(pathKey),
  ]);

const LATER = '2026-10-20T00:02:00.000Z';

describe('page slices', () => {
  it('have no rules: every page write is an intent (ADR 0013 order test)', () => {
    expect(model.rules.map((rule) => rule.id)).toEqual([]);
    expect(Object.keys(model.intents)).toEqual([
      'scheduleToggled',
      'timeoutToggled',
      'hpcAutoToggled',
      'folderCreated',
      'legacyMountsDiscarded',
    ]);
  });

  describe('P-08 schedule toggle', () => {
    const toggle = (checked: boolean): LauncherEvent => ({
      type: 'scheduleToggled',
      payload: { checked, defaultScheduleDate: LATER },
    });

    it('enabling with no date proposes now + 2 min, then validates', () => {
      expect(summary(run({ batch: {} }, toggle(true)).patches)).toEqual([
        ['batch.scheduleDate', LATER, 'setFieldValue', undefined],
        ['batch.scheduleDate', undefined, 'none', ['batch.scheduleDate']],
      ]);
    });

    it('enabling keeps a date already set and only validates', () => {
      const values = { batch: { scheduleDate: '2030-01-01T00:00:00.000Z' } };
      expect(summary(run(values, toggle(true)).patches)).toEqual([
        ['batch.scheduleDate', undefined, 'none', ['batch.scheduleDate']],
      ]);
    });

    it('disabling clears the date, then validates', () => {
      const values = { batch: { scheduleDate: LATER } };
      expect(summary(run(values, toggle(false)).patches)).toEqual([
        ['batch.scheduleDate', undefined, 'setFieldValue', undefined],
        ['batch.scheduleDate', undefined, 'none', ['batch.scheduleDate']],
      ]);
    });
  });

  it('P-12 disabling the timeout clears it, then validates; enabling only validates', () => {
    const values = { batch: { timeout: 30 } };
    expect(
      summary(run(values, { type: 'timeoutToggled', payload: false }).patches),
    ).toEqual([
      ['batch.timeout', undefined, 'setFieldValue', undefined],
      ['batch.timeout', undefined, 'none', ['batch.timeout']],
    ]);
    expect(
      summary(run(values, { type: 'timeoutToggled', payload: true }).patches),
    ).toEqual([['batch.timeout', undefined, 'none', ['batch.timeout']]]);
  });

  it('P-17 the HPC switch writes the thread defaults with setFieldsValue', () => {
    // `Form.Item` has written `autoEnabled` before the handler runs.
    const off = { hpcOptimization: { autoEnabled: false } };
    expect(
      summary(run(off, { type: 'hpcAutoToggled', payload: false }).patches),
    ).toEqual([
      ['hpcOptimization.OMP_NUM_THREADS', '1', 'setFieldsValue', undefined],
      [
        'hpcOptimization.OPENBLAS_NUM_THREADS',
        '1',
        'setFieldsValue',
        undefined,
      ],
    ]);
    const on = {
      hpcOptimization: {
        autoEnabled: true,
        OMP_NUM_THREADS: '1',
        OPENBLAS_NUM_THREADS: '1',
      },
    };
    expect(
      run(on, { type: 'hpcAutoToggled', payload: true }).state.values,
    ).toEqual({
      hpcOptimization: {
        autoEnabled: true,
        OMP_NUM_THREADS: undefined,
        OPENBLAS_NUM_THREADS: undefined,
      },
    });
  });

  describe('V-09 folder created', () => {
    const created: LauncherEvent = {
      type: 'folderCreated',
      payload: { vfolderId: 'id-2', name: 'new' },
    };

    it('appends the folder with setFieldValue', () => {
      const values = { vfolderMounts: [{ vfolderId: 'id-1', name: 'old' }] };
      expect(summary(run(values, created).patches)).toEqual([
        [
          'vfolderMounts',
          [
            { vfolderId: 'id-1', name: 'old' },
            {
              vfolderId: 'id-2',
              name: 'new',
              mountDestination: '',
              subpath: '',
            },
          ],
          'setFieldValue',
          undefined,
        ],
      ]);
    });

    it('skips a folder already mounted', () => {
      const values = { vfolderMounts: [{ vfolderId: 'id-2', name: 'new' }] };
      expect(run(values, created).patches).toEqual([]);
    });
  });

  it('P-28 drops the legacy mounts value with setFieldValue', () => {
    expect(
      summary(
        run({ mounts: ['a'] }, { type: 'legacyMountsDiscarded' }).patches,
      ),
    ).toEqual([['mounts', undefined, 'setFieldValue', undefined]]);
  });

  it('P-21 P-22 a restore writes only the fields that change, and marks them restored', () => {
    const current = {
      sessionName: 'a',
      ports: ['8080'],
      batch: { command: 'x' },
    };
    const { patches, state } = run(current, {
      type: 'restored',
      from: 'template',
      values: { sessionName: 'b', ports: ['8080'], batch: { command: 'x' } },
    });
    expect(summary(patches)).toEqual([
      ['sessionName', 'b', 'setFieldsValue', undefined],
    ]);
    expect(state.provenance['ports']).toBe('restored');
  });
});
