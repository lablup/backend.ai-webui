/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Characterization tests for the session launcher's resource section
 * (`ResourceAllocationFormItems`, rules R-xx / hazards H-xx in the launcher
 * map). They pin today's behaviour, bugs included (`[bug-compat]`), so a
 * rewrite can be checked against it. Expected values were observed on
 * origin/main 5b80b205e8.
 */
import '../../../__test__/matchMedia.mock.js';
import { renderResourceForm } from './harness';
import {
  ACCEL_SLOT_DETAILS,
  BASE_SLOT_DETAILS,
  emptyCheck,
  type GqlPreset,
  resetScenario,
  type RestPreset,
  scenario,
  spies,
} from './mockState';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('react-i18next', async () => (await import('./mockState')).i18nMock());
vi.mock('../../hooks', async (importOriginal) =>
  (await import('./mockState')).mockHooksModule(await importOriginal()),
);
vi.mock('../../hooks/backendai', async (importOriginal) =>
  (await import('./mockState')).mockBackendaiHooksModule(
    await importOriginal(),
  ),
);
vi.mock('../../hooks/hooksUsingRelay', async (importOriginal) =>
  (await import('./mockState')).mockHooksUsingRelayModule(
    await importOriginal(),
  ),
);
vi.mock('../../hooks/useCurrentProject', async (importOriginal) =>
  (await import('./mockState')).mockCurrentProjectModule(
    await importOriginal(),
  ),
);
vi.mock(
  '../../../../packages/backend.ai-ui/src/hooks/useProjectResourceGroups',
  async (importOriginal) =>
    (await import('./mockState')).mockProjectResourceGroupsModule(
      await importOriginal(),
    ),
);

const GiB = 1024 ** 3;

interface PresetSpec {
  id: string;
  name: string;
  cpu: number;
  memG: number;
  shmemG?: number;
  accel?: Record<string, number>;
  rg?: string | null;
}

const toSlots = (p: PresetSpec) => ({
  cpu: String(p.cpu),
  mem: String(p.memG * GiB),
  ..._mapValuesToString(p.accel ?? {}),
});
const _mapValuesToString = (o: Record<string, number>) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)]));

const gqlPreset = (p: PresetSpec): GqlPreset => ({
  id: p.id,
  name: p.name,
  resource_slots: JSON.stringify(toSlots(p)),
  shared_memory: p.shmemG ? String(p.shmemG * GiB) : null,
  scaling_group_name: p.rg ?? null,
});
const restPreset = (p: PresetSpec): RestPreset => ({
  id: p.id,
  name: p.name,
  resource_slots: toSlots(p),
  shared_memory: p.shmemG ? String(p.shmemG * GiB) : null,
  allocatable: true,
});

/** Same presets on both sources (GraphQL list + REST check-presets). */
const usePresets = (
  specs: PresetSpec[],
  checkOverrides: Parameters<typeof emptyCheck>[0] = {},
) => {
  scenario.gqlPresets = specs.map(gqlPreset);
  scenario.checkPresets = () =>
    emptyCheck({ presets: specs.map(restPreset), ...checkOverrides });
};

const SMALL: PresetSpec = { id: 'id-small', name: 'small', cpu: 1, memG: 2 };
const LARGE: PresetSpec = { id: 'id-large', name: 'large', cpu: 4, memG: 8 };
const FOUR_GIB: PresetSpec = {
  id: 'id-four',
  name: 'four',
  cpu: 2,
  memG: 4,
  shmemG: 1,
};

const image = (
  limits: Array<{ key: string; min: string }> = [],
  supported_accelerators: string[] = [],
) => ({
  name: 'cr.backend.ai/stable/python:3.11',
  resource_limits: limits.map((l) => ({ ...l, max: null })),
  supported_accelerators,
});

