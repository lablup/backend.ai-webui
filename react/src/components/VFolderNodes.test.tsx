/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import type { VFolderNodesTestQuery } from '../__generated__/VFolderNodesTestQuery.graphql';
import type { ProjectContextOrNull } from '../types/projectContext';
import VFolderNodes from './VFolderNodes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as _ from 'lodash-es';
import { Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { MemoryRouter } from 'react-router-dom';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * Contract test for the "Deploy as service" row action's disable-with-tooltip
 * prop (FR-3423). `VFolderNodes` never infers the admin context on its
 * own — including from `project` being `null`, which the user-facing data
 * page can also pass legitimately — the page decides and supplies
 * `noDeployTooltip` (mirrors `FolderExplorerHeaderV2`'s `noProjectTooltip`
 * pattern from the same epic, FR-3412). Absent by default, so every
 * existing caller (user Data page, model store) keeps today's behavior
 * unchanged. These tests exercise external behavior only: rendered output
 * and whether the row action's handler fires.
 */

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

const { mockBaiClient } = vi.hoisted(() => {
  const mockBaiClient = {
    _config: { domainName: 'default' },
    supports: () => false,
    vfolder: {
      delete_by_id: vi.fn(),
      restore_from_trash_bin: vi.fn(),
      delete_from_trash_bin: vi.fn(),
    },
  };
  return { mockBaiClient };
});

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => mockBaiClient,
    useWebUINavigate: () => vi.fn(),
  };
});

vi.mock('../hooks/backendai', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/backendai')>();
  return {
    ...originalModule,
    useCurrentUserInfo: () => [{ uuid: 'current-user-uuid' }, vi.fn()],
  };
});

vi.mock('../hooks/useRouteScope', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useRouteScope')>();
  return {
    ...originalModule,
    useProjectPath: () => (path: string) => `/${path}`,
  };
});

vi.mock('../hooks/useCurrentUserProjectRoles', async (importOriginal) => {
  const originalModule =
    await importOriginal<
      typeof import('../hooks/useCurrentUserProjectRoles')
    >();
  return {
    ...originalModule,
    useEffectiveAdminRole: () => 'none',
  };
});

vi.mock('../hooks/useBAINotification', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useBAINotification')>();
  return {
    ...originalModule,
    useSetBAINotification: () => ({
      upsertNotification: vi.fn(),
      closeNotification: vi.fn(),
    }),
  };
});

vi.mock('./FolderExplorerOpener', () => ({
  useFolderExplorerOpener: () => ({
    open: vi.fn(),
    generateFolderPath: (id: string) => `/data?folder=${id}`,
  }),
}));

// Stub out the deploy-fallback modal: this test only needs to observe
// whether VFolderNodes *tries* to open it (i.e. the row action's handler
// fired), not VFolderDeployModal's own Relay-backed internals (covered by
// its own tests).
const { mockDeployModalOpen } = vi.hoisted(() => ({
  mockDeployModalOpen: vi.fn(),
}));
vi.mock('./VFolderDeployModal', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./VFolderDeployModal')>();
  return {
    default: (props: { open: boolean; vfolderId?: string }) => {
      mockDeployModalOpen(props.open, props.vfolderId);
      return null;
    },
    // `VFolderNodes` preloads the modal's query (render-as-you-fetch), so the
    // real query document has to survive the mock — `useQueryLoader` produces
    // no reference without it, and the modal would never mount.
    VFolderDeployQuery: actual.VFolderDeployQuery,
  };
});

vi.mock('./DeploymentSettingModal', () => ({
  default: () => null,
}));

// Neither modal is reachable in these scenarios (both stay closed: no row
// is ever shared or invited in this test), and both pull in a lot of
// unrelated machinery (table-in-modal rendering, REST-backed queries) that
// has nothing to do with the deploy row action under test here — stub them
// out the same way as the deploy-fallback and create-deployment modals
// above.
vi.mock('./InviteFolderSettingModal', () => ({
  default: () => null,
}));

vi.mock('./SharedFolderPermissionInfoModal', () => ({
  default: () => null,
}));

const VFOLDER_GLOBAL_ID = btoa('VirtualFolderNode:folder-0000');

const TestRenderer: React.FC<{
  noDeployTooltip?: string;
  project?: ProjectContextOrNull;
}> = ({ noDeployTooltip, project = null }) => {
  const data = useLazyLoadQuery<VFolderNodesTestQuery>(
    graphql`
      query VFolderNodesTestQuery @relay_test_operation {
        vfolder_nodes(first: 10) {
          edges {
            node {
              id
              ...VFolderNodesFragment
            }
          }
        }
      }
    `,
    {},
  );
  const vfolders = _.map(data.vfolder_nodes?.edges, 'node');
  return (
    <VFolderNodes
      vfoldersFrgmt={vfolders}
      project={project}
      noDeployTooltip={noDeployTooltip}
    />
  );
};

