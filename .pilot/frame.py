import pathlib

f = pathlib.Path('react/src/pages/AdminVFolderNodeListPage.tsx')
s = f.read_text()

start = s.index('        <BAICard\n          variant="borderless"')
end = s.index("          <BAIFlex direction=\"column\" align=\"stretch\" gap={'sm'}>")
new_head = '''        <BAICard
          variant="borderless"
          title={t('data.Folders')}
          // PHASE 4 — the card owns the tab strip again (antd `tabList`), so
          // the tabs render on the header's bottom edge and the body starts
          // under the tab underline, exactly as `.claude/rules/use-bai-card.md`
          // describes for a tabbed card.
          activeTabKey={queryParams.statusCategory}
          onTabChange={(key) => {
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
          tabList={_.map(
            {
              active: t('data.Active'),
              deleted: t('data.folders.TrashBin'),
            },
            (label, key) => ({
              key,
              // Astryx `Tab` takes a STRING label plus a native `endContent`
              // slot, so the previous BAIFlex-wrapped JSX label is split in
              // two. This also restores a correct `aria-label` on the tab.
              label,
              endContent:
                // display badge only if count is greater than 0
                // @ts-ignore
                (folderCounts[key]?.count || 0) > 0 ? (
                  // PILOT-DECISION: antd's Badge took an arbitrary `color`
                  // (brand orange when selected, disabled grey otherwise) plus
                  // explicit padding/fontSize. Astryx's Badge exposes only a
                  // closed `variant` set. `info` is the closest read of "this
                  // tab is active"; `neutral` for the inactive one.
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
          // Card-scoped actions live in `extra`, per the project rule: the
          // refresh control and the primary create button, primary rightmost.
          extra={
            <BAIFlex gap={'xs'} align="center">
              <AutoUpdateFetchKeyButton
                settingId="admin-vfolder-list"
                loading={
                  deferredQueryVariables !== queryVariables ||
                  deferredFetchKey !== fetchKey
                }
                value={fetchKey}
                onChange={(newFetchKey) => {
                  updateFetchKey(newFetchKey);
                }}
              />
              <BAIButton
                type="primary"
                icon={<PlusIcon />}
                onClick={() => {
                  toggleCreateModal();
                }}
              >
                {t('data.CreateFolder')}
              </BAIButton>
            </BAIFlex>
          }
        >
'''
s = s[:start] + new_head + s[end:]
f.write_text(s)
print('head replaced')
