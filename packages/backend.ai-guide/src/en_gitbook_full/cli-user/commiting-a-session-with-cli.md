---
title: Commiting a Session with CLI
order: 98
---
# Commiting a Session with CLI

## Commiting a Session

The action below saves the session and creates a new image.

```python
$ ./backend.ai-client session convert-to-image [OPTIONS] SESSIONID_OR_NAME IMAGENAME
```

* `SESSID_OR_NAME`: The session ID or the name of the session to be saved.
* `IMAGENAME`: The name for the new image to be created.

### Examples

```python
$ ## Example
$ ./backend.ai-client session convert-to-image ldvnpdQ4-session bai-repo:7080/bai-user/ngc-pytorch:22.09-cuda11.8-customized
```

* This command takes the session named `ldvnpdQ4-session` and saves it as a new image named `bai-repo:7080/bai-user/ngc-pytorch:22.09-cuda11.8-customized`.
* All files, installed packages, and settings in the session will be included in the new image.

:::info
**Notes**

Make sure the session contains all the changes to be included in the new image before running the command. The new image can be used just like any other image when creating new sessions.
:::
