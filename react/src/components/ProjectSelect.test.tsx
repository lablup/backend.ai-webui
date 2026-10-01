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
import { Tooltip } from '@astryxdesign/core/Tooltip';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const captured = vi.hoisted(() => ({ options: undefined as unknown }));
const roles = vi.hoisted(() => ({
  current: {
    isSuperAdmin: false,
    domainAdminDomains: [] as Array<string>,
    projectAdminIds: [] as Array<string>,
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
    ready: true,
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('../hooks/useCurrentUserProjectRoles', () => ({
  useCurrentUserProjectRoles: () => roles.current,
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
    // Capture the resolved option list; the real popup needs a live dropdown.
    BAISelect: ({ options }: { options?: unknown }) => {
      captured.options = options;
      return null;
    },
  };
});

type SelectOption = { value: string; label: ReactNode; disabled: boolean };

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
  captured.options as Array<{ label: string; options: Array<SelectOption> }>;

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

    // The whole label is the tooltip trigger; no lock glyph beside the name.
    const label = personal?.label as ReactElement<{
      content: ReactNode;
      children: ReactNode;
    }>;
    expect(isValidElement(label) && label.type).toBe(Tooltip);
    expect(label.props.content).toBe(
      'projectSelect.PersonalProjectCannotBeRemoved',
    );
    const { container } = render(<>{label.props.children}</>);
    expect(container.textContent).toBe('seungwon');
    expect(container.querySelector('svg')).toBeNull();

    const general = groupsJson[0].options[0];
    expect(general).toMatchObject({ disabled: false, label: 'coredev' });
  });

  it('has no personal option without the prop', () => {
    renderSelect({ value: ['project-general'] });

    const groups = readGroups();
    expect(groups.map((group) => group.label)).not.toContain(
      'projectSelect.Personal',
    );
    expect(
      groups.flatMap((group) => group.options).map((option) => option.value),
    ).not.toContain('project-personal');
  });

  it('locks a MODEL_STORE option without the personal tooltip', () => {
    renderSelect({
      value: ['project-general', 'project-model-store'],
      lockedProjectTypes: ['MODEL_STORE'],
    });

    const modelStore = readGroups()
      .flatMap((group) => group.options)
      .find((option) => option.value === 'project-model-store');
    // A plain string label, so no tooltip wraps it.
    expect(modelStore).toMatchObject({ disabled: true, label: 'model-store' });
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

describe('ProjectSelect project admin badge', () => {
  afterEach(() => {
    roles.current = {
      isSuperAdmin: false,
      domainAdminDomains: [],
      projectAdminIds: [],
    };
  });

  const generalLabel = () => {
    renderSelect({ value: [] });
    const general = readGroups()
      .flatMap((group) => group.options)
      .find((option) => option.value === 'project-general');
    return general?.label;
  };

  it('badges a project the user administers', () => {
    roles.current.projectAdminIds = ['project-general'];

    const { container } = render(<>{generalLabel()}</>);
    expect(container.textContent).toContain('projectSelect.ProjectAdminBadge');
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('does not badge any project for a super-admin', () => {
    roles.current.isSuperAdmin = true;
    roles.current.projectAdminIds = ['project-general'];

    expect(generalLabel()).toBe('coredev');
  });

  it('does not badge any project for a domain admin', () => {
    roles.current.domainAdminDomains = ['default'];
    roles.current.projectAdminIds = ['project-general'];

    expect(generalLabel()).toBe('coredev');
  });
});