// `BAINameActionCell` keeps row actions as visible buttons (with their
// disabled-reason tooltip) only when its `ResizeObserver` reports enough
// container width; the overflow "More" menu it falls back to otherwise
// does not carry the tooltip at all. jsdom's real layout always reports 0,
// and the shared `resizeObserver.mock.js` stub never invokes its callback,
// so every row action collapses into the menu by default. Give this test
// its own `ResizeObserver` that reports a generous width synchronously on
// `observe()`, matching how a real browser would size this row.
let mockObservedWidth = 600;
class ImmediateWidthResizeObserver {
  private readonly callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    this.callback(
      [
        {
          target,
          contentRect: { width: mockObservedWidth } as DOMRectReadOnly,
        } as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    );
  }
  unobserve() {}
  disconnect() {}
}

const renderTable = (
  noDeployTooltip?: string,
  project: ProjectContextOrNull = null,
) => {
  globalThis.ResizeObserver =
    ImmediateWidthResizeObserver as unknown as typeof ResizeObserver;

  const environment: RelayMockEnvironment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation: any) =>
    MockPayloadGenerator.generate(operation, {
      // Pin the list length explicitly — the default generator would
      // otherwise leave `edges` empty.
      Query: () => ({
        vfolder_nodes: {
          edges: [{ node: { id: VFOLDER_GLOBAL_ID } }],
        },
      }),
      VirtualFolderNode: () => ({
        // Forces the type for `...BAINodeNotificationItemFragment`'s
        // abstract `on Node` spread too — without it, relay-test-utils
        // resolves that spread's first `... on ComputeSessionNode` branch
        // by default and the store rejects the resulting typename clash.
        __typename: 'VirtualFolderNode',
        id: VFOLDER_GLOBAL_ID,
        status: 'ready',
        name: 'model-folder',
        usage_mode: 'model',
        ownership_type: 'user',
        permissions: ['delete_vfolder'],
      }),
    }),
  );
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <MemoryRouter>
      <RelayEnvironmentProvider environment={environment}>
        <QueryClientProvider client={queryClient}>
          <>
            <Suspense fallback={null}>
              <TestRenderer
                noDeployTooltip={noDeployTooltip}
                project={project}
              />
            </Suspense>
          </>
        </QueryClientProvider>
      </RelayEnvironmentProvider>
    </MemoryRouter>,
  );
};

describe('VFolderNodes deploy row action disable-with-tooltip contract (FR-3423)', () => {
  beforeEach(() => {
    mockDeployModalOpen.mockClear();
    mockObservedWidth = 600;
  });

  it('renders the deploy action disabled with the caller-provided tooltip when noDeployTooltip is set', async () => {
    const user = userEvent.setup();
    renderTable('data.folders.CannotDeployFromAdminMenu');

    const deployButton = await screen.findByRole('button', {
      name: 'modelService.DeployAsService',
    });
    // Astryx keeps a disabled-with-tooltip control FOCUSABLE, so it marks it
    // `aria-disabled` rather than `disabled` — otherwise the browser would
    // swallow the hover that reveals the reason.
    expect(deployButton).toHaveAttribute('aria-disabled', 'true');

    await user.hover(deployButton);
    expect(
      await screen.findByText('data.folders.CannotDeployFromAdminMenu'),
    ).toBeInTheDocument();

    // Clicking a disabled button must not fire the row action's handler.
    fireEvent.click(deployButton);
    expect(mockDeployModalOpen).not.toHaveBeenCalledWith(
      true,
      expect.anything(),
    );
  }, 10000);

  it('still explains the disabled deploy action when the row is too narrow and it collapses into the More menu', async () => {
    const user = userEvent.setup();
    // Narrow enough that the row actions overflow instead of rendering as
    // buttons — the layout an admin actually gets on a small viewport.
    mockObservedWidth = 0;
    renderTable('data.folders.CannotDeployFromAdminMenu');

    expect(
      screen.queryByRole('button', { name: 'modelService.DeployAsService' }),
    ).not.toBeInTheDocument();

    // `react-i18next` is mocked to identity above, so BUI labels render as
    // raw keys here.
    await user.click(
      await screen.findByRole('button', {
        name: 'comp:BAINameActionCell.MoreActions',
      }),
    );

    // The reason is folded into the menu row's label ("title — reason"): a
    // disabled row swallows hover, so it has to be visible without one.
    const deployItem = await screen.findByText(
      'modelService.DeployAsService — data.folders.CannotDeployFromAdminMenu',
    );

    fireEvent.click(deployItem);
    expect(mockDeployModalOpen).not.toHaveBeenCalledWith(
      true,
      expect.anything(),
    );
  }, 10000);

  it('keeps the deploy action enabled and fires its handler when noDeployTooltip is absent', async () => {
    const user = userEvent.setup();
    // A project is required for the modal to mount at all (FR-3410): a
    // deployment is always created inside one. This is the user Data page's
    // shape — project present, no `noDeployTooltip`.
    renderTable(undefined, { id: 'project-0000', name: 'default' });

    const deployButton = await screen.findByRole('button', {
      name: 'modelService.DeployAsService',
    });
    expect(deployButton).toBeEnabled();

    await user.click(deployButton);

    await waitFor(() =>
      expect(mockDeployModalOpen).toHaveBeenCalledWith(true, 'folder-0000'),
    );
  }, 10000);
});
