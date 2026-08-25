import { App } from '../../app-shim';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { useEventNotStable } from '../../hooks/useEventNotStable';
import { theme } from '../../theme-shim';
import BAIButton from '../BAIButton';
import BAILink from '../BAILink';
import BAIText from '../BAIText';
import './BAINameActionCell.css';
import { Button } from '@astryxdesign/core/Button';
import {
  DropdownMenu,
  type DropdownMenuOption,
} from '@astryxdesign/core/DropdownMenu';
import { Popover } from '@astryxdesign/core/Popover';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
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
  popConfirm?: BAIPopconfirmConfig;
}

/**
 * The antd `PopconfirmProps` subset every call site actually passes, restated
 * locally (to-astryx W2-D). Measured across the 11 live `popConfirm` objects
 * in `ResourceGroupList`, `AdminUserCredentialList` ×2, `AdminUserManagement`,
 * `QuotaScopeTable`, `DeploymentRevisionHistoryTab`, `LoginSession`,
 * `RBACManagementPage` ×2 and `ProjectPage` ×2: `title`, `description`,
 * `okText`, `cancelText`, `okButtonProps.danger`, `onConfirm`, `onCancel`.
 * Keeping antd's own type was the last thing holding this module in the antd
 * import graph (P15), and the wide type advertised knobs — `placement`,
 * `icon`, `overlayStyle`, `getPopupContainer` — that Astryx's `Popover` does
 * not have.
 */
