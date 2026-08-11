/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 6 (cn-oss-removal / ticket 10, item 4) — `BAINameActionCell`
 rebuilt on Astryx.

 The densest antd leaf left in the page graph: BUI's 450-LOC original uses antd
 `Dropdown`, `Popconfirm`, `Tooltip`, `App.useApp().modal`, `BAIButton`,
 `BAIText`, `BAILink` and an `antd-style` `createStyles` block with five rules.
 The hard part is NOT the antd surface — it is the width-measuring overflow
 algorithm, which is pure DOM and ports unchanged.

 | BUI (antd)                                | here (Astryx)                       |
 |-------------------------------------------|-------------------------------------|
 | `Dropdown menu={{items}}` + `MoreOutlined` | `DropdownMenu` + `DropdownMenuItem` |
 | `Popconfirm`                               | `Popover` + a hand-built confirm    |
 | `Tooltip title=…` around a button          | `IconButton.tooltip`                |
 | `BAIButton type="text" size="small"`       | `IconButton variant="ghost" size="sm"` |
 | `BAIText ellipsis={{tooltip:true}}`        | `Text maxLines={1} hasTruncateTooltip` |
 | `BAILink to=…`                             | `Link href=…` + router `navigate`   |
 | `createStyles` hover/danger colour rules   | one `<style>`-free CSS-var ruleset  |

 PORTED UNCHANGED (the actual substance):
 - the `ResizeObserver` + `calculateVisibleActions` width budget, including
   `minTitleReserve`, the more-button reserve, and the `showInMenu: 'always'`
   split;
 - the `prevAutoActionCount` render-phase reset;
 - the overflow menu's divider between overflowed and menu-only actions.

 PILOT-DECISIONs:
 1. **`popConfirm` is re-typed.** BUI's action carries a full antd
    `PopconfirmProps`. Astryx has no popconfirm, so the action now carries a
    small `confirm: {title, description?, confirmLabel?, cancelLabel?,
    onConfirm}` object and the popover is built from `Popover` + two `Button`s.
    This is a **native** rebuild, not a frontier translation, because the only
    consumer in the pilot graph is `VFolderNodes`'s own `VFolderNameCell`.
    (BUI's original stays untouched for its other consumers.)
 2. **The overflow menu drops the confirm step.** antd's implementation
    re-created the popconfirm as a `Modal.confirm` when an action overflowed.
    Astryx `DropdownMenuItem` cannot host a popover child, so an overflowed
    confirm action routes through the app-shim's `modal.confirm`
    (Astryx `AlertDialog`) — the same escalation BUI performed, on the shim
    rather than on antd.
 3. **Hover-reveal stays CSS, not state.** BUI's `:hover .class` /
    `:has(:focus-visible)` rules came from `createStyles`. Astryx has no
    styling API without the StyleX compiler (ticket 03), so they moved to
    `react/src/index.css` verbatim, keyed on the same class names. This is the
    P6 pattern in reverse: the rules are still CSS, they just no longer target
    `.ant-*`.
 4. **Danger colouring uses `IconButton variant="ghost"` + a CSS-var class**,
    not a `color` prop — Astryx `IconButton` has no destructive ghost variant,
    only `variant="destructive"` which is a filled treatment far heavier than
    the antd original's tinted-on-hover text button.
*/
import { App } from '../../app-shim';
import './astryxBui.css';
import { Button } from '@astryxdesign/core/Button';
import {
  DropdownMenu,
  DropdownMenuItem,
} from '@astryxdesign/core/DropdownMenu';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Link } from '@astryxdesign/core/Link';
import { Popover } from '@astryxdesign/core/Popover';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { EllipsisIcon } from 'lucide-react';
import React, {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition,
} from 'react';

export interface BAINameActionCellAstryxConfirm {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
}

export interface BAINameActionCellAstryxAction {
  key: string;
  /** Doubles as the accessible name and the overflow-menu label (P8). */
  title: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  /** Async handler with automatic loading state. */
  action?: () => Promise<void>;
  type?: 'default' | 'danger';
  disabled?: boolean;
  disabledReason?: string;
  showInMenu?: 'auto' | 'always';
  /** Astryx-shaped replacement for antd `PopconfirmProps` (decision 1). */
  confirm?: BAINameActionCellAstryxConfirm;
}

