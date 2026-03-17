---
title: Downloading Files from Session with CLI
order: 99
---
# Downloading Files from Session with CLI

You can download files generated within a compute session to your local machine using the CLI. This is useful for retrieving results, logs, or any output produced during your session.

## Downloading Files

Use the `session download` command to download files from a running session:

```shell
$ backend.ai session download SESSION_ID_OR_NAME FILE_PATH
```

- `SESSION_ID_OR_NAME`: The session ID or name of the target session.
- `FILE_PATH`: The path to the file inside the session's working directory.

### Downloading a Single File

```shell
$ backend.ai session download my-session output/results.csv
```

This downloads `results.csv` from the `output/` directory inside the session to your current local directory.

### Downloading Multiple Files

You can specify multiple file paths in a single command:

```shell
$ backend.ai session download my-session model.pt logs/training.log results/metrics.json
```

:::note
Files are downloaded relative to the session's working directory (typically `/home/work/`). Make sure you specify the correct relative path from that directory.
:::

## Using Storage Folders for Persistent Files

If you need persistent file storage that survives session termination, consider using storage folders (vfolders) instead of downloading files from the session directly. Storage folders remain accessible across multiple sessions.

```shell
$ backend.ai vfolder list              # List your storage folders
$ backend.ai vfolder download FOLDER_NAME FILE_PATH  # Download from a storage folder
```

:::tip
Mount a storage folder when creating a session to save output files directly to persistent storage. This avoids the need to download files before the session ends.
:::

## Important Considerations

- The session must be in a **running** state to download files from it.
- If the session has already been terminated, files not saved to a mounted storage folder are lost.
- Large file downloads may take time depending on network conditions and file size.
