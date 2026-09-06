import BAIAppShell from './BAIAppShell';
import {
  SideNav,
  SideNavItem,
  SideNavSection,
} from '@astryxdesign/core/SideNav';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAIAppShell is the Astryx `AppShell` wired as a Backend.AI shell frame:
 * an inline side navigation above the `md` breakpoint, a `MobileNav` drawer
 * below it, and the drawer's open state owned by the shell.
 */
const meta: Meta<typeof BAIAppShell> = {
  title: 'Layout/BAIAppShell',
  component: BAIAppShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
**BAIAppShell** composes Astryx \`AppShell\` + \`MobileNav\` into one reusable shell.

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`banner\` | \`ReactNode\` | – | Full-width slot above everything (announcements) |
| \`sideNav\` | \`ReactNode\` | – | Inline side navigation, >=768px |
| \`drawer\` | \`BAIAppShellDrawer\` | – | Mobile drawer (<768px). Omit to disable mobile nav entirely |
| \`pathname\` | \`string\` | – | Current route pathname; a CHANGE closes the drawer |
| \`variant\` | \`AppShellVariant\` | \`'wash'\` | Astryx AppShell background variant |
| \`contentPadding\` | \`SpacingStep\` | \`0\` | Padding of the main content area |

Narrow the preview below the \`md\` breakpoint to see the drawer replace the rail.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIAppShell>;

const DemoNav = () => (
  <SideNavSection title="Workloads">
    <SideNavItem label="Sessions" href="#sessions" />
    <SideNavItem label="Storage" href="#storage" />
    <SideNavItem label="Models" href="#models" />
  </SideNavSection>
);

export const Default: Story = {
  render: () => (
    <div style={{ height: 480 }}>
      <BAIAppShell
        data-testid="story-app-shell"
        banner={
          <div
            style={{
              padding: 'var(--spacing-2) var(--spacing-4)',
              background: 'var(--color-background-surface)',
            }}
          >
            Scheduled maintenance tonight at 23:00 KST.
          </div>
        }
        sideNav={
          <SideNav>
            <DemoNav />
          </SideNav>
        }
        drawer={{
          label: 'Menu',
          header: <strong>Backend.AI</strong>,
          children: <DemoNav />,
        }}
        pathname="/sessions"
      >
        <div style={{ padding: 'var(--spacing-6)' }}>
          Page content lives here. The shell never scrolls it — the host owns
          its own scroll column inside this slot.
        </div>
      </BAIAppShell>
    </div>
  ),
};
