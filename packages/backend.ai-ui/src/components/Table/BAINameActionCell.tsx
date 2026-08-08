import { App } from '../../app-shim';
import { useEventNotStable } from '../../hooks/useEventNotStable';
import { theme } from '../../theme-shim';
import BAIButton from '../BAIButton';
import BAILink from '../BAILink';
import BAIText from '../BAIText';
import './BAINameActionCell.css';
import { Dropdown, Popconfirm, Tooltip } from 'antd';
import type { MenuProps, PopconfirmProps } from 'antd';
import classNames from 'classnames';
import { EllipsisVertical } from 'lucide-react';
import React, { useEffect, useRef, useState, useTransition } from 'react';
import type { LinkProps } from 'react-router-dom';

export interface BAINameActionCellAction {
  /** Unique key for React rendering and overflow tracking */
  key: string;
  /** Label shown as tooltip on icon buttons and as text in overflow menu */
  title: string;
  /** Icon rendered in both button and menu form */
  icon?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Async click handler with automatic loading state (mirrors BAIButton.action) */
  action?: () => Promise<void>;
  /**
   * Visual style type:
   * - 'default': colorInfo text on colorInfoBg background
   * - 'danger': colorError text on colorErrorBg background
   */
  type?: 'default' | 'danger';
  /** Whether the action is disabled */
  disabled?: boolean;
  /** Tooltip text when disabled */
  disabledReason?: string;
  /** Custom style override for the action button */
  style?: React.CSSProperties;
  /**
   * Where to show the action:
   * - 'auto': shown as button when space allows, otherwise in more menu (default)
   * - 'always': always shown only in the more menu
   */
  showInMenu?: 'auto' | 'always';
  /**
   * Ant Design Popconfirm props to gate the action behind a confirmation
   * popover. When set, the visible icon button is wrapped with `<Popconfirm>`
   * and the confirm action should be wired via `popConfirm.onConfirm`.
   *
   * When the action overflows into the more menu, the menu item falls back
   * to a `Modal.confirm` dialog that mirrors the popConfirm title,
   * description, okText, cancelText, and button props — so the
   * confirmation UI is preserved in both visible and overflow states.
   * If `onClick`/`action` is also set, those take precedence and the
   * popConfirm is ignored in the overflow menu.
   */
  popConfirm?: Omit<PopconfirmProps, 'children'>;
}

