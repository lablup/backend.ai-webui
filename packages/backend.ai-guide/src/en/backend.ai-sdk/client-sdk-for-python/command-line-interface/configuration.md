---
title: Configuration
order: 181
---
# Configuration

:::info
**Note**

Please consult the detailed usage in the help of each command (use `-h` or `--help` argument to display the manual).
:::

Check out the [Client Configuration](../client-configuration.md) section for configurations via environment variables.

## Session Mode

When the endpoint type is `"session"`, you must explicitly login and logout into/from the console server.

```
$ backend.ai login
Username: myaccount@example.com
Password:
✔ Login succeeded.

$ backend.ai ...  # any commands

$ backend.ai logout
✔ Logout done.
```

## API Mode

After setting up the environment variables, just run any command:

```
$ backend.ai ...
```

## Checking out the current configuration

Run the following command to list your current active configurations.

```
$ backend.ai config
```
