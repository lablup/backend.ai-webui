import BAIFlex from './BAIFlex';
import {
  CloseCircleTwoTone,
  RightOutlined,
  WarningTwoTone,
} from '@ant-design/icons';
import { Button, Card, theme, type CardProps } from 'antd';
import * as _ from 'lodash-es';
import React, { cloneElement, isValidElement, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Props interface for BAICard component.
 * Extends Ant Design Card props with additional Backend.AI-specific customizations.
 */
export interface BAICardProps extends Omit<CardProps, 'extra'> {
  /** Visual status of the card affecting border color and extra button icons */
  status?: 'success' | 'error' | 'warning' | 'default';
  /** Custom content to display in the header area */
  extra?: ReactNode;
  /** Title for the extra button that appears in the header */
  extraButtonTitle?: string | ReactNode;
  /** Show header divider. Automatically enabled when tabList is specified */
  showDivider?: boolean;
  /** Callback function triggered when the extra button is clicked */
  onClickExtraButton?: () => void;
  /**
   * When true, the card body can be collapsed/expanded via a chevron toggle
   * in the header. Existing usages are unaffected unless this is set.
   */
  collapsible?: boolean;
  /** Controlled collapsed state. Use together with `onCollapsedChange`. */
  collapsed?: boolean;
  /** Initial collapsed state for uncontrolled usage. Defaults to `false`. */
  defaultCollapsed?: boolean;
  /** Callback fired with the next collapsed state when the header is toggled. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** React ref for the card container */
  ref?: React.Ref<HTMLDivElement> | undefined;
}

/**
 * BAICard component - Enhanced Ant Design Card with Backend.AI-specific features.
 *
 * Provides a flexible card interface with status-based styling, customizable headers,
 * and integrated action buttons. Supports all standard Ant Design Card features
 * while adding Backend.AI design system enhancements.
 *
 * @param props - BAICardProps configuration object
 * @returns React functional component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <BAICard title="Basic Card">
 *   <p>Card content goes here</p>
 * </BAICard>
 *
 * // With status and extra button
 * <BAICard
 *   title="Error Card"
 *   status="error"
 *   extraButtonTitle="Fix Error"
 *   onClickExtraButton={() => handleError()}
 * >
 *   <p>Error details...</p>
 * </BAICard>
 *
 * // With tabs
 * <BAICard
 *   title="Tabbed Card"
 *   tabList={[
 *     { key: 'tab1', label: 'Tab 1' },
 *     { key: 'tab2', label: 'Tab 2' }
 *   ]}
 *   activeTabKey="tab1"
 *   onTabChange={(key) => setActiveTab(key)}
 * >
 *   <p>Tab content...</p>
 * </BAICard>
 * ```
 */
const BAICard: React.FC<BAICardProps> = ({
  status = 'default',
  extraButtonTitle,
  onClickExtraButton,
  extra,
  style,
  styles,
  showDivider,
  collapsible,
  collapsed,
  defaultCollapsed,
  onCollapsedChange,
  ...cardProps
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const [internalCollapsed, setInternalCollapsed] = useState(
    defaultCollapsed ?? false,
  );
  // Controlled when `collapsed` is provided, otherwise uncontrolled.
  const mergedCollapsed = collapsible
    ? (collapsed ?? internalCollapsed)
    : false;
  const toggleCollapsed = () => {
    const next = !mergedCollapsed;
    if (collapsed === undefined) {
      setInternalCollapsed(next);
    }
    onCollapsedChange?.(next);
  };

  const extraWithoutFontWeight = isValidElement(extra)
    ? cloneElement(extra as React.ReactElement<any>, {
        style: { fontWeight: 'normal' },
      })
    : extra;

  const _extra =
    extraWithoutFontWeight ||
    (extraButtonTitle && (
      <Button
        type="link"
        icon={
          status === 'error' ? (
            <CloseCircleTwoTone twoToneColor={token.colorError} />
          ) : status === 'warning' ? (
            <WarningTwoTone twoToneColor={token.colorWarning} />
          ) : undefined
        }
        onClick={onClickExtraButton}
      >
        {extraButtonTitle}
      </Button>
    )) ||
    undefined;

  return (
    <Card
      className={status === 'error' ? 'bai-card-error' : ''}
      style={_.extend(style, {
        borderColor:
          status === 'error'
            ? token.colorError
            : status === 'warning'
              ? token.colorWarning
              : status === 'success'
                ? token.colorSuccess
                : style?.borderColor, // default
      })}
      styles={_.merge(
        // Auto-enable divider when tabList is specified; hide divider when collapsed
        (!showDivider || (collapsible && mergedCollapsed)) && !cardProps.tabList
          ? {
              header: {
                borderBottom: 'none',
                // Fix: https://app.graphite.dev/github/pr/lablup/backend.ai-webui/3927/feat(FR-878%2C-FR-1228)-My-resource-usage%2Fcapacity?org=lablup#review-PRR_kwDOCRTcws61NwR1
                // Cover the marginBottom issue
                marginBottom: 2,
              },
            }
          : {},
        // Reduce padding when tabList is specified
        cardProps.tabList
          ? {
              body: {
                paddingTop:
                  cardProps.size === 'small' ? token.paddingSM : token.padding,
              },
            }
          : {},
        styles,
        // Hide the body while collapsed (kept last so it wins the merge).
        collapsible && mergedCollapsed ? { body: { display: 'none' } } : {},
      )}
      {...cardProps}
      title={
        cardProps.title || extra || collapsible ? (
          <BAIFlex
            justify={cardProps.title || collapsible ? 'between' : 'end'}
            align="center"
            wrap="wrap"
            gap="sm"
          >
            {collapsible ? (
              <BAIFlex
                align="center"
                gap="xs"
                style={{ cursor: 'pointer', flex: 1, minWidth: 0 }}
                role="button"
                tabIndex={0}
                aria-expanded={!mergedCollapsed}
                aria-label={
                  cardProps.title
                    ? undefined
                    : mergedCollapsed
                      ? t('general.button.Expand')
                      : t('general.button.Collapse')
                }
                onClick={toggleCollapsed}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleCollapsed();
                  }
                }}
              >
                <RightOutlined
                  rotate={mergedCollapsed ? 0 : 90}
                  style={{
                    fontSize: token.fontSizeSM,
                    color: token.colorTextTertiary,
                    transition: 'transform 0.2s',
                  }}
                />
                {cardProps.title}
              </BAIFlex>
            ) : (
              cardProps.title
            )}
            <BAIFlex>{_extra}</BAIFlex>
          </BAIFlex>
        ) : null
      }
    />
  );
};

BAICard.displayName = 'BAICard';

export default BAICard;
