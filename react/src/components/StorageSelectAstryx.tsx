/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 6 (cn-oss-removal / ticket 10, item 3) — `StorageSelect` rebuilt on
 Astryx `ComplexSelector`, using the scroll-driven load recipe proven in
 ticket 12 (`AstryxUserSelectComplex`).

 WHY `ComplexSelector` AND NOT `Selector`
 ----------------------------------------
 Two independent reasons, and the second one is the one that generalises:

 1. **Rich option rows.** Each host row carries a usage badge plus a
    search-term highlight. `Selector`'s `options` are `{label: string}`; there
    is no per-row node slot that also keeps the search highlight in sync.
 2. **`Selector` mounts every option into the DOM — even while closed.**
    Ticket 12 measured 500 options => 2,513 resident DOM nodes and a 156–330 ms
    mount, versus antd's constant 8 nodes (`rc-virtual-list`). A storage host
    list is small today, but the mitigation is the same shape as the
    infinite-scroll one, so it is built the same way.

 WHAT THIS PORTS FROM THE TICKET-12 SPIKE, AND WHAT IT DOES NOT
 --------------------------------------------------------------
 The **scroll plumbing is byte-for-byte the spike's** (and therefore
 `BAISelect.handlePopupScroll`'s) predicate:

     scrollHeight - scrollTop - clientHeight <= 30   -> load the next page

 What differs — and this is the honest finding for the report — is what sits
 behind that predicate. `BAIUserSelect` pages a Relay connection; `StorageSelect`
 gets **all** hosts from one REST call (`vfolder.list_hosts()` via
 `useSuspenseTanQuery`). So here the "page" is a slice of an array already in
 memory. The mechanism is identical, the purpose is not:
 **on a REST/static source the ComplexSelector recipe buys windowing, not
 pagination** — it is the replacement for the virtualization Astryx does not
 have, rather than for `loadNext`.

 `labelInValue` adapter: not needed. `StorageSelect`'s value contract is a bare
 host string (`value?: string`, `onChange(host, volumeInfo)`), the one BUI shape
 that is NOT label-in-value. Ticket 12's `toAstryxItem` / `toLabelInValue` pair
 therefore has nothing to convert; the equivalent work here is
 `hostToItem`, which resolves a host string to its display row. The ticket-12
 warning still applies in principle — a selected host that is not in the
 currently rendered window must still render in the trigger — and it is handled
 by taking the trigger label from the VALUE, never from the rendered list.

 FRONTIER: `StorageSelect` has FOUR consumers outside the pilot graph
 (`FolderCreateModal`, `QuotaPerStorageVolumePanelCard`, `ImportRepoForm`, and
 `FolderCreateModalV2`). The antd original is therefore left in place untouched
 and this component is swapped in **only** inside `FolderCreateModalV2`. Its
 external props keep the antd/BUI shape (`value` / `onChange(v, info)` /
 `showUsageStatus` / `autoSelectType`), because it is cloned by an antd
 `Form.Item` which injects exactly those.

 PILOT-DECISIONs:
 - **Colour-only usage dot -> labelled badge.** BUI renders `StorageUsageBadge`,
   a bare coloured dot (antd `Badge` with `color` and no text) whose meaning is
   only in a tooltip. Astryx `Badge` requires a `label` (P8), so the row now
   shows the status word itself ("Adequate" / "Caution" / "Insufficient"). That
   is a **one-line accessibility improvement** — the information stops being
   carried by hue alone — handled the same way P8 was handled for icon-only
   buttons.
 - **No keyboard navigation.** As ticket 12 recorded, `ComplexSelector` hands
   back the popup body, so arrow-key roving, `aria-activedescendant`, and
   type-ahead are ours to build and are NOT built here. The listbox is
   mouse-driven plus native tab order. Annotated rather than faked.
 - **`TextHighlighter` is not reused** — it calls antd's `theme.useToken()`.
   The highlight is re-expressed with a theme CSS var so it follows the Astryx
   brand/admin theme and both colour schemes.
*/
import { useSuspendedBackendaiClient } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import useControllableState_deprecated from '../hooks/useControllableState';
import type { VolumeInfo } from './StorageSelect';
import { Badge } from '@astryxdesign/core/Badge';
import type { BadgeVariant } from '@astryxdesign/core/Badge';
import { ComplexSelector } from '@astryxdesign/core/ComplexSelector';
import { Item } from '@astryxdesign/core/Item';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import * as _ from 'lodash-es';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface VHostInfo {
  default: string;
  allowed: Array<string>;
  volume_info?: {
    [key: string]: VolumeInfo;
  };
}

/** One window's worth of rows, same role `pageSize` plays in the spike. */
const WINDOW_SIZE = 20;

export interface StorageSelectAstryxProps {
  /** Injected by antd `Form.Item` (frontier contract — see the header note). */
  value?: string;
  /** Injected by antd `Form.Item`. */
  onChange?: (value?: string, volumeInfo?: VolumeInfo) => void;
  defaultValue?: string;
  autoSelectType?: 'usage' | 'default';
  showUsageStatus?: boolean;
  /** Accessible name. Visually hidden — `BAIFormItem` renders the visible one. */
  label: string;
  placeholder?: string;
  disabled?: boolean;
  'data-testid'?: string;
}

const usageVariant = (percent: number | undefined): BadgeVariant => {
  if (percent === undefined) return 'neutral';
  if (percent < 70) return 'success';
  if (percent < 90) return 'warning';
  return 'error';
};

/**
 * Search-term highlight without antd's `theme.useToken()`. Uses the Astryx
 * warning surface token so it follows the active theme and colour scheme.
 */
