---
title: Terminating a Session with CLI
order: 100
---
# Terminating a Session with CLI

## Terminating a Session

To terminate a running compute session, use the `session destroy` command:

```shell
$ backend.ai session destroy SESSION_ID_OR_NAME
```

### Example

```shell
$ backend.ai session destroy ldvnpdQ4-session
```

This terminates the session named `ldvnpdQ4-session` and releases all allocated resources.

:::warning
When you terminate a session, all data not saved to a mounted storage folder is lost. Make sure to save your work to a storage folder before ending the session.
:::
