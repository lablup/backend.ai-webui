import pathlib, re

FILES = [
    'react/src/pages/AdminVFolderNodeListPage.tsx',
    'react/src/components/VFolderNodes.tsx',
    'react/src/components/DeleteVFolderModal.tsx',
    'react/src/components/RestoreVFolderModal.tsx',
    'react/src/components/FolderCreateModalV2.tsx',
    'react/src/components/AutoUpdateFetchKeyButton.tsx',
]
NAMES = ['BAIFlex', 'BAIButton', 'BAITag', 'BAIText', 'BAILink',
         'BAISelectionLabel', 'BAICard', 'BAIModal', 'BAITable']
total = 0
for name in NAMES:
    n = 0
    per = []
    for p in FILES:
        s = pathlib.Path(p).read_text()
        c = len(re.findall(r'<%s[\s/>]' % name, s))
        if c:
            per.append('%s=%d' % (p.split('/')[-1], c))
        n += c
    total += n
    print('%-20s %3d   %s' % (name, n, ' '.join(per)))
print('TOTAL JSX call sites:', total)
