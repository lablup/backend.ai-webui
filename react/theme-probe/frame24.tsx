/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 24 shot harness bootstrap — the common frame (sider + menu) and the
 route-error composition, mounted WITHOUT the app shell, auth or a backend.

 It is deliberately API-AGNOSTIC so the SAME file renders on the pre-migration
 tree (antd `Layout.Sider` + `Menu`) and on the migrated tree (Astryx
 `SideNav` + `SideNavSection`/`SideNavItem`), which is what makes an honest
 before/after pair possible:

   - every menu entry carries BOTH `label` (what antd `Menu` reads) and
     `labelText` (what the migrated `BAIMenu` reads);
   - group entries carry `type: 'group'` + `children`, which both renderers
     understand;
   - sider props are passed as a superset (`theme` for the antd Sider,
     `footer` for the Astryx SideNav) through an `any` cast.

 Serve under the theme-probe Vite harness:

   cd react && pnpm exec vite --config theme-probe/vite.config.mts --port 5706
   -> http://127.0.0.1:5706/theme-probe/frame24.html?case=sider
   -> http://127.0.0.1:5706/theme-probe/frame24.html?case=routeError
*/
const stubClient = {
  ready: true,
  current_group: 'default',
  email: 'probe@lablup.com',
  is_superadmin: true,
  _config: {
    hideAgents: false,
    domainName: 'default',
    allowSignout: true,
  },
  supports: () => true,
  isManagerVersionCompatibleWith: () => true,
  isAPIVersionCompatibleWith: () => true,
};

// @ts-ignore — the app reads this global (see react/src/hooks/index.tsx).
globalThis.backendaiclient = stubClient;
// @ts-ignore — read by the sider footer.
globalThis.packageVersion = '26.8.0';
// @ts-ignore
globalThis.buildNumber = '0000';

void import('./frame24Main');
