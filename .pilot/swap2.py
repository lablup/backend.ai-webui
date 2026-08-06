import pathlib, re

modals = {
    'react/src/components/DeleteVFolderModal.tsx': './astryx-bui/',
    'react/src/components/RestoreVFolderModal.tsx': './astryx-bui/',
    'react/src/components/FolderCreateModalV2.tsx': './astryx-bui/',
}
for p, prefix in modals.items():
    f = pathlib.Path(p)
    s = f.read_text()
    s = re.sub(r'^\s*BAIModal,\n', '', s, flags=re.M)
    s = re.sub(r'^\s*BAIModalProps,\n', '', s, flags=re.M)
    lines = s.split('\n')
    lines[4:4] = [
        "import BAIModal from '%sBAIModalAstryx';" % prefix,
        "import type { BAIModalAstryxProps as BAIModalProps } from '%sBAIModalAstryx';" % prefix,
    ]
    f.write_text('\n'.join(lines))
    print('ok', p)

# Page: BAICard
p = 'react/src/pages/AdminVFolderNodeListPage.tsx'
f = pathlib.Path(p)
s = f.read_text()
s = re.sub(r'^\s*BAICard,\n', '', s, flags=re.M)
lines = s.split('\n')
lines[4:4] = ["import BAICard from '../components/astryx-bui/BAICardAstryx';"]
f.write_text('\n'.join(lines))
print('ok', p)