export interface BAINameActionCellAstryxProps {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  /**
   * Href for the title. Astryx `Link` is anchor-first (Phase-2 finding), so an
   * in-app route is passed as a real `href` — middle-click and "copy link"
   * keep working — and `onTitleClick` intercepts the left click for the
   * router. BUI used react-router's `Link` with a `to` OBJECT; the object is
   * flattened at the call site.
   */
  to?: string;
  onTitleClick?: (e: React.MouseEvent) => void;
  actions?: Array<BAINameActionCellAstryxAction>;
  showActions?: 'hover' | 'always';
  minVisibleActions?: number;
  moreMenuDisabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

// Ported unchanged from BUI — the width budget these three constants describe
// is the whole reason this component is not a two-line flexbox.
const ACTION_BUTTON_WIDTH = 24;
const MORE_BUTTON_WIDTH = 24;
const ACTIONS_GAP = 2;

const ConfirmPopoverButton: React.FC<{
  action: BAINameActionCellAstryxAction;
  confirm: BAINameActionCellAstryxConfirm;
}> = ({ action, confirm }) => {
  'use memo';
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      label={confirm.title}
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
              label={confirm.cancelLabel ?? 'Cancel'}
              onClick={() => setIsOpen(false)}
            />
            <Button
              size="sm"
              variant="primary"
              label={confirm.confirmLabel ?? 'OK'}
              onClick={() => {
                setIsOpen(false);
                confirm.onConfirm?.();
              }}
            />
          </HStack>
        </VStack>
      }
    >
      <IconButton
        label={action.title}
        tooltip={action.title}
        icon={action.icon}
        size="sm"
        variant="ghost"
        className={
          action.type === 'danger'
            ? 'bai-name-action-cell-danger'
            : 'bai-name-action-cell-default'
        }
      />
    </Popover>
  );
};

