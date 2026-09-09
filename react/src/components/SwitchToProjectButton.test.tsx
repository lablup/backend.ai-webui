/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-2371: when the caller already knows the project name, the button must
 * switch project without the extra `group_node` round-trip, while callers that
 * cannot supply it (older managers) keep the query-backed fallback.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import SwitchToProjectButton from './SwitchToProjectButton';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';
import { describe, expect, it, vi } from 'vitest';

const { switchProject } = vi.hoisted(() => ({ switchProject: vi.fn() }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { projectName?: string | null }) =>
      `${key}:${options?.projectName}`,
    i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
    ready: true,
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('../hooks/useRouteScope', () => ({
  useSwitchProject: () => switchProject,
}));

vi.mock('backend.ai-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('backend.ai-ui')>();
  return {
    ...actual,
    BAIButton: ({
      children,
      onClick,
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
    }) => (
      <button type="button" onClick={onClick}>
        {children}
      </button>
    ),
  };
});

const renderButton = (
  environment: RelayMockEnvironment,
  projectName?: string,
) =>
  render(
    <RelayEnvironmentProvider environment={environment}>
      <SwitchToProjectButton
        projectId="project-0000"
        projectName={projectName}
      />
    </RelayEnvironmentProvider>,
  );

describe('SwitchToProjectButton', () => {
  it('uses the given project name without issuing a query', () => {
    const environment = createMockEnvironment();
    renderButton(environment, 'alpha');

    expect(
      screen.getByText('modelService.SwitchToProject:alpha'),
    ).toBeInTheDocument();
    expect(environment.mock.getAllOperations()).toHaveLength(0);

    fireEvent.click(screen.getByRole('button'));
    expect(switchProject).toHaveBeenCalledWith({
      projectId: 'project-0000',
      projectName: 'alpha',
    });
  });

  it('falls back to the group_node lookup when no project name is given', async () => {
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        GroupNode: () => ({
          id: btoa('GroupNode:project-0000'),
          name: 'beta',
        }),
      }),
    );
    renderButton(environment);

    expect(
      await screen.findByText('modelService.SwitchToProject:beta'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(switchProject).toHaveBeenCalledWith({
      projectId: 'project-0000',
      projectName: 'beta',
    });
  });
});
