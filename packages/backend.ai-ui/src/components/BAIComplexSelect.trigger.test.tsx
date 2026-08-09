/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Pins QA2-B-1 for the ComplexSelector-backed half of the select family: in
 * `multiple` mode the trigger NAMES the selection, it does not count it, and
 * it says it in exactly the words Astryx `MultiSelector triggerDisplay="labels"`
 * uses — `A, B, C` and `A, B, C, +N` past the cap. `BAISelect` (the
 * `MultiSelector` half) inherits that wording from Astryx itself; this file is
 * what keeps the two engines from drifting apart, because a user moving
 * between an infinite-scroll select and a static one must not be able to tell
 * which one they are looking at.
 *
 * Why a unit test rather than a live check: no route on the dev backend
 * renders a multiple-mode `BAIComplexSelect`. Its three consumers are all
 * gated — `ProjectAdminSettingModal` needs manager support for project-admin
 * assignment (this cluster reports none, so the action never appears on
 * /admin/project), `UserFolderPermissionPanel` is superseded by
 * `UserFolderPermissionPanelV2`, which is single-select, and
 * `VFolderMountFormItem` has no call site left. The trigger is plain text, so
 * jsdom sees exactly what a browser would.
 */
import BAIComplexSelect from './BAIComplexSelect';
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

// The popup keeps the keyboard highlight in view; jsdom has no layout, so it
// does not implement `scrollIntoView` at all. Unrelated to what is asserted.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const OPTIONS = [
  { value: 'a', label: 'alpha' },
  { value: 'b', label: 'bravo' },
  { value: 'c', label: 'charlie' },
  { value: 'd', label: 'delta' },
];

const selection = (...values: Array<string>) =>
  values.map((v) => ({
    value: v,
    label: OPTIONS.find((o) => o.value === v)!.label,
  }));

const triggerText = () =>
  screen.getAllByRole('button')[0]?.textContent?.trim() ?? '';

describe('BAIComplexSelect multiple-mode trigger', () => {
  it('names every selected option while under the cap', () => {
    render(
      <BAIComplexSelect
        label="Targets"
        multiple
        options={OPTIONS}
        value={selection('a', 'b')}
      />,
    );
    expect(triggerText()).toContain('alpha, bravo');
    // The regression this guards: Astryx's own default would say "2 selected".
    expect(triggerText()).not.toMatch(/\d+\s+selected/i);
  });

  it('collapses past `maxTriggerTokens` to the "+N" form Astryx uses', () => {
    render(
      <BAIComplexSelect
        label="Targets"
        multiple
        options={OPTIONS}
        value={selection('a', 'b', 'c', 'd')}
      />,
    );
    expect(triggerText()).toContain('alpha, bravo, charlie, +1');
  });

  it('still renders chips when a call site asks for `badges`', () => {
    render(
      <BAIComplexSelect
        label="Targets"
        multiple
        triggerDisplay="badges"
        options={OPTIONS}
        value={selection('a', 'b')}
      />,
    );
    // Chips carry the same words, just not comma-joined.
    expect(triggerText()).toContain('alpha');
    expect(triggerText()).toContain('bravo');
    expect(triggerText()).not.toContain('alpha, bravo');
  });

  it('single mode is untouched — the one label, no separators', () => {
    render(
      <BAIComplexSelect
        label="Target"
        options={OPTIONS}
        value={selection('c')[0]}
      />,
    );
    expect(triggerText()).toContain('charlie');
    expect(triggerText()).not.toContain(',');
  });
});
