"""PHASE 6 — put refresh + create back into the right group of the action row
that sits directly above the table, matching `main`."""
import pathlib

f = pathlib.Path('react/src/pages/AdminVFolderNodeListPage.tsx')
s = f.read_text()

anchor = """                    </>
                  )}
              </HStack>"""
replacement = """                    </>
                  )}
                {/* PHASE 6 — ORIGINAL FIDELITY: on `main` the refresh control
                    and the primary create button live HERE, at the right edge
                    of the action row directly above the table — not in the
                    card header's `extra` slot. Reverted from Phase 4. */}
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
                <Button
                  variant="primary"
                  icon={<PlusIcon />}
                  label={t('data.CreateFolder')}
                  onClick={() => {
                    toggleCreateModal();
                  }}
                />
              </HStack>"""
assert anchor in s, 'anchor not found'
s = s.replace(anchor, replacement, 1)

# Restore the original flexShrink on the left group (commented out by the
# BAIFlex dissolve because Astryx Stack takes `style` but the codemod dropped it).
s = s.replace("""                gap={3}
                align="start"
                // style={{
                //   flexShrink: 1,
                // }}
                wrap="wrap\"""",
"""                gap={3}
                align="start"
                style={{ flexShrink: 1 }}
                wrap="wrap\"""")

f.write_text(s)
print('actions row restored')
