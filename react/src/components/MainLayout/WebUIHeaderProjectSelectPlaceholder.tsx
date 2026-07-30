/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import ReverseThemeProvider from '../ReverseThemeProvider';
import { theme, Tooltip, Typography, Grid } from 'antd';
import { BAISelect } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

/**
 * A static, selector-shaped placeholder for the header's left slot on
 * project-agnostic `/admin/*` pages (FR-3422; alternative to FR-3414's
 * "hide the selector entirely").
 *
 * This is deliberately NOT `WebUIHeaderProjectSelect` rendered disabled.
 * `WebUIHeaderProjectSelect` was extracted in FR-3414 precisely so the
 * header performs zero ambient current-project reads/writes and issues no
 * accessible-projects query on these pages -- which is also what keeps the
 * dev-mode straggler warning in `useCurrentProject` silent here. Mounting
 * the real component in a disabled state would reintroduce every one of
 * those hooks and regress that guarantee. This component reads no project
 * hook, fetches nothing, and holds no state -- it only mirrors the real
 * selector's visual footprint (label treatment, width, `BAIFlex` wrapper)
 * with a fixed "All projects" value and an explanatory tooltip.
 */
const WebUIHeaderProjectSelectPlaceholder: React.FC = () => {
  'use memo';
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const gridBreakpoint = Grid.useBreakpoint();

  return (
    <>
      {gridBreakpoint.sm && (
        <ReverseThemeProvider>
          <Typography.Text
            style={{
              fontWeight: 600, // semi-bold
              fontSize: token.fontSizeLG,
            }}
          >
            {t('webui.menu.Project')}
          </Typography.Text>
        </ReverseThemeProvider>
      )}
      <Tooltip title={t('header.AllProjectsTooltip')}>
        {/* Wrap with span so the Tooltip still receives mouseenter: a
            disabled Select swallows pointer events, so a Tooltip attached
            directly to it (as BAISelect's own `tooltip` prop would do)
            never fires. */}
        <span style={{ display: 'inline-block' }}>
          <BAISelect
            data-testid="selector-project-placeholder"
            ghost
            disabled
            aria-label={t('header.AllProjectsTooltip')}
            popupMatchSelectWidth={false}
            style={{
              minWidth: 100,
              maxWidth: gridBreakpoint.lg ? undefined : 150,
            }}
            className="non-draggable"
            value="all-projects"
            options={[
              { label: t('header.AllProjects'), value: 'all-projects' },
            ]}
          />
        </span>
      </Tooltip>
    </>
  );
};

export default WebUIHeaderProjectSelectPlaceholder;
