import pathlib

f = pathlib.Path('react/src/pages/AdminVFolderNodeListPage.tsx')
s = f.read_text()

old = """                <AutoUpdateFetchKeyButton
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
              </BAIFlex>"""
new = """              </BAIFlex>"""
assert old in s
s = s.replace(old, new)
f.write_text(s)
print('body actions removed')
