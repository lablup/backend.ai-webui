/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import AdminModelCardSettingModal from './AdminModelCardSettingModal';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * The model-storage folder picker is project-scoped and emits the folder's
 * LOCAL id, while `CreateModelCardV2Input.vfolderId` is a `UUID!` — a
 * regression back to a global id would only surface against a live manager.
 */

vi.mock('react-i18next', async () => {
  const React = await import('react');
  return {
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
      ready: true,
    }),
    Trans: (props: any) => React.createElement('span', null, props.i18nKey),
    initReactI18next: { type: '3rdParty', init: () => {} },
  };
});

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useCurrentDomainValue: () => 'default',
  };
});

const MODEL_STORE_PROJECT = {
  id: 'project-0000-1111-2222-333333333333',
  name: 'model-store',
};
// Undashed, as a Relay global id decodes to on some manager builds.
const PICKED_VFOLDER_LOCAL_ID = '11111111111122223333444444444444';
const PICKED_VFOLDER_UUID = '11111111-1111-2222-3333-444444444444';
const CREATED_VFOLDER_UUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const CREATED_VFOLDER_GLOBAL_ID = btoa(
  `VirtualFolderNode:${CREATED_VFOLDER_UUID}`,
);

// The folder picker and the domain select fetch their own data; stub both and
// surface the picker's project scope and current value for assertions.
vi.mock('backend.ai-ui', async (importOriginal) => {
  const React = await import('react');
  const originalModule = await importOriginal<typeof import('backend.ai-ui')>();
  return {
    ...originalModule,
    BAIDomainSelect: () => null,
    BAIProjectVfolderSelect: (props: any) =>
      React.createElement(
        'button',
        {
          'data-testid': 'mock-vfolder-select',
          type: 'button',
          'data-project-id': props.projectId,
          'data-value': props.value ?? '',
          onClick: () => props.onChange?.(PICKED_VFOLDER_LOCAL_ID),
        },
        'select-vfolder',
      ),
  };
});

vi.mock('./FolderCreateModalV2', async () => {
  const React = await import('react');
  return {
    default: (props: any) =>
      React.createElement(
        'button',
        {
          'data-testid': 'mock-folder-created',
          type: 'button',
          'data-project-id': props.project?.id ?? '',
          onClick: () =>
            props.onRequestClose?.({ id: CREATED_VFOLDER_GLOBAL_ID }),
        },
        'create-folder',
      ),
  };
});

const renderModal = () => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  render(
    <RelayEnvironmentProvider environment={environment}>
      <AdminModelCardSettingModal
        open
        modelStoreProject={MODEL_STORE_PROJECT}
      />
    </RelayEnvironmentProvider>,
  );
  return { environment };
};

describe('AdminModelCardSettingModal model-storage folder picker', () => {
  it('scopes the folder picker to the model-store project', async () => {
    renderModal();

    expect(await screen.findByTestId('mock-vfolder-select')).toHaveAttribute(
      'data-project-id',
      MODEL_STORE_PROJECT.id,
    );
  });

  it('sends the picked folder as a dashed UUID to the create mutation', async () => {
    const user = userEvent.setup();
    const { environment } = renderModal();

    await user.type(
      screen.getAllByRole('textbox')[0] as HTMLElement,
      'my-model-card',
    );
    await user.click(await screen.findByTestId('mock-vfolder-select'));
    await user.click(screen.getByRole('button', { name: 'button.Create' }));

    await waitFor(() => {
      expect(
        environment.mock.getMostRecentOperation().request.node.params.name,
      ).toBe('AdminModelCardSettingModalCreateMutation');
    });
    const { input } =
      environment.mock.getMostRecentOperation().request.variables;
    expect(input.vfolderId).toBe(PICKED_VFOLDER_UUID);
    expect(input.modelStoreProjectId).toBe(MODEL_STORE_PROJECT.id);
  });

  it('fills the picker with the local id of a just-created folder', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(await screen.findByTestId('mock-folder-created'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-vfolder-select')).toHaveAttribute(
        'data-value',
        CREATED_VFOLDER_UUID,
      );
    });
  });
});
