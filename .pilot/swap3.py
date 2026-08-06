import pathlib, re

# VFolderNodes: BAIText / BAILink / BAITag
p = 'react/src/components/VFolderNodes.tsx'
f = pathlib.Path(p)
s = f.read_text()
for name in ('BAIText', 'BAILink', 'BAITag'):
    s = re.sub(r'^\s*%s,\n' % name, '', s, flags=re.M)
lines = s.split('\n')
lines[4:4] = [
    "import { BAILink, BAITag, BAIText } from './astryx-bui/smallPrimitives';",
]
f.write_text('\n'.join(lines))
print('ok', p)

# Page: BAISelectionLabel
p = 'react/src/pages/AdminVFolderNodeListPage.tsx'
f = pathlib.Path(p)
s = f.read_text()
s = re.sub(r'^\s*BAISelectionLabel,\n', '', s, flags=re.M)
lines = s.split('\n')
lines[4:4] = [
    "import { BAISelectionLabel } from '../components/astryx-bui/smallPrimitives';",
]
f.write_text('\n'.join(lines))
print('ok', p)
