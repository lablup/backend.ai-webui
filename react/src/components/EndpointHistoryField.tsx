/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { IconButton } from '@lablup/ui-common/IconButton';
import { List, ListItem } from '@lablup/ui-common/List';
import { usePopover } from '@lablup/ui-common/Popover';
import { focusVars, spacingVars } from '@lablup/ui-common/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { Trash2 } from 'lucide-react';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

const styles = stylex.create({
  endpointPopover: {
    width: 'anchor-size(width)',
  },
  // Scroll inside the popover surface, so the scrollbar stays within its rounded edge.
  endpointList: {
    maxHeight: 140,
    overflowY: 'auto',
  },
  // ListItem drops the last divider with a shorthand that its longhand default
  // outranks in StyleX, so the line under the last row survives; drop it here.
  endpointLastRow: {
    borderBlockEndWidth: 0,
  },
  // Item rings the row on any focused descendant; ring it only for the row's own
  // select button (one outline per tab stop), inset so the scrolling list can't clip it.
  endpointRow: {
    outlineWidth: {
      default: '0',
      ':has(> :first-child:focus-visible)': focusVars['--focus-outline-width'],
    },
    outlineStyle: {
      default: 'none',
      ':has(> :first-child:focus-visible)': focusVars['--focus-outline-style'],
    },
    outlineColor: {
      default: null,
      ':has(> :first-child:focus-visible)': focusVars['--focus-outline-color'],
    },
    outlineOffset: {
      default: '0',
      ':has(> :first-child:focus-visible)': `calc(-1 * ${focusVars['--focus-outline-width']})`,
    },
  },
});

/** One row of the endpoint history list. */
export interface EndpointHistoryEntry {
  endpoint: string;
  /** Pinned from `VITE_DEFAULT_API_ENDPOINT`; tagged, but deletable like the rest. */
  isFromEnv?: boolean;
}

export interface EndpointHistoryFieldProps {
  history: EndpointHistoryEntry[];
  onSelect: (endpoint: string) => void;
  onDelete: (endpoint: string) => void;
  /** The endpoint input; the saved endpoints float under it as its autofill. */
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/** An endpoint input with the saved endpoints as a pick-or-delete list. */
const EndpointHistoryField: React.FC<EndpointHistoryFieldProps> = ({
  history,
  onSelect,
  onDelete,
  children,
  style,
}) => {
  'use memo';
  const { t } = useTranslation();
  // Floating so the form never reflows. Focus decides when it closes: a text
  // input cannot be the layer's invoker, so light dismiss would shut it on
  // every click into the field.
  const popover = usePopover({
    hasLightDismiss: false,
    hasCloseButton: false,
    hasAutoFocus: false,
    role: 'none',
  });
  const anchorRef = useRef<HTMLDivElement | null>(null);
  // Hiding returns focus to the field; that focus must not reopen the list.
  const isReturningFocusRef = useRef(false);
  const focusInput = () => anchorRef.current?.querySelector('input')?.focus();

  const show = () => {
    if (isReturningFocusRef.current) {
      isReturningFocusRef.current = false;
      return;
    }
    if (history.length > 0 && !popover.isOpen) popover.show();
  };
  const select = (endpoint: string) => {
    onSelect(endpoint);
    isReturningFocusRef.current = true;
    popover.hide();
    requestAnimationFrame(() => {
      isReturningFocusRef.current = false;
    });
  };

  return (
    <div
      ref={(el) => {
        anchorRef.current = el;
        popover.triggerRef(el);
      }}
      onFocus={show}
      onClick={show}
      onBlur={(e) => {
        const next = e.relatedTarget as Node | null;
        if (
          !e.currentTarget.contains(next) &&
          !popover.contentRef.current?.contains(next)
        ) {
          popover.hide();
        }
      }}
      onKeyDown={(e) => {
        if (!popover.isOpen) {
          if (e.key === 'ArrowDown') show();
          return;
        }
        const list = popover.contentRef.current;
        // The layer is its own focus scope, so Tab from the field skips it;
        // ArrowDown enters it as in a combobox.
        if (e.key === 'ArrowDown' && !list?.contains(e.target as Node)) {
          e.preventDefault();
          list?.querySelector('button')?.focus();
        } else if (e.key === 'Escape') {
          e.stopPropagation();
          popover.hide();
          focusInput();
        }
      }}
      style={{ flex: 1, minWidth: 0, ...style }}
    >
      {children}
      {history.length > 0 &&
        popover.render(
          <List
            density="compact"
            hasDividers
            aria-label={t('login.EndpointHistory')}
            xstyle={styles.endpointList}
          >
            {history.map(({ endpoint, isFromEnv }, i) => (
              <ListItem
                key={endpoint}
                label={isFromEnv ? `${endpoint} (env)` : endpoint}
                xstyle={[
                  styles.endpointRow,
                  i === history.length - 1 && styles.endpointLastRow,
                ]}
                onClick={(e) => {
                  e.stopPropagation();
                  select(endpoint);
                }}
                endContent={
                  <IconButton
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 size="1em" />}
                    label={`${t('button.Delete')}: ${endpoint}`}
                    onClick={(e) => {
                      // The row is the select target; deleting must not also select it.
                      e.stopPropagation();
                      if (history.length === 1) popover.hide();
                      onDelete(endpoint);
                      // The pressed row unmounts with focus in it.
                      focusInput();
                    }}
                  />
                }
              />
            ))}
          </List>,
          {
            placement: 'below',
            alignment: 'start',
            offset: spacingVars['--spacing-1'],
            xstyle: styles.endpointPopover,
          },
        )}
    </div>
  );
};

export default EndpointHistoryField;
