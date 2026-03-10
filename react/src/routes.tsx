/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary, { ErrorView } from './components/BAIErrorBoundary';
import {
  DefaultProvidersForReactRoot,
  RoutingEventHandler,
} from './components/DefaultProviders';
import ErrorBoundaryWithNullFallback from './components/ErrorBoundaryWithNullFallback';
import FlexActivityIndicator from './components/FlexActivityIndicator';
import LocationStateBreadCrumb from './components/LocationStateBreadCrumb';
import LoginView from './components/LoginView';
import MainLayout from './components/MainLayout/MainLayout';
import WebUINavigate from './components/WebUINavigate';
import { useSuspendedBackendaiClient } from './hooks';
import { useBAISettingUserState } from './hooks/useBAISetting';
import { LogoutEventHandler } from './hooks/useLogout';
import { useWebUIMenuItems } from './hooks/useWebUIMenuItems';
// High priority to import the component
import ComputeSessionListPage from './pages/ComputeSessionListPage';
import ModelStoreListPage from './pages/ModelStoreListPage';
import Page404 from './pages/Page404';
import ServingPage from './pages/ServingPage';
import VFolderNodeListPage from './pages/VFolderNodeListPage';
import { Skeleton, theme } from 'antd';
import { BAIFlex, BAICard } from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteObject, useLocation } from 'react-router-dom';

const LoginViewLazy = React.lazy(() => import('./components/LoginView'));

