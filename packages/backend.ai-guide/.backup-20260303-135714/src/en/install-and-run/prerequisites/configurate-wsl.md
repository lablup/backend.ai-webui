---
title: Configurate WSL
order: 29
---
# Configurate WSL

Backend.AI supports operation on Windows Subsystem for Linux (WSL) version 2. However, specific configuration steps are required to enable the WSL distribution to interact properly with the Docker Desktop service.

## Configure Docker Desktop for Windows

Enable WSL integration by navigating to **Settings → Resources → WSL Integration** in Docker Desktop. In most cases, this option is already configured during the installation of Docker Desktop for Windows.

:::info
**See also:**

[https://docs.docker.com/desktop/wsl/](https://docs.docker.com/desktop/wsl/)
:::

## Configure WSL

* Open the WSL shell and use `sudo` to create or edit `/etc/wsl.conf`.
* Add the following configuration and save the file:

```bash
[automount]
root = /
options = "metadata"
```

* In a PowerShell prompt, execute `wsl --shutdown` to restart the WSL distribution and apply the changes.
* Re-enter the WSL shell. If the configuration is applied correctly, file paths will appear as `/c/some/path` instead of `/mnt/c/some/path`.
* In the WSL shell, run the following command:

```bash
sudo mount --make-rshared /
```

* This step is required to prevent errors such as `aiodocker.exceptions.DockerError: DockerError(500, 'path is mounted on /d but it is not a shared mount.')` during container creation from Backend.AI.
* The Backend.AI installer can now be executed in the WSL shell.
