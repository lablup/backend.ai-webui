/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Contract tests for the FR-3422 disabled placeholder that replaces
 * `WebUIHeaderProjectSelect` on project-agnostic `/admin/*` pages.
 *
 * External behavior only: the placeholder renders a disabled,
 * selector-shaped control reading "All projects" with an explanatory
 * tooltip. `WebUIHeader.test.tsx` separately covers that the header mounts
 * this placeholder (not the real selector) on project-agnostic routes and
 * the real, interactive selector (not this placeholder) everywhere else.
 */
import '../../../__test__/matchMedia.mock.js';
import '../../../__test__/resizeObserver.mock.js';
import WebUIHeaderProjectSelectPlaceholder from './WebUIHeaderProjectSelectPlaceholder';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

vi.mock('react-i18next', async () => {
  const React = await import('react');
  return {
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: {
        language: 'en',
        changeLanguage: () => new Promise(() => {}),
      },
      ready: true,
    }),
    Trans: (props: any) => React.createElement('span', null, props.i18nKey),
    initReactI18next: {
      type: '3rdParty',
      init: () => {},
    },
  };
});

describe('WebUIHeaderProjectSelectPlaceholder (FR-3422)', () => {
  it('renders a disabled selector-shaped control showing "All projects"', () => {
    render(<WebUIHeaderProjectSelectPlaceholder />);

    const control = screen.getByTestId('selector-project-placeholder');
    expect(control.className).toMatch(/ant-select-disabled/);
    expect(screen.getByText('header.AllProjects')).toBeInTheDocument();
  });

  it('exposes an explanatory tooltip on hover', async () => {
    render(<WebUIHeaderProjectSelectPlaceholder />);

    const control = screen.getByTestId('selector-project-placeholder');
    // Hover the wrapper span, not the disabled control itself — a disabled
    // Select swallows pointer events, so the mouseenter must land on the
    // non-disabled wrapper for the Tooltip to trigger (same pattern as
    // FileBrowserButtonV2.test.tsx / DeploymentSettingModal.tsx).
    fireEvent.mouseEnter(control.closest('span')!);

    expect(
      await screen.findByText('header.AllProjectsTooltip'),
    ).toBeInTheDocument();
  });
});
