import type { LogoConfig } from '../branding-schema';
import { useBranding } from './hooks/useBranding';
import { useThemeMode } from './hooks/useThemeMode';
import { useAppShellStyles } from './styles';
import type { AppShellSiderProps } from './types';
import { Layout, Tooltip, theme as antdTheme } from 'antd';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface LogoImageProps {
  src: string;
  size: LogoConfig['size'];
  alt: string;
  className?: string;
}

function LogoImage({ src, size, alt, className }: LogoImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={size?.width}
      height={size?.height}
      className={className}
      draggable={false}
      style={{ maxWidth: '100%', height: 'auto', userSelect: 'none' }}
    />
  );
}

function DefaultSiderHeader({ collapsed }: { collapsed: boolean }) {
  const { logo, branding } = useBranding();
  const { isDarkMode } = useThemeMode();
  const { token } = antdTheme.useToken();
  const { styles } = useAppShellStyles();

  if (!logo?.src) {
    return (
      <span
        className={styles.brandText}
        style={{ fontSize: token.fontSizeLG, fontWeight: 600 }}
      >
        {branding?.brandName ?? 'Backend.AI'}
      </span>
    );
  }

  const alt = logo.alt ?? branding?.brandName ?? 'Logo';

  // Pick the active logo variant based on collapsed + theme. Falls back to
  // simpler variants when more specific ones aren't supplied.
  let activeSrc = logo.src;
  let activeSize = logo.size;
  if (collapsed) {
    activeSrc = isDarkMode
      ? (logo.srcCollapsedDark ?? logo.srcCollapsed ?? logo.srcDark ?? logo.src)
      : (logo.srcCollapsed ?? logo.src);
    activeSize = logo.sizeCollapsed ?? logo.size;
  } else if (isDarkMode) {
    activeSrc = logo.srcDark ?? logo.src;
  }

  const image = <LogoImage src={activeSrc} size={activeSize} alt={alt} />;

  if (logo.href) {
    return (
      <a href={logo.href} className={styles.logoLink} aria-label={alt}>
        {image}
      </a>
    );
  }
  return image;
}

/** Inline kbd-style hint shown inside the edge-toggle tooltip. */
function KbdHint({ children }: { children: string }) {
  return (
    <kbd
      style={{
        marginLeft: 6,
        padding: '0 5px',
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
        fontSize: 11,
        lineHeight: '16px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.08)',
      }}
    >
      {children}
    </kbd>
  );
}

export function AppShellSider({
  collapsed,
  onToggleCollapse,
  onBreakpointCollapse,
  showEdgeToggle = true,
  header,
  children,
  footer,
}: AppShellSiderProps) {
  const { sider } = useBranding();
  const { styles, cx } = useAppShellStyles();
  const [hovered, setHovered] = useState(false);
  const ToggleIcon = collapsed ? ChevronRight : ChevronLeft;
  const tooltipLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar';

  return (
    <Layout.Sider
      width={sider?.widthExpanded ?? 240}
      collapsedWidth={sider?.widthCollapsed ?? 74}
      collapsed={collapsed}
      collapsible
      trigger={null}
      breakpoint="lg"
      onBreakpoint={(broken) => onBreakpointCollapse?.(broken)}
      className={cx(styles.sider, collapsed && styles.siderCollapsed)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={cx(
          styles.siderHeader,
          collapsed && styles.siderHeaderCollapsed,
        )}
      >
        {header ?? <DefaultSiderHeader collapsed={collapsed} />}
      </div>
      {showEdgeToggle && onToggleCollapse && (
        <Tooltip
          placement="right"
          title={
            <>
              {tooltipLabel}
              <KbdHint>[</KbdHint>
            </>
          }
        >
          <button
            type="button"
            className={cx(
              styles.edgeToggle,
              hovered && styles.edgeToggleVisible,
            )}
            onClick={onToggleCollapse}
            aria-label={tooltipLabel}
            tabIndex={0}
          >
            <ToggleIcon size={14} aria-hidden="true" />
          </button>
        </Tooltip>
      )}
      <div
        className={cx(
          styles.siderContent,
          hovered && styles.siderContentHovering,
        )}
      >
        {children}
      </div>
      {footer && !collapsed && (
        <div className={styles.siderFooter}>{footer}</div>
      )}
    </Layout.Sider>
  );
}
