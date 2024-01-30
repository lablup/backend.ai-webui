# VSCode setting
If you want to make VSCode ref to the schema, please add to `settings.json` of VSCode such as `./vscode/setting.json` for workspace setting.

```
"json.schemas": [
  {
    "fileMatch": ["resources/theme.json"],
    "url": "/json_schemas/theme.schema.json"
  }
]
```

- `resources/theme.json`: `/json_schemas/theme.schema.json`
