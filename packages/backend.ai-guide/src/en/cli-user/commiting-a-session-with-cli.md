---
title: Committing a Session with CLI
order: 98
---
# Committing a Session with CLI

## Committing a Session

The action below saves the session and creates a new image.

```shell
$ backend.ai session convert-to-image [OPTIONS] SESSION_ID_OR_NAME IMAGE_NAME
```

- `SESSION_ID_OR_NAME`: The session ID or the name of the session to be saved.
- `IMAGE_NAME`: The name for the new image to be created.

### Examples

```shell
$ backend.ai session convert-to-image ldvnpdQ4-session bai-repo:7080/bai-user/ngc-pytorch:22.09-cuda11.8-customized
```

This command takes the session named `ldvnpdQ4-session` and saves it as a new image named `bai-repo:7080/bai-user/ngc-pytorch:22.09-cuda11.8-customized`. All files, installed packages, and settings in the session are included in the new image.

:::note
Make sure the session contains all the changes you want to include in the new image before running the command. The new image can be used just like any other image when creating new sessions.
:::
