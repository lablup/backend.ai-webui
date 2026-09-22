/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-3989: a selected project the domain's option list cannot contain (the
 * user's PERSONAL project) used to render as a bare UUID.
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
    // React dev elements carry a circular `_owner`; drop the `_`-prefixed
    // internals so a JSX label serializes as its type-less props tree.
    BAISelect: ({ options }: { options?: unknown }) => (
      <div data-testid="options">
        {JSON.stringify(options, (key, value) =>
          key.startsWith('_') ? undefined : value,
        )}
      </div>
    ),
  };
});

const renderSelect = (props: {
  value: Array<string>;
  fallbackProjects?: Array<{ id: string; name: string; type?: string | null }>;
  lockedProjectTypes?: Array<string>;
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

  it('labels and locks a selected PERSONAL project', () => {
    renderSelect({
      value: ['project-general', 'project-personal'],
      fallbackProjects: [
        { id: 'project-general', name: 'coredev', type: 'GENERAL' },
        { id: 'project-personal', name: 'seungwon', type: 'PERSONAL' },
      ],
      lockedProjectTypes: ['PERSONAL'],
    });

    const groupsJson = JSON.parse(
      screen.getByTestId('options').textContent ?? '[]',
    ) as Array<{
      label: string;
      options: Array<{ value: string; label: string; disabled: boolean }>;
    }>;
    expect(groupsJson.map((group) => group.label)).toEqual([
      'general.General',
      'projectSelect.Personal',
    ]);
    const options = groupsJson.flatMap((group) => group.options);
    expect(options).toHaveLength(2);
    const personal = options.find(
      (option) => option.value === 'project-personal',
    );
    expect(personal).toMatchObject({ disabled: true });
    expect(JSON.stringify(personal?.label)).toContain('seungwon');
    expect(JSON.stringify(personal?.label)).toContain(
      'projectSelect.PersonalProjectCannotBeRemoved',
    );
    const general = options.find(
      (option) => option.value === 'project-general',
    );
    expect(general).toMatchObject({ disabled: false, label: 'coredev' });
  });

  it('shows the lock hint only on a locked PERSONAL option', () => {
    renderSelect({
      value: ['project-general', 'project-personal'],
      fallbackProjects: [
        { id: 'project-personal', name: 'seungwon', type: 'PERSONAL' },
      ],
    });
    // Unlocked PERSONAL option: no hint.
    expect(screen.getByTestId('options').textContent).not.toContain(
      'projectSelect.PersonalProjectCannotBeRemoved',
    );
  });

  it('does not show the lock hint on a locked MODEL_STORE option', () => {
    renderSelect({
      value: ['project-general', 'project-model-store'],
      fallbackProjects: [
        { id: 'project-model-store', name: 'model-store', type: 'MODEL_STORE' },
      ],
      lockedProjectTypes: ['MODEL_STORE'],
    });
    const options = screen.getByTestId('options').textContent ?? '';
    expect(options).toContain('"disabled":true');
    expect(options).not.toContain(
      'projectSelect.PersonalProjectCannotBeRemoved',
    );
  });
});
