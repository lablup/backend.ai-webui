---
title: FAQs & Troubleshooting
order: 42
---
# FAQs & Troubleshooting

## User Troubleshooting Guide

### Session List Is Not Displayed Correctly

Due to intermittent network problems or other various reasons, the session list may not be displayed correctly. Most of the time, this problem will disappear by refreshing the browser.

- **Web-based WebUI**: Refresh the browser page using the shortcut (`Ctrl-R`). Since the browser's cache may cause issues, it is recommended to refresh the page bypassing the cache (`Shift-Ctrl-R`).
- **WebUI App**: Press `Ctrl-R` to refresh the app.

### Suddenly Cannot Login

If there are problems recognizing authentication cookies, you may not be able to login temporarily. Try logging in with a private browser window. If it succeeds, clear your browser's cache and application data.

### How to Install apt Packages

Inside a compute session, you cannot access the `root` account or perform operations that require `sudo` privilege for security reasons. Therefore, installing packages with `apt` or `yum` is not allowed. If required, request `sudo` permission from your administrator.

Alternatively, you can use Homebrew to install OS packages using an automount folder.

### How to Install Packages with pip

By default, pip packages are installed under `~/.local`. If you create an automount storage folder named `.local`, installed packages persist after session termination and can be reused in subsequent sessions.

```shell
$ pip install aiohttp
```

### Cannot Launch Jupyter Notebook

If you installed a Jupyter package with pip manually, it may conflict with the Jupyter package provided by the compute session by default. If you have a `.local` automount folder, manually installed Jupyter packages persist across sessions. Try removing the `.local` automount folder and then launch Jupyter Notebook again.

### Page Layout Is Broken

Backend.AI WebUI utilizes the latest modern JavaScript and browser features. Please use the latest versions of modern browsers (such as Chrome).

### SFTP Disconnection

When the WebUI App launches an SFTP connection, it uses a local proxy server embedded in the App. If you exit the WebUI App during file transfer, the transfer will immediately fail because the proxy connection is disconnected. Do not quit the WebUI App while using SFTP. If you need to refresh, use the `Ctrl-R` shortcut.

## Admin Troubleshooting Guide

### Users Cannot Launch Apps Like Jupyter Notebook

There may be a problem connecting to the WSProxy service. Try stopping and restarting the service.

### Indicated Resources Do Not Match Actual Allocation

Occasionally, due to unstable network connections or container management issues, resource occupancy reported by Backend.AI may not match actual container usage. In this case:

1. Login as an admin account.
2. Visit the **Maintenance** page.
3. Click the **Recalculate Usage** button to manually correct the resource occupancy.

### Image Is Not Displayed After Pushing to a Docker Registry

:::note
This feature is only available for superadmins.
:::

If a new image is pushed to a Backend.AI docker registry, the image metadata must be updated to be used in creating compute sessions. Click the **Rescan Images** button on the Maintenance page to update metadata for all registries.

To update metadata for a specific registry, go to the **Registries** tab in the Environments page and click the refresh button for the desired registry.
