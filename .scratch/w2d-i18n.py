#!/usr/bin/env python3
"""Add the new BUI locale keys W2-D introduced.

Every key here exists because Astryx makes an accessible name REQUIRED where
antd allowed none (contract 1 / P8): a generic action name for icon-only
buttons, an increase/decrease pair for the rebuilt number stepper, a unit
selector name, and so on. English strings are written into every locale file so
nothing renders a raw key; translation is a follow-up (i18n-patterns).
"""
import json
import os
import glob

NEW = {
    'general': {
        'Decrease': 'Decrease',
        'Increase': 'Increase',
        'Select': 'Select',
        'Unit': 'Unit',
        'button': {
            'Action': 'Action',
            'Back': 'Back',
            'Confirm': 'Confirm',
        },
    },
    'comp:BAIDynamicUnitInputNumberWithSlider': {
        'Amount': 'Amount',
    },
    'comp:BAINameActionCell': {
        'MoreActions': 'More actions',
    },
    'comp:FileExplorer': {
        'Path': 'Path',
        'RenameFile': 'Rename',
    },
}


def merge(target: dict, extra: dict) -> None:
    for key, value in extra.items():
        if isinstance(value, dict):
            node = target.setdefault(key, {})
            merge(node, value)
        elif key not in target:
            target[key] = value


def sort_deep(node):
    if isinstance(node, dict):
        return {k: sort_deep(node[k]) for k in sorted(node)}
    return node


root = 'packages/backend.ai-ui/src/locale'
for path in sorted(glob.glob(os.path.join(root, '*.json'))):
    with open(path, encoding='utf-8') as fh:
        data = json.load(fh)
    merge(data, NEW)
    schema = data.pop('$schema', None)
    data = sort_deep(data)
    if schema is not None:
        data = {'$schema': schema, **data}
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write('\n')
    print('updated', os.path.basename(path))
