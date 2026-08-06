"""PHASE 6 — restore ORIGINAL layout fidelity.

The Phase-4 move of refresh + create into the card `extra` slot followed the
generic `use-bai-card.md` convention but diverged from what THIS page actually
does on `main`. Original fidelity wins during a migration.
"""
import pathlib
import re

f = pathlib.Path('react/src/pages/AdminVFolderNodeListPage.tsx')
s = f.read_text()

# 1. Card header: title only. Drop `extra` and the tab props.
start = s.index('        <BAICard\n          title=')
end = s.index('        >\n', start) + len('        >\n')
header = s[start:end]

# Recover the tab-change handler + tabs array so they can be re-mounted in body.
s = s[:start] + '''        <BAICard
          // PHASE 6 — ORIGINAL FIDELITY. The card header carries ONLY the
          // title on `main`: no `extra`, no `tabList`. The Phase-4 move of the
          // refresh + create buttons into `extra` followed the generic
          // `use-bai-card.md` convention but diverged from what this page
          // actually does. Per-page fidelity wins during a migration; the
          // convention is for NEW cards.
          title={t('data.Folders')}
        >
          {/* Tabs are the first child of the card BODY on `main` (a
              `BAITabs` sibling of the content), not the card's header tab
              slot. Reverted to match. */}
          <BAITabs
            activeKey={queryParams.statusCategory}
            onChange={(key) => {
              const storedQuery = queryMapRef.current[key] || {
                mode: 'all',
              };
              // Reset the whole group first: nuqs partial updates merge, so
              // without this the previous tab's filter/order/mode leak into a
              // tab that has no cached state (legacy 'replace' cleared them).
              setQuery(null);
              setQuery({
                ...storedQuery.queryParams,
                statusCategory: key as 'active' | 'deleted',
              });
              setTablePaginationOption(
                storedQuery.tablePaginationOption || { current: 1 },
              );
              setSelectedFolderList([]);
            }}
            items={_.map(
              {
                active: t('data.Active'),
                deleted: t('data.folders.TrashBin'),
              },
              (label, key) => ({
                key,
                // Astryx `Tab` takes a STRING label plus a native `endContent`
                // slot, so the original's BAIFlex-wrapped JSX label is split in
                // two. This also restores a correct `aria-label` on the tab.
                label,
                endContent:
                  // display badge only if count is greater than 0
                  // @ts-ignore
                  (folderCounts[key]?.count || 0) > 0 ? (
                    // PILOT-DECISION: antd's Badge took an arbitrary `color`
                    // (brand orange when selected, disabled grey otherwise)
                    // plus explicit padding/fontSize. Astryx's Badge exposes
                    // only a closed `variant` set.
                    <Badge
                      // @ts-ignore
                      label={folderCounts[key].count}
                      variant={
                        queryParams.statusCategory === key ? 'info' : 'neutral'
                      }
                    />
                  ) : undefined,
              }),
            )}
          />
''' + s[end:]

f.write_text(s)
print('card header + tabs restored')
