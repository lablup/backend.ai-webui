/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-3989: the user's PERSONAL project, which the domain's option list never
 * contains, used to render as a bare UUID.
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
  {
    id: 'project-model-store',
    name: 'model-store',
    type: 'MODEL_STORE',
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

type SelectOption = { value: string; label: unknown; disabled: boolean };

const renderSelect = (props: {
  value: Array<string>;
  personalProject?: { id: string; name: string };
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

const readGroups = () =>
  JSON.parse(screen.getByTestId('options').textContent ?? '[]') as Array<{
    label: string;
    options: Array<SelectOption>;
  }>;

const personalProject = { id: 'project-personal', name: 'seungwon' };

describe('ProjectSelect personalProject', () => {
  it('shows the personal project by name, locked, under the Personal group', () => {
    renderSelect({
      value: ['project-general', 'project-personal'],
      personalProject,
    });

    const groupsJson = readGroups();
    expect(groupsJson.map((group) => group.label)).toEqual([
      'general.General',
      'data.ModelStore',
      'projectSelect.Personal',
    ]);
    const personalGroup = groupsJson.find(
      (group) => group.label === 'projectSelect.Personal',
    );
    expect(personalGroup?.options).toHaveLength(1);
    const personal = personalGroup?.options[0];
    expect(personal).toMatchObject({
      value: 'project-personal',
      disabled: true,
    });
    expect(JSON.stringify(personal?.label)).toContain('seungwon');
    expect(JSON.stringify(personal?.label)).toContain(
      'projectSelect.PersonalProjectCannotBeRemoved',
    );
    const general = groupsJson[0].options[0];
    expect(general).toMatchObject({ disabled: false, label: 'coredev' });
  });

  it('has no personal option without the prop', () => {
    renderSelect({ value: ['project-general'] });

    const options = screen.getByTestId('options').textContent ?? '';
    expect(options).not.toContain('projectSelect.Personal');
    expect(options).not.toContain('project-personal');
  });

  it('locks a MODEL_STORE option without the personal tooltip', () => {
    renderSelect({
      value: ['project-general', 'project-model-store'],
      lockedProjectTypes: ['MODEL_STORE'],
    });

    const modelStore = readGroups()
      .flatMap((group) => group.options)
      .find((option) => option.value === 'project-model-store');
    expect(modelStore).toMatchObject({ disabled: true, label: 'model-store' });
    expect(screen.getByTestId('options').textContent).not.toContain(
      'projectSelect.PersonalProjectCannotBeRemoved',
    );
  });

  it('does not duplicate a personal project that is already an option', () => {
    renderSelect({
      value: ['project-general'],
      personalProject: { id: 'project-general', name: 'coredev' },
    });

    const options = readGroups().flatMap((group) => group.options);
    expect(
      options.filter((option) => option.value === 'project-general'),
    ).toHaveLength(1);
  });
});
