import json, os, collections

tr = {
    'en': 'Menu', 'ko': '메뉴', 'ja': 'メニュー', 'zh-CN': '菜单', 'zh-TW': '選單',
    'de': 'Menü', 'es': 'Menú', 'fr': 'Menu', 'it': 'Menu', 'pt': 'Menu',
    'pt-BR': 'Menu', 'ru': 'Меню', 'tr': 'Menü', 'vi': 'Menu', 'th': 'เมนู',
    'pl': 'Menu', 'fi': 'Valikko', 'el': 'Μενού', 'id': 'Menu', 'ms': 'Menu',
    'mn': 'Цэс',
}
d = 'resources/i18n'
for f in sorted(os.listdir(d)):
    lang = f[:-5]
    p = os.path.join(d, f)
    with open(p, encoding='utf-8') as fh:
        data = json.load(fh, object_pairs_hook=collections.OrderedDict)
    menu = data.get('webui', {}).get('menu')
    if menu is None:
        print('skip', f)
        continue
    if 'Menu' in menu:
        print('exists', f)
        continue
    menu['Menu'] = tr.get(lang, 'Menu')
    with open(p, 'w', encoding='utf-8') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write('\n')
    print('added', f, menu['Menu'])