export interface BAIPopconfirmConfig {
  title?: React.ReactNode;
  /**
   * Accepted and inert: Astryx's `Popover` splits antd's compound placement
   * into `placement` + `alignment`, and the confirm popover anchors itself to
   * the row action. One call site (`QuotaScopeTable`) passes `'bottom'`, which
   * is already the Astryx default.
   */
  placement?: string;
  description?: React.ReactNode;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  okButtonProps?: { danger?: boolean; disabled?: boolean };
  cancelButtonProps?: { disabled?: boolean };
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
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

/**
 * The anchored confirmation an antd `Popconfirm` used to provide.
 *
 * PILOT-DECISION (to-astryx W2-D): MAPPING §2 grades `Popconfirm` as **NONE** —
 * "compose `Popover` + buttons, or escalate to `AlertDialog`". This is the
 * compose branch — the same shape the pilot
 * cell shipped before it was folded onto this component.
 * What changes against antd: the confirm/cancel pair is a real `HStack` of
 * `Button`s inside the popover body rather than antd's built-in footer, and
 * `okButtonProps.danger` maps onto `variant="destructive"`. What is preserved:
 * the anchored placement, light dismiss, and the fact that the destructive
 * action still needs two clicks (the contract
 * `.claude/rules/destructive-confirmation.md` cares about).
 */
const ConfirmPopoverButton: React.FC<{
  action: BAINameActionCellAction;
  confirm: BAIPopconfirmConfig;
  className?: string;
}> = ({ action, confirm, className }) => {
  'use memo';
  const { t } = useBAIi18n();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      label={action.title}
      role="dialog"
      width={260}
      content={
        <VStack gap={2} padding={2} align="stretch">
          <Text weight="semibold">{confirm.title}</Text>
          {confirm.description ? (
            <Text color="secondary">{confirm.description}</Text>
          ) : null}
          <HStack gap={2} justify="end">
            <Button
              size="sm"
              variant="secondary"
              label={
                typeof confirm.cancelText === 'string'
                  ? confirm.cancelText
                  : t('general.button.Cancel')
              }
              onClick={() => {
                setIsOpen(false);
                confirm.onCancel?.();
              }}
            />
            <Button
              size="sm"
              variant={
                confirm.okButtonProps?.danger ? 'destructive' : 'primary'
              }
              label={
                typeof confirm.okText === 'string'
                  ? confirm.okText
                  : t('general.button.Confirm')
              }
              isDisabled={confirm.okButtonProps?.disabled}
              clickAction={async () => {
                setIsOpen(false);
                await confirm.onConfirm?.();
              }}
            />
          </HStack>
        </VStack>
      }
    >
      <BAIButton
        type="text"
        size="small"
        icon={action.icon}
        aria-label={action.title}
        title={action.title}
        className={className}
        style={action.style}
      />
    </Popover>
  );
};

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
  const { t } = useBAIi18n();
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
  // PILOT-DECISION (to-astryx W2-D): `DropdownMenuItemData` has no `danger`
  // flag AND its `label` is typed `string`, not `ReactNode` — its rows are
  // uniform (P5). A destructive overflow row therefore relies on its icon and
  // label alone, exactly as it already does inside the `modal.confirm` it
  // escalates to. The visible (non-overflowed) button keeps its danger tint
  // through `bai-nac-action-button-danger`.
  //
  // Re-examined for QA-FINDINGS Q-15 ("더보기 버튼을 눌렀을 때 버튼 색상이 모두
  // default 색상으로 처리됨", measured #141414/#FFFFFF where antd set
  // `danger: action.type === 'danger'` and drew #FF4D4F/#BE3D3F). The colour IS
  // reachable — but only through `DropdownMenu`'s COMPOUND mode, whose
  // `DropdownMenuItem` takes `label: ReactNode` plus `style`. That means
  // rewriting this menu's whole render path (data `items` -> children),
  // carrying the divider, disabled and keyboard behaviour across with it, for a
  // change the reporter themselves marked optional. Left as-is and reported
  // rather than taken on inside a QA row.
  const toMenuItem = (action: BAINameActionCellAction) => ({
    // FR-3423: a disabled action must still explain itself once it overflows
    // into this menu — otherwise a narrow viewport turns "disabled with a
    // reason" into "disabled for no visible reason".
    //
    // PILOT-DECISION (to-astryx): the antd original wrapped the label in a
    // `Tooltip` (a disabled antd menu item swallows hover, so the tooltip had
    // to sit on the label). Astryx's DATA mode types
    // `DropdownMenuItemData.label` as `string`, and `DropdownMenuItem`'s
    // `description` slot is reachable only through the compound render path —
    // which `items` disables outright (`DropdownMenu.js`: `children` is
    // ignored whenever `items` is passed). Rewriting this menu to the
    // compound path would have to carry the divider / disabled / keyboard
    // behaviour across with it. The reason is folded into the label text
    // instead: still visible, still read out, no tooltip needed.
    label:
      action.disabled && action.disabledReason
        ? `${action.title} — ${action.disabledReason}`
        : action.title,
    icon: action.icon,
    isDisabled: action.disabled,
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
        const resolveNode = (value: React.ReactNode): React.ReactNode =>
          value ?? null;
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
  const menuItems: Array<DropdownMenuOption> = [
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
            ellipsis
            // Block + shrinkable so the Text `ellipsis` injects has a width to
            // truncate against; the clip and the tooltip live on that Text.
            style={{ display: 'block', minWidth: 0 }}
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
          // The action-button palette, published as custom properties the
          // co-located CSS reads (QA-FINDINGS Q-15).
          //
          // These used to be Astryx hue-family TEXT tiers picked by hand —
          // `--color-text-blue` (#00458C/#C7D3FF) and `--color-text-red`
          // (#89001A/#FFC6C1) — which are 4 ramp steps darker than what antd
          // drew and match no antd token. The visible consequence was that the
          // SAME semantic action had two colours: the bulk-selection buttons
          // kept their inline `token.colorInfo` and stayed #028DF2, while the
          // per-row buttons went through the remap and came out #00458C.
          //
          // The shim's measured antd values close that. `--color-error` happens
          // to already be declared as antd's `colorError`, but there is no
          // declared info token at all (`CoreTokenName` is error/success/
          // warning only), so both pairs travel the same way for symmetry.
          style={
            {
              '--bai-nac-info': token.colorInfo,
              '--bai-nac-info-bg': token.colorInfoBg,
              '--bai-nac-error': token.colorError,
              '--bai-nac-error-bg': token.colorErrorBg,
            } as React.CSSProperties
          }
        >
          {visibleActions.map((action) => {
            const buttonClassName = action.disabled
              ? 'bai-nac-action-button-disabled'
              : action.type === 'danger'
                ? 'bai-nac-action-button-danger'
                : 'bai-nac-action-button-default';

            if (action.popConfirm && !action.disabled) {
              return (
                <ConfirmPopoverButton
                  key={action.key}
                  action={action}
                  confirm={action.popConfirm}
                  className={buttonClassName}
                />
              );
            }
            // The tooltip must ride the button itself (`title` → Astryx
            // `tooltip`), which keeps a disabled control focusable via
            // `aria-disabled` so keyboard users can still reach the reason.
            return (
              <BAIButton
                key={action.key}
                type="text"
                size="small"
                icon={action.icon}
                aria-label={action.title}
                title={action.disabled ? action.disabledReason : action.title}
                disabled={action.disabled}
                className={buttonClassName}
                style={action.style}
                onClick={action.onClick}
                action={action.action}
              />
            );
          })}
          {hasMoreMenu && (
            <DropdownMenu
              items={menuItems}
              button={{
                variant: 'ghost',
                size: 'sm',
                isIconOnly: true,
                icon: <EllipsisVertical size="1em" />,
                label: t('comp:BAINameActionCell.MoreActions'),
                tooltip: t('comp:BAINameActionCell.MoreActions'),
                isDisabled: moreMenuDisabled,
              }}
              hasChevron={false}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default BAINameActionCell;
