import pathlib, re

targets = {
    'react/src/pages/AdminVFolderNodeListPage.tsx': '../components/astryx-bui/',
    'react/src/components/VFolderNodes.tsx': './astryx-bui/',
    'react/src/components/DeleteVFolderModal.tsx': './astryx-bui/',
    'react/src/components/RestoreVFolderModal.tsx': './astryx-bui/',
    'react/src/components/FolderCreateModalV2.tsx': './astryx-bui/',
}
for p, prefix in targets.items():
    f = pathlib.Path(p)
    s = f.read_text()
    used_flex = 'BAIFlex' in s
    used_btn = 'BAIButton' in s
    s = re.sub(r'^\s*BAIFlex,\n', '', s, flags=re.M)
    s = re.sub(r'^\s*BAIButton,\n', '', s, flags=re.M)
    adds = []
    if used_flex:
        adds.append("import BAIFlex from '%sBAIFlexAstryx';" % prefix)
    if used_btn:
        adds.append("import BAIButton from '%sBAIButtonAstryx';" % prefix)
    if adds:
        lines = s.split('\n')
        lines[4:4] = adds
        s = '\n'.join(lines)
    f.write_text(s)
    print('ok', p, 'flex' if used_flex else '', 'btn' if used_btn else '')
