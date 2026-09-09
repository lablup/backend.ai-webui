import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAppShell',
  displayName: 'BAI App Shell',
  category: 'Layout',
  keywords: [
    'app shell',
    'layout',
    'sidebar',
    'side nav',
    'drawer',
    'mobile nav',
    'scaffold',
  ],
  usage: {
    description:
      "The application frame: an optional full-width banner, an inline side navigation rail at and above the `md` breakpoint, a drawer below it, and the routed page as children. It wraps Astryx AppShell and owns the one piece AppShell leaves to the host — the drawer's open state. The drawer is an Astryx MobileNav, a native modal dialog, so focus trapping, body scroll lock and the backdrop come for free; no toggle bar is rendered because the host header's own hamburger opens it through AppShell's mobile context. Two resets are built in: a change of `pathname` closes the drawer, and leaving the mobile breakpoint clears the open state using AppShell's own breakpoint verdict rather than a second media query that could disagree at exactly the boundary.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Feed `pathname` from the router so selecting a menu entry closes the drawer; without it the drawer stays open across navigations.',
      },
      {
        guidance: true,
        description:
          'Give the drawer the same width as the inline rail, so a menu row is the same size on both surfaces.',
      },
      {
        guidance: true,
        description:
          'Pass the drawer a translated `label` — it is the accessible name of the dialog, and the library holds no host translations.',
      },
      {
        guidance: true,
        description:
          "Use the drawer's `wrap` callback for the theme-polarity provider the brand band needs, instead of reaching into the drawer markup.",
      },
      {
        guidance: false,
        description:
          'Render your own overlay or scroll lock around the drawer; the native dialog already provides both, and a second one fights it.',
      },
      {
        guidance: false,
        description:
          "Give the drawer content a stack gap — it lands between the menu sections and stretches the row pitch past the rail's row height.",
      },
    ],
  },
  props: [
    {
      name: 'banner',
      type: 'ReactNode',
      description:
        'Full-width slot above navigation and content, for announcements. Wrap it in an error boundary and Suspense, since it usually loads data.',
    },
    {
      name: 'sideNav',
      type: 'ReactNode',
      description:
        'The inline navigation rail, rendered at and above the `md` breakpoint.',
    },
    {
      name: 'drawer',
      type: 'BAIAppShellDrawer',
      description:
        'The mobile drawer below the `md` breakpoint: `children` (nav content, rendered in drawer-content mode so activating an item closes the drawer), `header` (brand-band content such as the logo), `label` (accessible name of the dialog), `width` in px (defaults to 240), `wrap` (a callback that wraps the drawer element, used for the theme-polarity provider) and `data-testid`. Omit the whole object to disable mobile navigation.',
    },
    {
      name: 'pathname',
      type: 'string',
      description:
        'Current route path. A change to it closes the drawer; the value itself is not rendered.',
    },
    {
      name: 'variant',
      type: "ComponentProps<typeof AppShell>['variant']",
      description:
        'Astryx AppShell surface variant. `wash` paints the body background token behind both nav and content.',
      default: "'wash'",
    },
    {
      name: 'contentPadding',
      type: "ComponentProps<typeof AppShell>['contentPadding']",
      description:
        'Padding around the content region. Zero by default so each page owns its own insets.',
      default: '0',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'The routed page content, rendered in the content region.',
      required: true,
    },
    {
      name: 'data-testid',
      type: 'string',
      description:
        'Test id forwarded to the AppShell root. The drawer takes its own through the drawer object.',
    },
  ],
  examples: [
    {
      label: 'Application frame with rail and mobile drawer',
      code: `<BAIAppShell
  variant="wash"
  contentPadding={0}
  pathname={location.pathname}
  banner={
    <ErrorBoundaryWithNullFallback>
      <Suspense fallback={null}>
        <AnnouncementBanner />
      </Suspense>
    </ErrorBoundaryWithNullFallback>
  }
  sideNav={<WebUISider collapsed={sideCollapsed} onCollapse={setSideCollapsed} />}
  drawer={{
    header: <WebUISiderLogo />,
    label: t('webui.menu.Menu'),
    width: SIDER_WIDTH,
    children: (
      <>
        <WebUISiderNavigation />
        <WebUISiderFooter />
      </>
    ),
  }}
>
  <Outlet />
</BAIAppShell>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