export interface BAINameActionCellProps {
  /** Icon displayed before the title text */
  icon?: React.ReactNode;
  /** Title text or custom content */
  title?: React.ReactNode;
  /** React Router path for making the title a link */
  to?: LinkProps['to'];
  /** Click handler for the title (used when `to` is not provided) */
  onTitleClick?: (e: React.MouseEvent) => void;
  /** Action definitions rendered as icon buttons, collapsing into overflow menu */
  actions?: BAINameActionCellAction[];
  /** When to show the actions area. Default: 'hover' */
  showActions?: 'hover' | 'always';
  /** Minimum number of action buttons to keep visible before overflow. Default: 0 */
  minVisibleActions?: number;
  /** Disable the overflow More (…) button. Individual menu items remain visible. */
  moreMenuDisabled?: boolean;
  /** Show a copy-to-clipboard icon on hover next to the title text */
  copyable?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

// Estimated width per action button (icon button small size)
const ACTION_BUTTON_WIDTH = 24;
const MORE_BUTTON_WIDTH = 24;
const ACTIONS_GAP = 2;

const BAINameActionCell: React.FC<BAINameActionCellProps> = ({
  icon,
  title,
  to,
  onTitleClick,
  actions,
  showActions = 'hover',
  minVisibleActions = 0,
  moreMenuDisabled,
  copyable,
  style,
  className,
}) => {
  'use memo';
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const [, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleAreaRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState<number>(
    actions?.length ?? 0,
  );

  // Split actions into button-candidates (auto) and menu-only (always)
  const autoActions = actions?.filter((a) => a.showInMenu !== 'always') ?? [];
  const menuOnlyActions =
    actions?.filter((a) => a.showInMenu === 'always') ?? [];
  const autoActionCount = autoActions.length;

  // The `undefined` sentinel makes the reset also run on the first render;
  // the ResizeObserver effect then recomputes the width-constrained count.
  const [prevAutoActionCount, setPrevAutoActionCount] = useState<
    number | undefined
  >(undefined);
  if (autoActionCount !== prevAutoActionCount) {
    setPrevAutoActionCount(autoActionCount);
    setVisibleCount(autoActionCount);
  }

  const calculateVisibleActions = useEventNotStable(
    (containerWidth: number) => {
      const titleIcon = titleAreaRef.current?.querySelector(
        '.bai-name-action-cell-title-icon',
      );
      const titleIconWidth = titleIcon ? titleIcon.clientWidth : 0;
      const minTitleReserve = titleIconWidth + token.marginXXS + 40;
      // Account for the more button which is always shown when menuOnlyActions exist
      const moreButtonReserve =
        menuOnlyActions.length > 0 ? MORE_BUTTON_WIDTH + ACTIONS_GAP : 0;
      const availableWidth =
        (showActions === 'hover'
          ? containerWidth
          : containerWidth - minTitleReserve) - moreButtonReserve;

      if (availableWidth <= 0) {
        setVisibleCount(Math.max(0, minVisibleActions));
        return;
      }

      const totalButtonsWidth = (width: number, count: number) =>
        count * width + Math.max(0, count - 1) * ACTIONS_GAP;

      if (
        totalButtonsWidth(ACTION_BUTTON_WIDTH, autoActionCount) <=
        availableWidth
      ) {
        setVisibleCount(autoActionCount);
        return;
      }

      const widthForMoreButton =
        menuOnlyActions.length > 0 ? 0 : MORE_BUTTON_WIDTH + ACTIONS_GAP;
      const remainingWidth = availableWidth - widthForMoreButton;

      let count = 0;
      for (let i = 0; i < autoActionCount; i++) {
        const neededWidth = totalButtonsWidth(ACTION_BUTTON_WIDTH, i + 1);
        if (neededWidth <= remainingWidth) {
          count = i + 1;
        } else {
          break;
        }
      }

      setVisibleCount(Math.max(count, minVisibleActions));
    },
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || autoActionCount === 0) return;

    calculateVisibleActions(container.clientWidth);
    let rafId: number;
    const ro = new ResizeObserver((entries) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const width = entries[0]?.contentRect.width ?? container.clientWidth;
        calculateVisibleActions(width);
      });
    });
    ro.observe(container);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [autoActionCount, calculateVisibleActions]);

  const hasOverflow = visibleCount < autoActionCount;
  const visibleActions = autoActions.slice(0, visibleCount);

  // More menu: overflowed auto actions + menu-only actions
  const hasMoreMenu = hasOverflow || menuOnlyActions.length > 0;
  const toMenuItem = (action: BAINameActionCellAction) => ({
    key: action.key,
    label: action.title,
    icon: action.icon,
    danger: action.type === 'danger',
    disabled: action.disabled,
    onClick: () => {
      if (action.onClick || action.action) {
        action.onClick?.();
        if (action.action) {
          startTransition(async () => {
            await action.action!();
          });
        }
        return;
      }
      if (action.popConfirm) {
        const {
          title: confirmTitle,
          description,
          okText,
          cancelText,
          okButtonProps,
          cancelButtonProps,
          onConfirm,
          onCancel,
        } = action.popConfirm;
        const resolveNode = (
          value: PopconfirmProps['title'] | PopconfirmProps['description'],
        ): React.ReactNode =>
          typeof value === 'function' ? value() : (value ?? null);
        modal.confirm({
          title: resolveNode(confirmTitle),
          content: resolveNode(description),
          okText,
          cancelText,
          okButtonProps,
          cancelButtonProps,
          okType: okButtonProps?.danger ? 'danger' : 'primary',
          onOk: () => onConfirm?.(),
          onCancel: () => onCancel?.(),
        });
      }
    },
  });
  const menuItems: MenuProps['items'] = [
    ...autoActions.slice(visibleCount).map(toMenuItem),
    ...(hasOverflow && menuOnlyActions.length > 0
      ? [{ type: 'divider' as const }]
      : []),
    ...menuOnlyActions.map(toMenuItem),
  ];

  const copyableConfig = copyable
    ? { text: typeof title === 'string' ? title : '' }
    : undefined;

  const renderTitle = () => {
    if (to) {
      return (
        <BAIText copyable={copyableConfig} ellipsis={{ tooltip: true }}>
          <BAILink
            to={to}
            type="hover"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
              minWidth: 0,
            }}
          >
            {title}
          </BAILink>
        </BAIText>
      );
    }
    if (onTitleClick) {
      return (
        <BAIText copyable={copyableConfig} ellipsis={{ tooltip: true }}>
          <BAILink type="hover" onClick={onTitleClick} ellipsis>
            {title}
          </BAILink>
        </BAIText>
      );
    }
    return (
      <BAIText
        ellipsis={{ tooltip: true }}
        copyable={copyableConfig}
        style={{ minWidth: 0 }}
      >
        {title}
      </BAIText>
    );
  };

  return (
    <div
      ref={containerRef}
      className={classNames(
        'bai-nac-wrapper',
        showActions === 'hover' && 'bai-nac-hover-wrapper',
        className,
      )}
      style={style}
    >
      <div ref={titleAreaRef} className="bai-nac-title-area">
        {icon && (
          <span className="bai-nac-title-icon bai-name-action-cell-title-icon">
            {icon}
          </span>
        )}
        {renderTitle()}
      </div>
      {(autoActionCount > 0 || menuOnlyActions.length > 0) && (
        <div
          className={classNames(
            showActions === 'hover'
              ? 'bai-nac-actions-hover'
              : 'bai-nac-actions',
            'bai-name-action-cell-actions',
          )}
        >
          {visibleActions.map((action) => {
            const buttonClassName = action.disabled
              ? 'bai-nac-action-button-disabled'
              : action.type === 'danger'
                ? 'bai-nac-action-button-danger'
                : 'bai-nac-action-button-default';

            const button = (
              <BAIButton
                type="text"
                size="small"
                icon={action.icon}
                aria-label={action.title}
                disabled={action.disabled}
                className={buttonClassName}
                style={action.style}
                onClick={action.onClick}
                action={action.action}
              />
            );

            return (
              <Tooltip
                key={action.key}
                title={action.disabled ? action.disabledReason : action.title}
              >
                {action.popConfirm && !action.disabled ? (
                  <Popconfirm {...action.popConfirm}>{button}</Popconfirm>
                ) : (
                  button
                )}
              </Tooltip>
            );
          })}
          {hasMoreMenu && (
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <BAIButton
                type="text"
                size="small"
                icon={<EllipsisVertical size="1em" />}
                aria-label="More actions"
                disabled={moreMenuDisabled}
              />
            </Dropdown>
          )}
        </div>
      )}
    </div>
  );
};

export default BAINameActionCell;