const Information = React.lazy(() => import('./components/Information'));
const EndpointDetailPage = React.lazy(
  () => import('./pages/EndpointDetailPage'),
);
const StartPage = React.lazy(() => import('./pages/StartPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const AdminDashboardPage = React.lazy(
  () => import('./pages/AdminDashboardPage'),
);
const EnvironmentPage = React.lazy(() => import('./pages/EnvironmentPage'));
const MyEnvironmentPage = React.lazy(() => import('./pages/MyEnvironmentPage'));
const StorageHostSettingPage = React.lazy(
  () => import('./pages/StorageHostSettingPage'),
);
const UserSettingsPage = React.lazy(() => import('./pages/UserSettingsPage'));
const SessionLauncherPage = React.lazy(
  () => import('./pages/SessionLauncherPage'),
);
const ResourcePolicyPage = React.lazy(
  () => import('./pages/ResourcePolicyPage'),
);
const ResourcesPage = React.lazy(() => import('./pages/ResourcesPage'));
const FolderExplorerOpener = React.lazy(
  () => import('./components/FolderExplorerOpener'),
);
const FolderInvitationResponseModalOpener = React.lazy(
  () => import('./components/FolderInvitationResponseModalOpener'),
);
const FileUploadManager = React.lazy(
  () => import('./components/FileUploadManager'),
);
const ServiceLauncherCreatePage = React.lazy(
  () => import('./components/ServiceLauncherPageContent'),
);
const ServiceLauncherUpdatePage = React.lazy(
  () => import('./pages/ServiceLauncherPage'),
);
const InteractiveLoginPage = React.lazy(
  () => import('./pages/InteractiveLoginPage'),
);
const UserCredentialsPage = React.lazy(
  () => import('./pages/UserCredentialsPage'),
);

const AgentSummaryPage = React.lazy(() => import('./pages/AgentSummaryPage'));
const MaintenancePage = React.lazy(() => import('./pages/MaintenancePage'));
const DiagnosticsPage = React.lazy(() => import('./pages/DiagnosticsPage'));
const StatisticsPage = React.lazy(() => import('./pages/StatisticsPage'));
const ConfigurationsPage = React.lazy(
  () => import('./pages/ConfigurationsPage'),
);
const SessionDetailAndContainerLogOpenerLegacy = React.lazy(
  () => import('./components/SessionDetailAndContainerLogOpenerLegacy'),
);
const ProjectPage = React.lazy(() => import('./pages/ProjectPage'));

const ChatPage = React.lazy(() => import('./pages/ChatPage'));

const AIAgentPage = React.lazy(() => import('./pages/AIAgentPage'));
const ReservoirPage = React.lazy(() => import('./pages/ReservoirPage'));
const ReservoirArtifactDetailPage = React.lazy(
  () => import('./pages/ReservoirArtifactDetailPage'),
);

const SchedulerPage = React.lazy(() => import('./pages/SchedulerPage'));
const BrandingPage = React.lazy(() => import('./pages/BrandingPage'));
const AdminSessionPage = React.lazy(() => import('./pages/AdminSessionPage'));
const EmailVerificationPage = React.lazy(
  () => import('./pages/EmailVerificationPage'),
);
const ChangePasswordPage = React.lazy(
  () => import('./pages/ChangePasswordPage'),
);
const EduAppLauncherPage = React.lazy(
  () => import('./pages/EduAppLauncherPage'),
);

/**
 * MainLayout children routes - these are the actual page routes
 */
export const mainLayoutChildRoutes: RouteObject[] = [
  {
    // Redirect to first available menu when accessing root path
    index: true,
    Component: () => {
      const { defaultMenuPath } = useWebUIMenuItems();
      return <WebUINavigate to={defaultMenuPath} replace />;
    },
  },
  {
    //for electron dev mode
    path: '/build/electron-app/app/index.html',
    Component: () => {
      const { defaultMenuPath } = useWebUIMenuItems();
      return <WebUINavigate to={defaultMenuPath} replace />;
    },
  },
  {
    //for electron prod mode
    path: '/app/index.html',
    Component: () => {
      const { defaultMenuPath } = useWebUIMenuItems();
      return <WebUINavigate to={defaultMenuPath} replace />;
    },
  },
  {
    path: '/start',
    element: <StartPage />,
    handle: { labelKey: 'webui.menu.Start' },
  },
  {
    path: '/chat/:id?',
    handle: { labelKey: 'webui.menu.Chat' },
    Component: () => {
      useSuspendedBackendaiClient();
      return (
        <Suspense fallback={<FlexActivityIndicator spinSize="large" />}>
          <ChatPage />
        </Suspense>
      );
    },
  },
  {
    path: '/dashboard',
    handle: { labelKey: 'webui.menu.Dashboard' },
    Component: () => {
      return (
        <BAIErrorBoundary>
          <Suspense fallback={<Skeleton active />}>
            <DashboardPage />
          </Suspense>
        </BAIErrorBoundary>
      );
    },
  },
  {
    // TODO: For the convenience of existing users, this path will be retained. It is scheduled for deletion in the future.
    path: '/summary',
    Component: () => {
      const location = useLocation();
      return <WebUINavigate to={'/dashboard' + location.search} replace />;
    },
    handle: { labelKey: 'webui.menu.Summary' },
  },
  {
    // TODO: For the convenience of existing users, this path will be retained. It is scheduled for deletion in the future.
    path: '/job',
    handle: { labelKey: 'webui.menu.Sessions' },
    Component: () => {
      const location = useLocation();
      return <WebUINavigate to={'/session' + location.search} replace />;
    },
  },
  {
    path: '/session',
    handle: { labelKey: 'webui.menu.Sessions' },
    children: [
      {
        path: '',
        Component: () => {
          useSuspendedBackendaiClient();

          return (
            <Suspense fallback={<Skeleton active />}>
              <ComputeSessionListPage />
              <SessionDetailAndContainerLogOpenerLegacy />
            </Suspense>
          );
        },
      },
      {
        path: '/session/start',
        // handle: { labelKey: 'session.launcher.StartNewSession' },
        Component: () => {
          const { token } = theme.useToken();
          return (
            <BAIFlex
              direction="column"
              gap={token.paddingContentVerticalLG}
              align="stretch"
              style={{ paddingBottom: token.paddingContentVerticalLG }}
            >
              <LocationStateBreadCrumb />
              <Suspense
                fallback={
                  <BAIFlex direction="column" style={{ maxWidth: 700 }}>
                    <Skeleton active />
                  </BAIFlex>
                }
              >
                <SessionLauncherPage />
              </Suspense>
            </BAIFlex>
          );
        },
        handle: { labelKey: 'session.launcher.StartNewSession' },
      },
    ],
  },
  {
    path: '/serving',

    handle: { labelKey: 'webui.menu.Serving' },
    children: [
      {
        path: '',
        Component: () => {
          const { t } = useTranslation();
          useSuspendedBackendaiClient();
          return (
            <Suspense
              fallback={<BAICard title={t('webui.menu.Serving')} loading />}
            >
              <ServingPage />
            </Suspense>
          );
        },
      },
      {
        path: '/serving/:serviceId',
        element: (
          <Suspense fallback={<Skeleton active />}>
            <EndpointDetailPage />
          </Suspense>
        ),
        handle: { labelKey: 'modelService.RoutingInfo' },
      },
    ],
  },
  {
    path: '/service',
    handle: { labelKey: 'webui.menu.Serving' },
    children: [
      {
        path: '',
        element: <WebUINavigate to="/serving" replace />,
      },
      {
        path: 'start',
        handle: { labelKey: 'modelService.StartNewService' },
        element: (
          <Suspense
            fallback={
              <BAIFlex direction="column" style={{ maxWidth: 700 }}>
                <Skeleton active />
              </BAIFlex>
            }
          >
            <ServiceLauncherCreatePage />
          </Suspense>
        ),
      },
      {
        path: 'update/:endpointId',
        handle: { labelKey: 'modelService.UpdateService' },
        element: (
          <Suspense
            fallback={
              <BAIFlex direction="column" style={{ maxWidth: 700 }}>
                <Skeleton active />
              </BAIFlex>
            }
          >
            <ServiceLauncherUpdatePage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/model-store',
    handle: { labelKey: 'data.ModelStore' },
    element: (
      <Suspense
        fallback={
          <BAIFlex direction="column" style={{ maxWidth: 700 }}>
            <Skeleton active />
          </BAIFlex>
        }
      >
        <ModelStoreListPage />
      </Suspense>
    ),
  },
  // Redirect paths for backward compatibility
  {
    path: '/import',
    Component: () => {
      const location = useLocation();
      return <WebUINavigate to={'/start' + location.search} replace />;
    },
  },
  // Redirect paths for legacy support
  {
    path: '/github',
    Component: () => {
      const location = useLocation();
      return <WebUINavigate to={'/start' + location.search} replace />;
    },
  },
  {
    path: '/data',
    handle: { labelKey: 'webui.menu.Data' },
    Component: () => {
      return <VFolderNodeListPage />;
    },
  },
  {
    path: '/my-environment',
    element: <MyEnvironmentPage />,
    handle: { labelKey: 'webui.menu.MyEnvironments' },
  },
  {
    path: '/agent-summary',
    element: <AgentSummaryPage />,
    handle: { labelKey: 'webui.menu.AgentSummary' },
  },
  {
    path: '/statistics',
    handle: { labelKey: 'webui.menu.Statistics' },
    Component: () => {
      useSuspendedBackendaiClient();
      return (
        <Suspense
          fallback={
            <BAIFlex direction="column" style={{ maxWidth: 700 }}>
              <Skeleton active />
            </BAIFlex>
          }
        >
          <StatisticsPage />
        </Suspense>
      );
    },
  },
  {
    path: '/admin-session',
    handle: { labelKey: 'webui.menu.Sessions' },
    Component: AdminSessionPage,
  },
  {
    path: '/environment',
    handle: { labelKey: 'webui.menu.Environments' },
    Component: EnvironmentPage,
  },
  {
    path: '/scheduler',
    handle: { labelKey: 'webui.menu.Scheduler' },
    Component: () => {
      const baiClient = useSuspendedBackendaiClient();
      return baiClient?.supports('fair-share-scheduling') ? (
        <Suspense fallback={<Skeleton active />}>
          <SchedulerPage />
          <SessionDetailAndContainerLogOpenerLegacy />
        </Suspense>
      ) : (
        <WebUINavigate to={'/error'} replace />
      );
    },
  },
  {
    path: '/agent',
    handle: { labelKey: 'webui.menu.Resources' },
    Component: ResourcesPage,
  },
  {
    path: '/resource-policy',
    handle: { labelKey: 'webui.menu.ResourcePolicies' },
    Component: ResourcePolicyPage,
  },
  {
    path: '/reservoir',
    handle: { labelKey: 'webui.menu.Reservoir' },
    children: [
      {
        path: '',
        Component: () => {
          const baiClient = useSuspendedBackendaiClient();
          return baiClient?.supports('reservoir') ? (
            <Suspense
              fallback={
                <BAIFlex direction="column" style={{ maxWidth: 700 }}>
                  <Skeleton active />
                </BAIFlex>
              }
            >
              <ReservoirPage />
            </Suspense>
          ) : (
            <WebUINavigate to={'/error'} replace />
          );
        },
      },
      {
        path: '/reservoir/:artifactId',
        Component: () => {
          const baiClient = useSuspendedBackendaiClient();
          return baiClient?.supports('reservoir') ? (
            <Suspense fallback={<Skeleton active />}>
              <ReservoirArtifactDetailPage />
            </Suspense>
          ) : (
            <WebUINavigate to={'/error'} replace />
          );
        },
        handle: { labelKey: 'webui.menu.ArtifactDetails' },
      },
    ],
  },
  {
    path: '/settings',
    element: <ConfigurationsPage />,
    handle: { labelKey: 'webui.menu.Configurations' },
  },
  {
    path: '/maintenance',
    element: <MaintenancePage />,
    handle: { labelKey: 'webui.menu.Maintenance' },
  },
  {
    path: '/diagnostics',
    element: <DiagnosticsPage />,
    handle: { labelKey: 'webui.menu.Diagnostics' },
  },
  {
    path: '/branding',
    element: <BrandingPage />,
    handle: { labelKey: 'webui.menu.Branding' },
  },
  {
    path: '/project',
    element: (
      <BAIErrorBoundary>
        <Suspense fallback={<Skeleton active />}>
          <ProjectPage />
        </Suspense>
      </BAIErrorBoundary>
    ),
    handle: { labelKey: 'webui.menu.Projects' },
  },
  {
    path: '/storage-settings/:hostname',
    handle: { labelKey: 'storageHost.StorageSetting' },
    Component: StorageHostSettingPage,
  },
  {
    path: '/information',
    handle: { labelKey: 'webui.menu.Information' },
    Component: Information,
  },
  {
    path: '/usersettings',
    handle: { labelKey: 'webui.menu.Settings&Logs' },
    Component: UserSettingsPage,
  },
  {
    path: '/admin-dashboard',
    handle: { labelKey: 'webui.menu.AdminDashboard' },
    Component: () => {
      return (
        <BAIErrorBoundary>
          <Suspense fallback={<Skeleton active />}>
            <AdminDashboardPage />
          </Suspense>
        </BAIErrorBoundary>
      );
    },
  },
  {
    path: '/credential',
    handle: { labelKey: 'webui.menu.UserCredentials&Policies' },
    Component: UserCredentialsPage,
  },
  {
    path: '/logs',
    handle: { labelKey: 'webui.menu.Logs' },
  },
  {
    path: '/error',
    handle: { hideBreadcrumb: true },
    Component: Page404,
  },
  // Catch-all route for unknown paths
  // Returns empty element to allow Lit components to handle plugin pages.
  // The PageAccessGuard in MainLayout checks if the current path is valid
  // and shows Page404 for truly unknown paths after plugins are loaded.
  {
    path: '*',
    element: <></>,
  },
  {
    path: '/ai-agent',
    handle: { labelKey: 'webui.menu.AIAgents' },
    Component: () => {
      const [experimentalAIAgents] = useBAISettingUserState(
        'experimental_ai_agents',
      );
      return experimentalAIAgents ? (
        <Suspense fallback={<Skeleton active />}>
          <AIAgentPage />
        </Suspense>
      ) : (
        <WebUINavigate to={'/start'} replace />
      );
    },
  },
];

/**
 * Root routes configuration
 */
export const routes: RouteObject[] = [
  {
    path: '/interactive-login',
    errorElement: <ErrorView />,
    element: (
      <BAIErrorBoundary>
        <DefaultProvidersForReactRoot>
          <LogoutEventHandler />
          <InteractiveLoginPage />
        </DefaultProvidersForReactRoot>
      </BAIErrorBoundary>
    ),
  },
  {
    path: '/verify-email',
    errorElement: <ErrorView />,
    element: (
      <BAIErrorBoundary>
        <DefaultProvidersForReactRoot>
          <EmailVerificationPage />
        </DefaultProvidersForReactRoot>
      </BAIErrorBoundary>
    ),
  },
  {
    path: '/change-password',
    errorElement: <ErrorView />,
    element: (
      <BAIErrorBoundary>
        <DefaultProvidersForReactRoot>
          <ChangePasswordPage />
        </DefaultProvidersForReactRoot>
      </BAIErrorBoundary>
    ),
  },
  {
    path: '/edu-applauncher',
    errorElement: <ErrorView />,
    element: (
      <BAIErrorBoundary>
        <DefaultProvidersForReactRoot>
          <EduAppLauncherPage />
        </DefaultProvidersForReactRoot>
      </BAIErrorBoundary>
    ),
  },
  {
    path: '/applauncher',
    errorElement: <ErrorView />,
    element: (
      <BAIErrorBoundary>
        <DefaultProvidersForReactRoot>
          <EduAppLauncherPage />
        </DefaultProvidersForReactRoot>
      </BAIErrorBoundary>
    ),
  },
  {
    path: '/',
    errorElement: <ErrorView />,
    element: (
      <BAIErrorBoundary>
        <DefaultProvidersForReactRoot>
          <Suspense>
            <LoginView />
          </Suspense>
          {/*FYI, MainLayout has ErrorBoundaryWithNullFallback for <Outlet/> */}
          <MainLayout />
          <ErrorBoundaryWithNullFallback>
            <RoutingEventHandler />
          </ErrorBoundaryWithNullFallback>
          <Suspense>
            <ErrorBoundaryWithNullFallback>
              <LoginViewLazy />
            </ErrorBoundaryWithNullFallback>
            <ErrorBoundaryWithNullFallback>
              <FolderExplorerOpener />
            </ErrorBoundaryWithNullFallback>
            <ErrorBoundaryWithNullFallback>
              <FolderInvitationResponseModalOpener />
            </ErrorBoundaryWithNullFallback>
            <ErrorBoundaryWithNullFallback>
              <FileUploadManager />
            </ErrorBoundaryWithNullFallback>
          </Suspense>
        </DefaultProvidersForReactRoot>
      </BAIErrorBoundary>
    ),
    children: mainLayoutChildRoutes,
  },
];

/**
 * Extract all valid route paths from the route configuration.
 * This includes both static paths and dynamic route patterns.
 */
function extractRoutePaths(
  routeObjects: RouteObject[],
  parentPath = '',
): { staticPaths: Set<string>; dynamicPatterns: RegExp[] } {
  const staticPaths = new Set<string>();
  const dynamicPatterns: RegExp[] = [];

  for (const route of routeObjects) {
    if (!route.path) {
      // Index routes or routes without path
      if (route.children) {
        const childResult = extractRoutePaths(route.children, parentPath);
        childResult.staticPaths.forEach((p) => staticPaths.add(p));
        dynamicPatterns.push(...childResult.dynamicPatterns);
      }
      continue;
    }

    // Skip catch-all routes
    if (route.path === '*') continue;

    // Build full path
    let fullPath = route.path;
    if (!fullPath.startsWith('/') && parentPath) {
      fullPath = `${parentPath}/${fullPath}`;
    }
    // Remove leading slash for consistency with currentPathKey comparison
    const normalizedPath = fullPath.replace(/^\//, '');

    // Check if path has dynamic segments (e.g., :id, :hostname)
    if (normalizedPath.includes(':')) {
      // Convert route pattern to regex
      // e.g., "serving/:serviceId" -> /^serving\/[^/]+$/
      // e.g., "chat/:id?" -> /^chat(\/[^/]+)?$/
      const regexPattern = normalizedPath
        .split('/')
        .map((segment) => {
          if (segment.startsWith(':') && segment.endsWith('?')) {
            // Optional parameter (e.g., :id?)
            return `(\\/[^/]+)?`;
          }
          if (segment.startsWith(':')) {
            // Required parameter (e.g., :id)
            return '[^/]+';
          }
          // Static segment
          return segment;
        })
        .join('\\/');
      dynamicPatterns.push(new RegExp(`^${regexPattern}$`));
    } else {
      // Static path - extract first segment for comparison
      const firstSegment = normalizedPath.split('/')[0];
      if (firstSegment) {
        staticPaths.add(firstSegment);
      }
    }

    // Recursively process children
    if (route.children) {
      const childResult = extractRoutePaths(route.children, fullPath);
      childResult.staticPaths.forEach((p) => staticPaths.add(p));
      dynamicPatterns.push(...childResult.dynamicPatterns);
    }
  }

  return { staticPaths, dynamicPatterns };
}

// Extract valid paths from mainLayoutChildRoutes (excluding root-level routes like /interactive-login)
const { staticPaths, dynamicPatterns } = extractRoutePaths(
  mainLayoutChildRoutes,
);

/**
 * Set of valid static route paths (first path segment only).
 * Derived from the router configuration.
 */
export const ROUTER_STATIC_PATHS = staticPaths;

/**
 * Array of regex patterns for dynamic routes.
 * Derived from the router configuration.
 */
export const ROUTER_DYNAMIC_PATTERNS = dynamicPatterns;
