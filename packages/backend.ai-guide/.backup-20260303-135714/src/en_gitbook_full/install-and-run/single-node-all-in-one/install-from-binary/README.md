---
title: Install from Binary
order: 31
---
---
description: Easy installment in single machine via Backend.AI TUI (Text-UI) Installer
---

# Install from Binary

:::info
**Notes**

It is recommended to install on Ubuntu, RHEL, and AlmaLinux.&#x20;

Check [support-environments.md](../../support-environments.md "mention") for the appropriate versions.

This manual is based on Ubuntu, on x86\_64 architecture environment.
:::

## Prerequisites

Verify that all prerequisites, such as Git LFS and pyenv, are installed. If they are not, refer to the [prerequisites](../../prerequisites/ "mention") section and its related items to complete the necessary environment setup before returning to the Installation section.

## Backend.AI Installer

### Method 1. Download Installation File from Website

<figure><img src="../../../images/스크린샷 2025-06-12 오후 2.05.40.png" alt=""><figcaption><p>Backend.AI Install Page</p></figcaption></figure>

Download the installation file from the [Backend.AI Download Page](https://www.backend.ai/download) or on our [GitHub Release Page](https://github.com/lablup/backend.ai/releases/).

Once the file has been downloaded, the following command can be used to execute and install the file. In case selecting other version rather than macOS and aarch64 architecture, change the prefix to corresponding environment. List of available prefix is located below at the table, and the prefix should be matched with the downloaded file.

```bash
$ ./backendai-install-linux-x86_64 install
```

:::info
#### For macOS users:

Depending on user settings, macOS users may encounter a warning message indicating that the software cannot be verified for malicious content. Although the Backend.AI installation package is a secure package that has passed security checks, a security exception must be configured in the operating system settings if this warning appears. If this warning is displayed, refer to [#malicious-contents-installation-error-on-macos](../../../backend.ai-overview/faq/backend.ai-troubleshooting.md#malicious-contents-installation-error-on-macos "mention") section for further instructions.
:::

### Method 2. Retrieve File from Repository with wget command.

The latest stable version can be downloaded from the server via the terminal using the wget command. Same command can be copied at the [Backend.AI Download Page](https://www.backend.ai/download).

```shell-session
wget https://bnd.ai/installer-stable-linux-x86_64
```

In case having different combination of the operating system and architecture, please follow the table below for the reference. Switch `linux-x86_64` prefix into following references.


| OS | Architecture | Command |
| --- | --- | --- |
| Linux | x86-64 | linux-x86_64 |
| Linux | aarch64 | linux-aarch64 |
| macOS | x86-64 | macos-x86_64 |
| macOS | aarch64 | macos-aarch64 |



After downloading the installer file, permission needs to be updated to run the file.

```bash
chmod 755 installer-stable-linux-x86_64
```

After changing the permission, install the file with following command. System will automatically follow the installation command and will show the Backend.AI TUI (Text-UI) Installer.

```
./installer-stable-linux-x86_64 install
```

:::danger
#### Warning

If Backend.AI is installed on a general-purpose operating system (like personal macOS) that is not configured as a dedicated system, the Backend.AI client may not function properly due to interference from the existing user environment. In such cases, additional support from Lablup may be limited.
:::

## Backend.AI TUI (Text-UI) Installer

<figure><img src="../../../images/backendai-TUI-installer.png" alt=""><figcaption><p>Backend.AI TUI Installer</p></figcaption></figure>

Backend.AI TUI Installer is easy-to-use installation helper when installing Backend.AI. List of available options as follows.

* **DEVELOP:** Install Backend.AI from source code available on GitHub.
* **PACKAGE:** Install using binary packages.
* **MAINTAIN:** Maintenance mode for troubleshooting or resolving issues with an installed version.

To install Backend.AI, select 'PACKAGE' at the middle to proceed. Highlighting each section is available by clicking arrow key. Selecting PACKAGE will automatically proceed the installation by downloading corresponding packages and docker images.&#x20;

<figure><img src="../../../images/Installer.jpg" alt=""><figcaption><p>Installation Report</p></figcaption></figure>

When installation is finished, Install Report is shown. Before moving on to each components, open up the new terminal.

<figure><img src="../../../images/image (1) (1) (1).png" alt=""><figcaption><p>Checking the installation of components</p></figcaption></figure>

Use `docker ps` command to check Postgresql, etcd, Redis is running.

Use `ls` command to check the newly created directory, which will be `backendai`.

Use `cd backendai` to move to the directory.

## Starting Each Component

After completing the installation, run 5 different component of Backend.AI. Each component as follows.

:::info
**Notes**

Each terminal should be opened in a new window, and tools such as [tmux](https://www.redhat.com/en/blog/introduction-tmux-linux) should be used to ensure that processes do not terminate.
:::

* Web Server: `./backendai-webserver web start-server`
* Manager: `./backendai-manager mgr start-server`
* Agent: `./backendai-agent ag start-server`
* Storage Proxy: `./backendai-storage-proxy storage start-server`
* Local Proxy: `./backendai-wsproxy wsproxy start-server`

## Run Backend.AI on Web Browser and Login

Access to the given address at the installer. Port number should be `:8090` as default.

<figure><img src="../../../images/image (1) (1).png" alt=""><figcaption><p>Backend.AI Login page</p></figcaption></figure>

Login with the provided default ID and password. Default password is randomly generated.