const Highlighted: React.FC<{ text: string; keyword?: string }> = ({
  text,
  keyword,
}) => {
  'use memo';
  if (!keyword) return <>{text}</>;
  const parts = text.split(new RegExp(`(${_.escapeRegExp(keyword)})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <span
            key={i}
            className="text-high-lighter"
            style={{ backgroundColor: 'var(--color-background-warning)' }}
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
};

const StorageSelectAstryx: React.FC<StorageSelectAstryxProps> = ({
  value,
  onChange,
  defaultValue,
  autoSelectType,
  showUsageStatus,
  label,
  placeholder,
  disabled,
  'data-testid': dataTestId,
}) => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();

  const { data: vhostInfo, isLoading: isLoadingVhostInfo } =
    useSuspenseTanQuery<VHostInfo | null>({
      queryKey: ['vhostInfo'],
      queryFn: () => {
        return baiClient.vfolder.list_hosts();
      },
    });

  const [controllableState, setControllableState] =
    useControllableState_deprecated({
      value,
      onChange,
      defaultValue,
    });

  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(WINDOW_SIZE);
  const atBottom = useRef(false);

  useEffect(() => {
    if (!autoSelectType || !vhostInfo) return;
    let nextHost = vhostInfo?.default ?? vhostInfo?.allowed[0] ?? '';
    if (autoSelectType === 'usage') {
      const lowestUsageHost = _.minBy(
        _.map(vhostInfo?.allowed, (host) => ({
          host,
          volume_info: vhostInfo?.volume_info?.[host],
        })),
        'volume_info.usage.percentage',
      )?.host;
      nextHost = lowestUsageHost || nextHost;
    }
    setControllableState(nextHost, {
      id: nextHost,
      ...(vhostInfo?.volume_info?.[nextHost] || {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vhostInfo]);

  const usageLabelOf = (percent: number | undefined) =>
    percent === undefined
      ? t('data.usage.Unknown')
      : percent < 70
        ? t('data.usage.Adequate')
        : percent < 90
          ? t('data.usage.Caution')
          : t('data.usage.Insufficient');

  const allHosts = vhostInfo?.allowed ?? [];
  const matchedHosts = search
    ? _.filter(allHosts, (host) =>
        host.toLowerCase().includes(search.toLowerCase()),
      )
    : allHosts;
  const windowedHosts = matchedHosts.slice(0, visibleCount);
  const hasMore = windowedHosts.length < matchedHosts.length;

  /**
   * The ticket-12 / `BAISelect.handlePopupScroll` predicate, unchanged. The
   * only difference is what it drives: a window grow rather than `loadNext`.
   */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isAtBottomNow =
      el.scrollHeight - el.scrollTop - el.clientHeight <= 30;
    if (isAtBottomNow !== atBottom.current) {
      atBottom.current = isAtBottomNow;
      if (isAtBottomNow) setVisibleCount((count) => count + WINDOW_SIZE);
    }
  };

  const select = (host: string, close: () => void) => {
    setControllableState(host, {
      id: host,
      ...(vhostInfo?.volume_info?.[host] || {}),
    });
    close();
  };

  // Read from the VALUE, never from the rendered window — ticket 12 §2b: a
  // selection that has scrolled out of the current page must still display.
  const selectedUsage =
    vhostInfo?.volume_info?.[controllableState ?? '']?.usage?.percentage;
  const triggerLabel = controllableState ? (
    <HStack gap={2} align="center">
      {showUsageStatus && selectedUsage !== undefined ? (
        <Badge
          variant={usageVariant(selectedUsage)}
          label={usageLabelOf(selectedUsage)}
        />
      ) : null}
      <Text>{controllableState}</Text>
    </HStack>
  ) : undefined;

  return (
    <ComplexSelector<string | undefined>
      label={label}
      isLabelHidden
      value={controllableState}
      isDisabled={disabled}
      isLoading={isLoadingVhostInfo}
      triggerLabel={triggerLabel}
      placeholder={placeholder ?? t('data.SelectStorageHost')}
      width="100%"
      data-testid={dataTestId}
    >
      {(_value, _onChange, close) => (
        <VStack gap={1} padding={2} width={320}>
          <TextInput
            label={t('data.SelectStorageHost')}
            isLabelHidden
            value={search}
            onChange={(next) => {
              setSearch(next);
              setVisibleCount(WINDOW_SIZE);
            }}
            placeholder={t('data.SelectStorageHost')}
            hasClear
            size="sm"
          />
          <div
            onScroll={handleScroll}
            style={{ maxHeight: 260, overflowY: 'auto' }}
            role="listbox"
            aria-label={label}
            data-testid="storage-host-listbox"
          >
            {windowedHosts.map((host) => {
              const percent = vhostInfo?.volume_info?.[host]?.usage?.percentage;
              const hasUsage = !!vhostInfo?.volume_info?.[host]?.usage;
              return (
                <Item
                  key={host}
                  density="compact"
                  isSelected={host === controllableState}
                  label={<Highlighted text={host} keyword={search} />}
                  startContent={
                    showUsageStatus && hasUsage ? (
                      <Badge
                        variant={usageVariant(percent)}
                        // P8: the antd original conveyed this with hue only,
                        // explained by a tooltip. Astryx requires a label, so
                        // the status word is now on screen.
                        label={usageLabelOf(percent)}
                      />
                    ) : undefined
                  }
                  onClick={() => select(host, close)}
                />
              );
            })}
            {matchedHosts.length === 0 ? (
              <Text color="secondary">{t('data.usage.Unknown')}</Text>
            ) : null}
          </div>
          {hasMore ? (
            <Text color="secondary" type="supporting">
              {`${windowedHosts.length} / ${matchedHosts.length}`}
            </Text>
          ) : null}
        </VStack>
      )}
    </ComplexSelector>
  );
};

export default StorageSelectAstryx;
