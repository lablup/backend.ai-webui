/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-3989: a selected project the domain's option list cannot contain used to
 * render as a bare UUID, and stayed unchecked in the dropdown.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import ProjectSelect from './ProjectSelect';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
    ready: true,
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('../theme-shim', () => ({
  theme: { useToken: () => ({ token: { marginXS: 8 } }) },
}));

vi.mock('../hooks/useCurrentUserProjectRoles', () => ({
  useCurrentUserProjectRoles: () => ({ projectAdminIds: [] }),
}));

const groups = [
  {
    id: 'project-general',
    name: 'coredev',
    type: 'GENERAL',
    is_active: true,
    resource_policy: 'default',
  },
];

vi.mock('../hooks/useAccessibleProjects', () => ({
  useAccessibleProjects: () => ({
    groups,
    accessibleProjects: groups,
  }),
}));

vi.mock('backend.ai-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('backend.ai-ui')>();
  return {
    ...actual,
    // Serialize the resolved option list; the real popup needs a live
    // dropdown, and what this test is about is which options exist.
    BAISelect: ({ options }: { options?: unknown }) => (
      <div data-testid="options">{JSON.stringify(options)}</div>
    ),
  };
});

const renderSelect = (props: {
  value: Array<string>;
  fallbackProjects?: Array<{ id: string; name: string; type?: string | null }>;
}) =>
  render(
    <ProjectSelect
      mode="multiple"
      domain="default"
      disableDefaultFilter
      onChange={() => {}}
      {...props}
    />,
  );

describe('ProjectSelect fallbackProjects', () => {
  it('labels a selected project the option list does not contain', () => {
    renderSelect({
      value: ['project-general', 'project-archived'],
      fallbackProjects: [
        { id: 'project-archived', name: 'archived-team', type: 'GENERAL' },
      ],
    });

    const options = screen.getByTestId('options').textContent ?? '';
    expect(options).toContain('archived-team');
    expect(options).toContain('project-archived');
  });

  it('ignores a fallback project that is not selected', () => {
    renderSelect({
      value: ['project-general'],
      fallbackProjects: [
        { id: 'project-archived', name: 'archived-team', type: 'GENERAL' },
      ],
    });

    const options = screen.getByTestId('options').textContent ?? '';
    expect(options).toContain('coredev');
    expect(options).not.toContain('archived-team');
  });

  it('does not duplicate a fallback project that is already an option', () => {
    renderSelect({
      value: ['project-general'],
      fallbackProjects: [
        { id: 'project-general', name: 'coredev', type: 'GENERAL' },
      ],
    });

    const options = screen.getByTestId('options').textContent ?? '';
    expect(options.match(/coredev/g)).toHaveLength(2); // label + projectName
  });
});
