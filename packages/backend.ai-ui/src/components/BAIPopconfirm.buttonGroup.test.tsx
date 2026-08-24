/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Pins the composition contract behind QA2-B-2: a confirm-guarded button that
 * has to sit inside an Astryx `ButtonGroup` must use `BAIPopconfirm`'s
 * RENDER-PROP form, not its element form.
 *
 * Why the rule exists. Astryx welds a group's members with pure CSS keyed on
 * the button ELEMENT's position among its siblings — `:first-child` for the
 * leading cap and `IS_LAST_ITEM` (`:not(:has(~ *:not([popover])))`) for the
 * trailing one (`Button.tsx`). Both selectors are evaluated against the
 * button's real parent, so any wrapper element between the group and the
 * button makes every member look like an only child and each one keeps a full
 * `8px` pill: the "two separate controls" look this whole QA pass is about.
 * `Popover`'s element form wraps its trigger in an `inline-flex` anchor div —
 * invisible in layout, fatal to the selector. Its render-prop form hands the
 * trigger wiring (`ref` / `onClick` / aria) to the button and emits no wrapper.
 *
 * Why a unit test rather than a live check: the one call site is the Apply
 * button in `DeploymentRevisionHistoryTab`'s revision drawer, and that drawer
 * only opens from a revision row. The dev backend's single deployment reports
 * `revisionHistory.count: 0` ("No revision is deployed"), so the drawer cannot
 * be reached by hand there. The sibling defect on the same page —
 * `DeploymentBasicInfoCard`'s Edit + More group — WAS verified live
 * (`8px 0 0 8px` / `0 8px 8px 0`, gap 0), and this test pins the half that
 * could not be.
 *
 * The assertion is deliberately structural (parent identity), not visual:
 * jsdom does not run StyleX's cascade, so `border-radius` is not observable
 * here. Direct-childhood is the precondition the CSS is keyed on, and it is
 * the thing a future refactor would silently break.
 */
import BAIPopconfirm from './BAIPopconfirm';
import { Button } from '@astryxdesign/core/Button';
import { ButtonGroup } from '@astryxdesign/core/ButtonGroup';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

const groupOf = (el: HTMLElement) => el.closest('.astryx-button-group');

describe('BAIPopconfirm inside an Astryx ButtonGroup', () => {
  it('render-prop form keeps the trigger a DIRECT child of the group', () => {
    render(
      <ButtonGroup label="Control">
        <BAIPopconfirm title="Apply revision?">
          {(triggerProps) => (
            <Button {...triggerProps} variant="primary" label="Apply" />
          )}
        </BAIPopconfirm>
        <Button variant="primary" label="More" />
      </ButtonGroup>,
    );

    const apply = screen.getByRole('button', { name: 'Apply' });
    const group = groupOf(apply);
    expect(group).not.toBeNull();
    // The precondition for `:first-child` / `IS_LAST_ITEM` to resolve against
    // the group at all.
    expect(apply.parentElement).toBe(group);
    expect(group?.firstElementChild).toBe(apply);
  });

  it('element form does NOT — the anchor wrapper breaks the join', () => {
    render(
      <ButtonGroup label="Control">
        <BAIPopconfirm title="Apply revision?">
          <Button variant="primary" label="Apply" />
        </BAIPopconfirm>
        <Button variant="primary" label="More" />
      </ButtonGroup>,
    );

    const apply = screen.getByRole('button', { name: 'Apply' });
    const group = groupOf(apply);
    expect(group).not.toBeNull();
    // Negative control: this is the shape that produced the split pair.
    expect(apply.parentElement).not.toBe(group);
  });
});
