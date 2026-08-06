import pathlib
import re

# 1. Page: re-add the BAITabs import.
p = pathlib.Path('react/src/pages/AdminVFolderNodeListPage.tsx')
s = p.read_text()
if 'BAITabs' in s and "import BAITabs" not in s:
    s = s.replace("import BAIRadioGroup from '../components/BAIRadioGroup';",
                  "import BAIRadioGroup from '../components/BAIRadioGroup';\n"
                  "import BAITabs from '../components/BAITabs';")
s = s.replace("            onChange={(key) => {\n              const storedQuery",
              "            onChange={(key: string) => {\n              const storedQuery")
s = s.replace("              loading={deferredQueryVariables !== queryVariables}",
              "              isLoading={deferredQueryVariables !== queryVariables}")
p.write_text(s)
print('page fixed')

# 2. Sibling page: loading -> isLoading.
p = pathlib.Path('react/src/pages/VFolderNodeListPage.tsx')
s = p.read_text()
s = s.replace("            loading={deferredQueryVariables !== queryVariables}",
              "            isLoading={deferredQueryVariables !== queryVariables}")
p.write_text(s)
print('sibling page fixed')

# 3. VFolderNodes: table props + the over-renamed modal.confirm key.
p = pathlib.Path('react/src/components/VFolderNodes.tsx')
s = p.read_text()
s = s.replace("        rowKey={(record) => record.id}", "        idKey={(record) => record.id}")
s = s.replace("        dataSource={filteredVFolders}", "        data={filteredVFolders}")
s = s.replace("        showSorterTooltip={false}\n", "")
s = s.replace("        scroll={{ x: 'max-content' }}\n", "")
s = s.replace("        resizable\n", "        isColumnResizable\n")
s = s.replace('        size="small"\n', '        density="compact"\n')
# modal.confirm takes `title`, not `header` — revert that one over-eager rename.
s = s.replace("                      header: t('data.folders.MoveToTrash'),",
              "                      title: t('data.folders.MoveToTrash'),")
p.write_text(s)
print('vfolder nodes fixed')

# 4. DeleteVFolderModal leftovers.
p = pathlib.Path('react/src/components/DeleteVFolderModal.tsx')
s = p.read_text()
s = re.sub(r'\n\s*onCancel=\{\(\) => onRequestClose\(false\)\}', '', s)
p.write_text(s)
print('delete modal fixed')
