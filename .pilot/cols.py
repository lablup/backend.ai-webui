"""PHASE 5 — rewrite VFolderNodes' column definitions to the Astryx-native
`BAITableAstryxColumn` shape.

  title      -> header
  sorter     -> sortable
  required   -> isRequired
  defaultHidden -> isHiddenByDefault
  render(value, record, index) -> renderCell(item)
"""
import pathlib
import re

f = pathlib.Path('react/src/components/VFolderNodes.tsx')
s = f.read_text()

# Scope the rewrite to the columns array only.
start = s.index('        columns={[')
end = s.index('        rowSelection={', start)
block = s[start:end]

block = re.sub(r'^(\s*)title: ', r'\1header: ', block, flags=re.M)
block = re.sub(r'^(\s*)sorter: ', r'\1sortable: ', block, flags=re.M)
block = re.sub(r'^(\s*)required: true,', r'\1isRequired: true,', block, flags=re.M)
block = re.sub(r'^(\s*)defaultHidden: true,', r'\1isHiddenByDefault: true,', block, flags=re.M)

# render: (value, record) => ...   ->   renderCell: (record) => ... reading the
# value from the record via the column's dataIndex. Handled per-signature below.
block = block.replace('render: (_name, vfolder) => {', 'renderCell: (vfolder) => {')
block = block.replace('render: (status: string) => {',
                      'renderCell: (vfolder) => {\n              const status = vfolder.status as string;')
block = block.replace('render: (_perm: string, vfolder) => {', 'renderCell: (vfolder) => {')
block = block.replace('render: (type: string) => {',
                      'renderCell: (vfolder) => {\n              const type = vfolder.ownership_type as string;')
block = block.replace('render: (__, vfolder) =>', 'renderCell: (vfolder) =>')
block = block.replace('render: (mode: string) => {',
                      'renderCell: (vfolder) => {\n              const mode = vfolder.usage_mode as string;')
block = block.replace('render: (value: number) =>',
                      'renderCell: (vfolder) =>\n              ((value) =>')
block = block.replace('render: (value: string) =>',
                      'renderCell: (vfolder) =>\n              ((value) =>')
block = block.replace('render: (value: boolean) =>',
                      'renderCell: (vfolder) =>\n              ((value) =>')

s = s[:start] + block + s[end:]
f.write_text(s)
print('columns rewritten')