const BAINameActionCellAstryx: React.FC<BAINameActionCellAstryxProps> = ({
  icon,
  title,
  to,
  onTitleClick,
  actions,
  showActions = 'hover',
  minVisibleActions = 0,
  moreMenuDisabled,
  style,
  className,
}) => {
  'use memo';
  const { modal } = App.useApp();
  const [, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleAreaRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState<number>(
    actions?.length ?? 0,
  );

  const autoActions = actions?.filter((a) => a.showInMenu !== 'always') ?? [];
  const menuOnlyActions =
    actions?.filter((a) => a.showInMenu === 'always') ?? [];
  const autoActionCount = autoActions.length;

  // The `undefined` sentinel makes the reset also run on the first render.
  const [prevAutoActionCount, setPrevAutoActionCount] = useState<
    number | undefined
  >(undefined);
  if (autoActionCount !== prevAutoActionCount) {
    setPrevAutoActionCount(autoActionCount);
    setVisibleCount(autoActionCount);
  }

  // BUI reached for its own `useEventNotStable`; the repo convention
  // (`.claude/rules/use-effect-event.md`) is `useEffectEvent`, which keeps the
  // ResizeObserver effect's dep array down to the one value it really
  // synchronises on.
  const calculateVisibleActions = useEffectEvent((containerWidth: number) => {
    const titleIcon = titleAreaRef.current?.querySelector(
      '.bai-name-action-cell-title-icon',
    );
    const titleIconWidth = titleIcon ? titleIcon.clientWidth : 0;
    // BUI reserved `titleIconWidth + token.marginXXS + 40`; `marginXXS` is 4.
    const minTitleReserve = titleIconWidth + 4 + 40;
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
      totalButtonsWidth(ACTION_BUTTON_WIDTH, autoActionCount) <= availableWidth
    ) {
      setVisibleCount(autoActionCount);
      return;
    }

    const widthForMoreButton =
      menuOnlyActions.length > 0 ? 0 : MORE_BUTTON_WIDTH + ACTIONS_GAP;
    const remainingWidth = availableWidth - widthForMoreButton;

    let count = 0;
    for (let i = 0; i < autoActionCount; i++) {
      if (totalButtonsWidth(ACTION_BUTTON_WIDTH, i + 1) <= remainingWidth) {
        count = i + 1;
      } else {
        break;
      }
    }
    setVisibleCount(Math.max(count, minVisibleActions));
  });

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
  }, [autoActionCount]);

  const hasOverflow = visibleCount < autoActionCount;
  const visibleActions = autoActions.slice(0, visibleCount);
  const overflowActions = autoActions.slice(visibleCount);
  const hasMoreMenu = hasOverflow || menuOnlyActions.length > 0;

  const runMenuAction = (action: BAINameActionCellAstryxAction) => {
    if (action.onClick || action.action) {
      action.onClick?.();
      if (action.action) {
        startTransition(async () => {
          await action.action?.();
        });
      }
      return;
    }
    if (action.confirm) {
      // Decision 2: an overflowed confirm escalates to the shim's AlertDialog.
      modal.confirm({
        title: action.confirm.title,
        content: action.confirm.description,
        okText: action.confirm.confirmLabel,
        cancelText: action.confirm.cancelLabel,
        okButtonProps: { danger: action.type === 'danger' },
        onOk: () => action.confirm?.onConfirm?.(),
      });
    }
  };

  const renderTitle = () => {
    // FEEDBACK FIX (pilot 7): a link-shaped cell must READ as a link.
    //
    // The anchor was already an Astryx `Link` and already carried the accent
    // colour + hover underline — but the `Text` nested inside it re-declared
    // `color` (Astryx `Text` defaults to `primary`), so the visible name
    // painted in body-text colour and only the invisible anchor box was
    // accent. Astryx's own answer is `color="inherit"` / `type="inherit"`,
    // documented on `Text` for exactly this case ("an inline link inside an
    // existing Text"). No call-site CSS and no theme override needed: Astryx
    // `Link`'s DEFAULT styling is already right, it was being overridden from
    // the inside.
    //
    // `hasTruncateTooltip` is why the `Text` stays rather than folding into
    // `Link maxLines={1}`: `Link` forwards `maxLines` to its internal `Text`
    // but does NOT forward `hasTruncateTooltip`, and its own `tooltip` prop is
    // unconditional — it would pop a tooltip on every folder name, truncated
    // or not. Keeping the child (colour-neutral) preserves the
    // only-when-ellipsized tooltip the original had.
    const isLinked = !!(to || onTitleClick);
    const text = (
      <Text
        maxLines={1}
        hasTruncateTooltip
        color={isLinked ? 'inherit' : undefined}
        type={isLinked ? 'inherit' : undefined}
      >
        {title}
      </Text>
    );
    if (isLinked) {
      return (
        <Link
          // QA3: same `bai-link-hover` contract as BUI's `BAINameActionCell`,
          // so a folder name hovers identically to a session name. Astryx's own
          // hover underline is gated behind `@media (hover: hover)` AND stops
          // at the `display: block` `Text` below, so relying on it left this
          // cell as the one name link with no hover feedback.
          className="bai-link-hover"
          href={to ?? '#'}
          style={{ minWidth: 0, display: 'block' }}
          onClick={
            onTitleClick
              ? (e: React.MouseEvent) => {
                  e.preventDefault();
                  onTitleClick(e);
                }
              : undefined
          }
        >
          {text}
        </Link>
      );
    }
    return text;
  };

  return (
    <div
      ref={containerRef}
      className={[
        'bai-name-action-cell',
        showActions === 'hover' ? 'bai-name-action-cell-hover' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <div ref={titleAreaRef} className="bai-name-action-cell-title-area">
        {icon ? (
          <span className="bai-name-action-cell-title-icon">{icon}</span>
        ) : null}
        {renderTitle()}
      </div>
      {autoActionCount > 0 || menuOnlyActions.length > 0 ? (
        <div
          className={
            showActions === 'hover'
              ? 'bai-name-action-cell-actions bai-name-action-cell-actions-hidden'
              : 'bai-name-action-cell-actions'
          }
        >
          {visibleActions.map((action) => {
            const buttonClass = action.disabled
              ? 'bai-name-action-cell-disabled'
              : action.type === 'danger'
                ? 'bai-name-action-cell-danger'
                : 'bai-name-action-cell-default';
            if (action.confirm && !action.disabled) {
              return (
                <ConfirmPopoverButton
                  key={action.key}
                  action={action}
                  confirm={action.confirm}
                />
              );
            }
            return (
              <IconButton
                key={action.key}
                // P8: Astryx forces a real accessible name. The antd original
                // had none — only a wrapping Tooltip.
                label={action.title}
                // P5/P8 note: `Button` and `PowerSearch` both expose
                // `disabledMessage` for exactly this case, but `IconButton`
                // does NOT — so a disabled action's reason has to go back
                // through `tooltip`, which is precisely the pattern Astryx
                // warns against elsewhere (a disabled control swallows hover).
                // The reason therefore reaches the mouse but not reliably the
                // keyboard. Recorded rather than papered over.
                tooltip={
                  action.disabled
                    ? (action.disabledReason ?? action.title)
                    : action.title
                }
                icon={action.icon}
                size="sm"
                variant="ghost"
                isDisabled={action.disabled}
                className={buttonClass}
                onClick={action.onClick}
                clickAction={action.action}
              />
            );
          })}
          {hasMoreMenu ? (
            <DropdownMenu
              placement="below"
              alignment="end"
              button={{
                label: 'More actions',
                icon: <EllipsisIcon />,
                isIconOnly: true,
                size: 'sm',
                variant: 'ghost',
                isDisabled: moreMenuDisabled,
              }}
            >
              {overflowActions.map((action) => (
                <DropdownMenuItem
                  key={action.key}
                  label={action.title}
                  icon={action.icon}
                  isDisabled={action.disabled}
                  onClick={() => runMenuAction(action)}
                />
              ))}
              {menuOnlyActions.map((action) => (
                <DropdownMenuItem
                  key={action.key}
                  label={action.title}
                  icon={action.icon}
                  isDisabled={action.disabled}
                  onClick={() => runMenuAction(action)}
                />
              ))}
            </DropdownMenu>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default BAINameActionCellAstryx;
