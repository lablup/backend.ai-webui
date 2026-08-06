"""Repair the value-style renderCell bodies produced by cols.py."""
import pathlib
import re

f = pathlib.Path('react/src/components/VFolderNodes.tsx')
s = f.read_text()

# Each broken site looks like:
#   dataIndex: 'X',
#   ...
#   renderCell: (vfolder) =>
#     ((value) =>
#     <expr>,
# Rewrite to a block body that reads `value` from the row.
pattern = re.compile(
    r"renderCell: \(vfolder\) =>\n\s*\(\(value\) =>\n(?P<body>.*?)(?=\n\s{10}\},)",
    re.S,
)

# Find each column's dataIndex by walking backwards from the match.
out = []
pos = 0
for m in pattern.finditer(s):
    head = s[:m.start()]
    di = re.findall(r"dataIndex: '([^']+)'", head)[-1]
    body = m.group('body').rstrip().rstrip(',')
    body = '\n'.join('  ' + line for line in body.split('\n'))
    repl = (
        "renderCell: (vfolder) => {\n"
        "              const value = vfolder.%s;\n"
        "              return (\n%s\n              );\n"
        "            }" % (di, body)
    )
    out.append(s[pos:m.start()] + repl)
    pos = m.end()
out.append(s[pos:])
s = ''.join(out)
f.write_text(s)
print('repaired')