describe('resource section characterization (ResourceAllocationFormItems)', () => {
  beforeEach(() => {
    resetScenario();
  });

  describe('preset auto-select (R-03) and apply (R-09/R-10)', () => {
    it('R-03 R-09 auto-select picks an allocatable preset and applies its slots', async () => {
      usePresets([LARGE]);
      const { read } = await renderResourceForm();
      expect(read.values().allocationPreset).toBe('id-large');
      expect(read.values().resource).toEqual({
        cpu: 4,
        mem: '8g',
        shmem: '1g',
        accelerator: 0,
      });
      expect(read.values().enabledAutomaticShmem).toBe(true);
    });

    it('R-03 [bug-compat sort] auto-pick sorts by code point, not by locale', async () => {
      usePresets([
        { id: 'id-lower', name: 'a-preset', cpu: 1, memG: 1 },
        { id: 'id-upper', name: 'B-preset', cpu: 2, memG: 2 },
      ]);
      const { read } = await renderResourceForm();
      // `_.sortBy(…, 'name')`: 'B' (66) < 'a' (97). localeCompare would pick a-preset.
      expect(read.values().allocationPreset).toBe('id-upper');
      expect(read.values().resource.cpu).toBe(2);
    });

    it('R-09 a preset with shared_memory sets shmem from the preset and turns automatic shmem off', async () => {
      usePresets([{ ...SMALL, shmemG: 0.5 }]);
      const { read } = await renderResourceForm();
      expect(read.values().allocationPreset).toBe('id-small');
      expect(read.values().resource).toEqual({
        cpu: 1,
        mem: '2g',
        shmem: '0.5g',
        accelerator: 0,
      });
      expect(read.values().enabledAutomaticShmem).toBe(false);
    });

    it('R-10 picking another preset in the select applies its slots', async () => {
      usePresets([SMALL, LARGE]);
      const { read, drive } = await renderResourceForm();
      expect(read.values().allocationPreset).toBe('id-large');
      await drive.select('resourcePreset.ResourcePresets', 'small');
      expect(read.values().allocationPreset).toBe('id-small');
      expect(read.values().resource).toEqual({
        cpu: 1,
        mem: '2g',
        shmem: '64m',
        accelerator: 0,
      });
    });

    it('R-10 picking "custom" keeps the current resource values', async () => {
      usePresets([LARGE]);
      const { read, drive } = await renderResourceForm();
      await drive.select(
        'resourcePreset.ResourcePresets',
        'session.launcher.CustomAllocation',
      );
      expect(read.values().allocationPreset).toBe('custom');
      expect(read.values().resource).toEqual({
        cpu: 4,
        mem: '8g',
        shmem: '1g',
        accelerator: 0,
      });
    });

    it('R-03 no allocatable preset + custom allowed → minimum-required', async () => {
      usePresets([LARGE], { keypair_limits: { cpu: '2', mem: 'Infinity' } });
      const { read } = await renderResourceForm();
      expect(read.values().allocationPreset).toBe('minimum-required');
    });

    it('R-03 R-32 no allocatable preset + custom disallowed → null', async () => {
      scenario.config.allowCustomResourceAllocation = false;
      usePresets([LARGE], { keypair_limits: { cpu: '2', mem: 'Infinity' } });
      const { read } = await renderResourceForm();
      expect(read.values().allocationPreset).toBeNull();
    });

    it('R-03 without enableResourcePresets falls back to minimum-required even with presets', async () => {
      usePresets([LARGE]);
      const { read } = await renderResourceForm({ host: 'bare' });
      expect(read.values().allocationPreset).toBe('minimum-required');
    });

    it('R-03 H2 [bug-compat] a restored resource under "auto-select" is overwritten by the auto-picked preset', async () => {
      usePresets([SMALL]);
      const { read } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'auto-select',
          resource: { cpu: 7, mem: '13g', shmem: '1g', accelerator: 0 },
        },
      });
      expect(read.values().allocationPreset).toBe('id-small');
      expect(read.values().resource.cpu).toBe(1);
      expect(read.values().resource.mem).toBe('2g');
    });

    it('R-01 a restored custom preset with resource survives mount untouched', async () => {
      usePresets([SMALL]);
      const { read } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'custom',
          resource: { cpu: 7, mem: '13g', shmem: '1g', accelerator: 0 },
        },
      });
      expect(read.values().allocationPreset).toBe('custom');
      expect(read.values().resource).toEqual({
        cpu: 7,
        mem: '13g',
        shmem: '1g',
        accelerator: 0,
      });
    });

    it('R-03 R-31 auto-select waits for the RG slot details and runs when they arrive', async () => {
      usePresets([SMALL]);
      scenario.slotsByRG['rg-a'] = undefined;
      const { read, drive } = await renderResourceForm();
      expect(read.values().allocationPreset).toBe('auto-select');
      // R-31: cpu / mem items are not mounted while the slots load.
      expect(read.hasField('CPU')).toBe(false);
      await drive.scenario((s) => {
        s.slotsByRG['rg-a'] = BASE_SLOT_DETAILS;
      });
      await waitFor(() =>
        expect(read.values().allocationPreset).toBe('id-small'),
      );
      expect(read.hasField('CPU')).toBe(true);
    });

    it("R-09 picking a preset rewrites a same-size MiB memory value to the preset's GiB string", async () => {
      usePresets([FOUR_GIB]);
      const { read, drive } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'custom',
          resource: { cpu: 1, mem: '4096m', shmem: '1024m', accelerator: 0 },
        },
      });
      expect(read.values().resource.mem).toBe('4096m');
      await drive.select('resourcePreset.ResourcePresets', 'four');
      expect(read.values().allocationPreset).toBe('id-four');
      // The stored string picks the unit the memory input shows (GiB here).
      expect(read.values().resource.mem).toBe('4g');
      expect(read.values().resource.shmem).toBe('1g');
    });

    it("R-03 R-09 auto-select rewrites a restored same-size MiB memory value to the preset's GiB string", async () => {
      usePresets([FOUR_GIB]);
      const { read } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'auto-select',
          resource: { cpu: 1, mem: '4096m', shmem: '1024m', accelerator: 0 },
        },
      });
      expect(read.values().allocationPreset).toBe('id-four');
      expect(read.values().resource.mem).toBe('4g');
      expect(read.values().resource.shmem).toBe('1g');
    });
  });

  describe('preset ↔ resource group (R-49/R-50, H28, H30)', () => {
    it('R-49 a restored preset scoped to another RG fails validation', async () => {
      usePresets([SMALL, { ...LARGE, rg: 'rg-b' }]);
      const { read, form } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'id-large',
          resource: { cpu: 4, mem: '8g', shmem: '1g', accelerator: 0 },
        },
      });
      await act(async () => {
        await form()
          .validateFields(['allocationPreset'])
          .catch(() => {});
      });
      expect(read.fieldErrors('allocationPreset')).toEqual([
        'resourcePreset.PresetOnlyAvailableInResourceGroup',
      ]);
      expect(read.values().allocationPreset).toBe('id-large');
    });

    it('H28 [bug-compat] a legacy preset NAME in the URL stays unmapped and validates', async () => {
      usePresets([SMALL]);
      const { read, form } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'small',
          resource: { cpu: 3, mem: '5g', shmem: '64m', accelerator: 0 },
        },
      });
      await act(async () => {
        await form()
          .validateFields()
          .catch(() => {});
      });
      expect(read.values().allocationPreset).toBe('small');
      expect(read.values().resource.cpu).toBe(3);
      expect(read.fieldErrors('allocationPreset')).toEqual([]);
    });

    it('H30 [bug-compat] auto-pick ignores preset scope and can pick another RG’s preset', async () => {
      scenario.gqlPresets = [
        gqlPreset({ ...SMALL, name: 'zz-global' }),
        gqlPreset({ ...LARGE, name: 'aa-rg-b', rg: 'rg-b' }),
      ];
      scenario.checkPresets = () =>
        emptyCheck({
          presets: [
            restPreset({ ...SMALL, name: 'zz-global' }),
            restPreset({ ...LARGE, name: 'aa-rg-b' }),
          ],
        });
      const { read, form } = await renderResourceForm();
      expect(read.values().allocationPreset).toBe('id-large');
      await act(async () => {
        await form()
          .validateFields(['allocationPreset'])
          .catch(() => {});
      });
      expect(read.fieldErrors('allocationPreset')).toEqual([
        'resourcePreset.PresetOnlyAvailableInResourceGroup',
      ]);
    });

    it('R-50 changing the RG in the select re-validates an untouched preset', async () => {
      usePresets([{ ...SMALL, rg: 'rg-a' }]);
      const { read, drive } = await renderResourceForm();
      expect(read.values().allocationPreset).toBe('id-small');
      await drive.select('session.ResourceGroup', 'rg-b');
      await waitFor(() => expect(read.values().resourceGroup).toBe('rg-b'));
      await waitFor(() =>
        expect(read.fieldErrors('allocationPreset')).toEqual([
          'resourcePreset.PresetOnlyAvailableInResourceGroup',
        ]),
      );
      expect(read.values().allocationPreset).toBe('id-small');
    });
    it('R-03 [bug-compat] presets arriving for a newly selected RG do not re-run auto-select after it settled on minimum-required', async () => {
      scenario.gqlPresets = [gqlPreset(LARGE)];
      scenario.checkPresets = (params) =>
        params.scaling_group === 'rg-b'
          ? emptyCheck({ presets: [restPreset(LARGE)] })
          : emptyCheck({ presets: [] });
      const { read, drive } = await renderResourceForm();
      expect(read.values().allocationPreset).toBe('minimum-required');
      const largeOption = async () =>
        (await drive.options('resourcePreset.ResourcePresets')).find((o) =>
          o.label.startsWith('large'),
        );
      expect((await largeOption())?.disabled).toBe(true);
      await drive.select('session.ResourceGroup', 'rg-b');
      await waitFor(() => expect(read.values().resourceGroup).toBe('rg-b'));
      // Only rg-b's check-presets result makes `large` allocatable.
      for (let i = 0; (await largeOption())?.disabled !== false; i++) {
        if (i >= 30) throw new Error('rg-b presets never applied');
        await drive.settle(100);
      }
      expect(read.values().allocationPreset).toBe('minimum-required');
    });

    it('R-35 an RG outside the accessible list is checked without scaling_group', async () => {
      await renderResourceForm({
        initialValues: { resourceGroup: 'rg-x' },
      });
      // R-34 later clears the RG, and that call has no scaling_group either.
      expect(spies.checkPresetsCalls[0]).toEqual({ group: 'project-a' });
      expect(spies.checkPresetsCalls).not.toContainEqual({
        group: 'project-a',
        scaling_group: 'rg-x',
      });
    });

    it('R-34 an RG missing from the project list is reset to undefined', async () => {
      const { read } = await renderResourceForm({
        initialValues: { resourceGroup: 'rg-x' },
      });
      await waitFor(() => expect(read.values().resourceGroup).toBeUndefined());
    });
  });

  describe('minimum-required (R-05/R-08, H4)', () => {
    it('R-01 R-05 minimum-required restored from the URL applies the image minimums on mount', async () => {
      const { read } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'minimum-required',
          resource: { cpu: 6, mem: '12g', shmem: '1g', accelerator: 0 },
          environments: {
            image: image([
              { key: 'cpu', min: '2' },
              { key: 'mem', min: '1g' },
            ]),
          },
        },
      });
      expect(read.values().allocationPreset).toBe('minimum-required');
      expect(read.values().resource).toEqual({
        cpu: 2,
        mem: '1.0625g',
        shmem: '64m',
        accelerator: 0,
      });
    });

    it('R-05 H4 image change re-applies minimums under minimum-required', async () => {
      const { read, drive } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'minimum-required',
          environments: { image: image([{ key: 'cpu', min: '1' }]) },
        },
      });
      expect(read.values().resource.cpu).toBe(1);
      await drive.setFieldValue(
        ['environments', 'image'],
        image([
          { key: 'cpu', min: '3' },
          { key: 'mem', min: '2g' },
        ]),
      );
      await drive.settle();
      expect(read.values().resource.cpu).toBe(3);
      expect(read.values().resource.mem).toBe('2.0625g');
    });

    it('R-05 H4 [bug-compat] image change under custom does not raise values below the new minimum', async () => {
      const { read, drive } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'custom',
          resource: { cpu: 1, mem: '1g', shmem: '64m', accelerator: 0 },
          environments: { image: image([{ key: 'cpu', min: '1' }]) },
        },
      });
      await drive.setFieldValue(
        ['environments', 'image'],
        image([{ key: 'cpu', min: '3' }]),
      );
      await drive.settle();
      expect(read.values().resource.cpu).toBe(1);
      expect(read.values().allocationPreset).toBe('custom');
    });
  });

  describe('user edits (R-13..R-16, H14, H15)', () => {
    it('R-13 H14 [bug-compat] focus + blur on CPU without typing flips the preset to custom', async () => {
      usePresets([LARGE]);
      const { read, drive } = await renderResourceForm();
      expect(read.values().allocationPreset).toBe('id-large');
      await drive.focusBlur('CPU');
      expect(read.values().allocationPreset).toBe('custom');
      expect(read.values().resource.cpu).toBe(4);
    });

    it('R-46 H14 typing a fraction into CPU rounds on blur and flips to custom', async () => {
      usePresets([LARGE]);
      const { read, drive } = await renderResourceForm();
      await drive.type('CPU', '2.6');
      await drive.blur('CPU');
      expect(read.values().resource.cpu).toBe(3);
      expect(read.values().allocationPreset).toBe('custom');
    });

    it('R-13 the CPU stepper flips the preset to custom', async () => {
      usePresets([LARGE]);
      const { read, drive } = await renderResourceForm();
      await drive.step('CPU', 1);
      expect(read.values().resource.cpu).toBe(5);
      expect(read.values().allocationPreset).toBe('custom');
    });

    it('R-14 R-06 typing memory ≥ 4g sets automatic shmem to 1g', async () => {
      usePresets([SMALL]);
      const { read, drive } = await renderResourceForm();
      await drive.type('session.launcher.Memory', '6');
      await drive.blur('session.launcher.Memory');
      // The slider input stores two decimals.
      expect(read.values().resource.mem).toBe('6.00g');
      expect(read.values().resource.shmem).toBe('1g');
      expect(read.values().allocationPreset).toBe('custom');
    });

    it('R-14 R-06 typing memory < 4g sets automatic shmem to 64m', async () => {
      usePresets([LARGE]);
      const { read, drive } = await renderResourceForm();
      expect(read.values().resource.shmem).toBe('1g');
      await drive.type('session.launcher.Memory', '3');
      await drive.blur('session.launcher.Memory');
      expect(read.values().resource.mem).toBe('3.00g');
      expect(read.values().resource.shmem).toBe('64m');
    });

    it('R-06 the 1g rule also needs mem ≥ image min + 1g', async () => {
      const { read, drive } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'custom',
          resource: { cpu: 1, mem: '2g', shmem: '64m', accelerator: 0 },
          environments: { image: image([{ key: 'mem', min: '4g' }]) },
        },
      });
      await drive.type('session.launcher.Memory', '4.5');
      await drive.blur('session.launcher.Memory');
      expect(read.values().resource.mem).toBe('4.50g');
      expect(read.values().resource.shmem).toBe('64m');
    });

    it('R-16 turning automatic shmem on re-derives shmem from memory and flips to custom', async () => {
      usePresets([{ ...LARGE, shmemG: 0.5 }]);
      const { read } = await renderResourceForm();
      expect(read.values().enabledAutomaticShmem).toBe(false);
      expect(read.values().resource.shmem).toBe('0.5g');
      await act(async () => {
        await userEvent
          .setup({ delay: null })
          .click(screen.getByRole('switch', { name: 'general.Manual' }));
      });
      expect(read.values().enabledAutomaticShmem).toBe(true);
      expect(read.values().resource.shmem).toBe('1g');
      expect(read.values().allocationPreset).toBe('custom');
    });

    it('R-15 H15 shmem edit flips to custom when custom allocation is allowed', async () => {
      usePresets([{ ...LARGE, shmemG: 1 }]);
      const { read, drive } = await renderResourceForm();
      expect(read.values().enabledAutomaticShmem).toBe(false);
      await drive.type('session.launcher.Memory', '2', 1);
      await drive.blur('session.launcher.Memory', 1);
      expect(read.values().resource.shmem).toBe('2g');
      expect(read.values().allocationPreset).toBe('custom');
    });

    it('R-15 H15 shmem edit keeps the preset when custom allocation is disallowed', async () => {
      scenario.config.allowCustomResourceAllocation = false;
      usePresets([{ ...LARGE, shmemG: 1 }]);
      const { read, drive } = await renderResourceForm();
      await drive.type('session.launcher.Memory', '2', 1);
      await drive.blur('session.launcher.Memory', 1);
      expect(read.values().resource.shmem).toBe('2g');
      expect(read.values().allocationPreset).toBe('id-large');
    });

    it('R-15 H15 [bug-compat] [unreachable: CPU item is hidden when custom allocation is disallowed] CPU edit flips to custom even when custom allocation is disallowed', async () => {
      scenario.config.allowCustomResourceAllocation = false;
      usePresets([LARGE]);
      const { read, drive } = await renderResourceForm();
      await drive.step('CPU', -1);
      expect(read.values().allocationPreset).toBe('custom');
    });
  });

  describe('validation (H3, H18, R-43)', () => {
    it('H3 [bug-compat] shmem equal to memory passes the hard rule and only warns', async () => {
      const { read, form } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'custom',
          enabledAutomaticShmem: false,
          resource: { cpu: 1, mem: '2g', shmem: '2g', accelerator: 0 },
        },
      });
      await act(async () => {
        await form()
          .validateFields()
          .catch(() => {});
      });
      expect(read.fieldErrors(['resource', 'shmem'])).toEqual([]);
      expect(read.fieldWarnings(['resource', 'shmem'])).toEqual([
        'session.launcher.SHMEMShouldBeLessThanHalfOfAppMemory',
      ]);
    });

    it('R-30 shmem greater than memory is an error', async () => {
      const { read, form } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'custom',
          enabledAutomaticShmem: false,
          resource: { cpu: 1, mem: '2g', shmem: '3g', accelerator: 0 },
        },
      });
      await act(async () => {
        await form()
          .validateFields()
          .catch(() => {});
      });
      expect(read.fieldErrors(['resource', 'shmem'])).toEqual([
        'resourcePreset.SHMEMShouldBeSmallerThanMemory',
      ]);
    });

    it('R-29 H18 [bug-compat] with no memory limit the slider caps at 32g while the validator accepts more', async () => {
      delete scenario.config.maxMemoryPerContainer;
      const { read, form, drive } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'custom',
          resource: { cpu: 1, mem: '100g', shmem: '1g', accelerator: 0 },
        },
      });
      expect(drive.input('session.launcher.Memory')).toHaveAttribute(
        'aria-valuemax',
        '32',
      );
      await act(async () => {
        await form()
          .validateFields()
          .catch(() => {});
      });
      expect(read.fieldErrors(['resource', 'mem'])).toEqual([]);
      expect(read.values().resource.mem).toBe('100g');
    });

    it('R-28 memory above maxMemoryPerContainer is an error', async () => {
      const { read, form } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'custom',
          resource: { cpu: 1, mem: '100g', shmem: '1g', accelerator: 0 },
        },
      });
      await act(async () => {
        await form()
          .validateFields()
          .catch(() => {});
      });
      expect(read.fieldErrors(['resource', 'mem'])).toEqual([
        'general.MaxValueNotification',
      ]);
    });

    it('R-43 cluster size 1 in multi-node warns about the single-node conversion', async () => {
      const { read, form } = await renderResourceForm({
        initialValues: { allocationPreset: 'custom' },
      });
      await act(async () => {
        await form()
          .validateFields()
          .catch(() => {});
      });
      expect(read.fieldWarnings('cluster_size')).toEqual([
        'session.launcher.ClusterSizeOneMultiNodeConvertInfo',
      ]);
    });

    it('R-42 no capacity warning while remaining resources are unlimited', async () => {
      const { read, form } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'custom',
          cluster_mode: 'single-node',
          cluster_size: 3,
          resource: { cpu: 4, mem: '2g', shmem: '64m', accelerator: 0 },
        },
      });
      await act(async () => {
        await form()
          .validateFields()
          .catch(() => {});
      });
      expect(read.fieldWarnings('cluster_size')).toEqual([]);
    });

    it('R-42 R-43 cluster size above remaining capacity warns ClusterSizeExceedsImmediateCapacity', async () => {
      scenario.checkPresets = () =>
        emptyCheck({ keypair_remaining: { cpu: '8', mem: 'Infinity' } });
      const { read, form } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'custom',
          cluster_mode: 'single-node',
          cluster_size: 3,
          resource: { cpu: 4, mem: '2g', shmem: '64m', accelerator: 0 },
        },
      });
      await act(async () => {
        await form()
          .validateFields()
          .catch(() => {});
      });
      expect(read.fieldWarnings('cluster_size')).toEqual([
        'session.launcher.ClusterSizeExceedsImmediateCapacity',
      ]);
    });

    it('R-41 H20 changing cluster mode validates the whole form', async () => {
      const { read, drive } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'custom',
          resource: { cpu: 1, mem: '100g', shmem: '1g', accelerator: 0 },
        },
      });
      expect(read.fieldErrors(['resource', 'mem'])).toEqual([]);
      await drive.clickRadio('single-node');
      await drive.settle();
      expect(read.values().cluster_mode).toBe('single-node');
      expect(read.fieldErrors(['resource', 'mem'])).toEqual([
        'general.MaxValueNotification',
      ]);
    });
  });

  describe('accelerators (R-02, R-04, R-07, R-18, R-19)', () => {
    beforeEach(() => {
      scenario.resourceSlots = {
        cpu: 'count',
        mem: 'bytes',
        'cuda.device': 'count',
      };
      scenario.slotsByRG = {
        'rg-a': {
          ...BASE_SLOT_DETAILS,
          'cuda.device': ACCEL_SLOT_DETAILS['cuda.device'],
        },
        'rg-b': BASE_SLOT_DETAILS,
      };
    });

    it('R-04 R-25 accelerator type defaults to the first RG accelerator slot', async () => {
      const { read } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'custom',
          environments: { image: image([], ['cuda']) },
        },
      });
      expect(read.values().resource.acceleratorType).toBe('cuda.device');
      expect(read.values().resource.accelerator).toBe(0);
    });

    it('R-04 H16 [bug-compat] accelerator type ignores image support and stays on the first RG slot', async () => {
      scenario.slotsByRG['rg-a'] = {
        ...BASE_SLOT_DETAILS,
        'rocm.device': { human_readable_name: 'ROCm', display_unit: 'GPU' },
        'cuda.device': ACCEL_SLOT_DETAILS['cuda.device'],
      };
      const { read } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'custom',
          environments: { image: image([], ['cuda']) },
        },
      });
      expect(read.values().resource.acceleratorType).toBe('rocm.device');
      expect(read.values().allocationPreset).toBe('custom');
    });

    it('R-02 an image without accelerator support forces accelerator to 0', async () => {
      const { read } = await renderResourceForm({
        initialValues: {
          allocationPreset: 'custom',
          resource: { cpu: 1, mem: '2g', shmem: '64m', accelerator: 2 },
          environments: { image: image([], ['rocm']) },
        },
      });
      expect(read.values().resource.accelerator).toBe(0);
    });

    it('R-07 a unified accelerator slot clears the accelerator field', async () => {
      scenario.slotsByRG['rg-a'] = {
        ...BASE_SLOT_DETAILS,
        'cuda.unified': {
          human_readable_name: 'Unified',
          display_unit: 'GPU',
          description: 'Unified memory',
        },
      };
      usePresets([LARGE]);
      const { read } = await renderResourceForm({
        initialValues: {
          environments: { image: image([], ['cuda']) },
        },
      });
      expect(read.values().resource.acceleratorType).toBe('cuda.unified');
      expect(read.values().resource.accelerator).toBeUndefined();
    });

    it('R-09 a preset with an accelerator writes type and amount', async () => {
      usePresets([{ ...LARGE, accel: { 'cuda.device': 2 } }]);
      const { read } = await renderResourceForm({
        initialValues: {
          environments: {
            image: image([{ key: 'cuda.device', min: '1' }], ['cuda']),
          },
        },
      });
      expect(read.values().allocationPreset).toBe('id-large');
      expect(read.values().resource).toEqual({
        cpu: 4,
        mem: '8g',
        shmem: '1g',
        accelerator: 2,
        acceleratorType: 'cuda.device',
      });
    });

    it('R-18 an accelerator edit flips the preset to custom', async () => {
      usePresets([{ ...LARGE, accel: { 'cuda.device': 2 } }]);
      const { read, drive } = await renderResourceForm({
        initialValues: {
          environments: {
            image: image([{ key: 'cuda.device', min: '1' }], ['cuda']),
          },
        },
      });
      expect(read.values().allocationPreset).toBe('id-large');
      await drive.step('session.launcher.AIAccelerator', 1);
      expect(read.values().resource.accelerator).toBe(3);
      expect(read.values().allocationPreset).toBe('custom');
    });
  });

  describe('agent select (R-38..R-40, H19)', () => {
    it('R-38 H19 [bug-compat] ["auto"] is rewritten to the string "auto" on mount', async () => {
      const { read } = await renderResourceForm({
        initialValues: { allocationPreset: 'custom' },
      });
      expect(read.values().agent).toBe('auto');
    });

    it('R-38 H19 [bug-compat] an agent missing from the loaded list resets to "auto"', async () => {
      scenario.agents = [];
      const { read } = await renderResourceForm({
        initialValues: { allocationPreset: 'custom', agent: ['i-gone'] },
      });
      expect(read.values().agent).toBe('auto');
    });

    it('R-40 an agent present in the loaded list is kept', async () => {
      scenario.agents = [
        {
          id: 'i-agent1',
          status: 'ALIVE',
          schedulable: true,
          available_slots: '{"cpu":"8"}',
          occupied_slots: '{"cpu":"0"}',
          architecture: 'x86_64',
        },
      ];
      const { read } = await renderResourceForm({
        initialValues: { allocationPreset: 'custom', agent: ['i-agent1'] },
      });
      expect(read.values().agent).toEqual(['i-agent1']);
    });

    it('R-40 H19 [bug-compat] changing the RG resets a chosen agent the new list lacks to "auto"', async () => {
      scenario.agents = [
        {
          id: 'i-agent1',
          status: 'ALIVE',
          schedulable: true,
          available_slots: '{"cpu":"8"}',
          occupied_slots: '{"cpu":"0"}',
          architecture: 'x86_64',
        },
      ];
      const { read, drive } = await renderResourceForm({
        initialValues: { allocationPreset: 'custom', agent: ['i-agent1'] },
      });
      expect(read.values().agent).toEqual(['i-agent1']);
      scenario.agents = [];
      await drive.select('session.ResourceGroup', 'rg-b');
      await waitFor(() => expect(read.values().resourceGroup).toBe('rg-b'));
      await waitFor(() => expect(read.values().agent).toBe('auto'));
    });
  });

  describe('DeploymentAddRevisionModal host props', () => {
    it('host:deployment R-01 no allocationPreset initial value → no auto-select, zero resources kept', async () => {
      usePresets([LARGE]);
      const { read } = await renderResourceForm({ host: 'deployment' });
      // UNEXPECTED vs map: the map says the host's prefill writes
      // allocationPreset:'custom' "to stop R-03", but R-03 never runs here —
      // R-01 skips because `resource` is already in the initial store, so the
      // preset stays undefined.
      expect(read.values().allocationPreset).toBeUndefined();
      expect(read.values().resource).toEqual({
        cpu: 0,
        mem: '0g',
        shmem: '0g',
        accelerator: 0,
      });
    });

    it('host:deployment prefill with allocationPreset:"custom" keeps the prefilled resource', async () => {
      usePresets([LARGE]);
      const { read, form, drive } = await renderResourceForm({
        host: 'deployment',
      });
      await act(async () => {
        form().setFieldsValue({
          cluster_mode: 'single-node',
          cluster_size: 1,
          allocationPreset: 'custom',
          resource: { cpu: 2, mem: '3g', shmem: '64m' },
        });
      });
      await drive.settle();
      expect(read.values().allocationPreset).toBe('custom');
      expect(read.values().resource.cpu).toBe(2);
      expect(read.values().resource.mem).toBe('3g');
    });

    it('host:deployment RG item is hidden but the RG value stays in the form', async () => {
      const { read } = await renderResourceForm({ host: 'deployment' });
      expect(read.values().resourceGroup).toBe('rg-a');
      expect(read.values().agent).toEqual(['auto']);
    });

    it('host:deployment R-05 an image change with no preset leaves the resources alone', async () => {
      const { read, drive } = await renderResourceForm({ host: 'deployment' });
      await drive.setFieldValue(
        ['environments', 'image'],
        image([
          { key: 'cpu', min: '2' },
          { key: 'mem', min: '2g' },
        ]),
      );
      await drive.settle();
      expect(read.values().resource).toEqual({
        cpu: 0,
        mem: '0g',
        shmem: '0g',
        accelerator: 0,
      });
    });
  });
});
