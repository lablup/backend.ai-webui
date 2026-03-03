---
title: Setup OS Environment
order: 27
---
# Setup OS Environment

Backend.AI and its associated components share common requirements and configurations for proper operation. This section explains how to configure the operating system environment.

:::info
**Note**

This section assumes the installation on Ubuntu 24.04 LTS.
:::

## Create a user account for operation

* Create a user account named `bai` for installing and operating Backend.AI services.&#x20;

:::info
**Note**

Any username may be specified when creating an account. However, it is recommended to use a dedicated account for operations and to follow the `bai` naming convention when possible.
:::

* Assign 1100 to `UID` and `GID`  to avoid conflicts with existing users or groups.&#x20;
* Grant `sudo` privileges by adding `bai` to the `sudo` group.

```bash
$ username="bai"
$ password="secure-password"
$ sudo adduser --disabled-password --uid 1100 --gecos "" $username
$ echo "$username:$password" | sudo chpasswd
$ sudo usermod -aG sudo bai
```

* To avoid exposing the password in the shell history, omit the `--disabled-password` option and set the password interactively when prompted.
* Log in as the `bai` user to proceed with the installation.

## Install Docker engine

* [Docker Engine](https://docs.docker.com/engine/install/ubuntu/) must be installed to enable compute session creation with the Docker container backend in Backend.AI. Certain service components are also deployed as containers.
* Install the `docker-compose-plugin` to ensure availability of the `docker compose` command.
* After installation, add the `bai` user to the `docker` group to allow interaction with the Docker Engine without requiring the `sudo` prefix for each command.

```bash
$ sudo usermod -aG docker bai
```

* Logout and login again to apply the group membership change.

## Optimize sysctl/ulimit parameters

This is not essential but the recommended step to optimize the performance and stability of operating Backend.AI. Refer to the [guide of the Manager repiository](https://github.com/lablup/backend.ai/blob/main/src/ai/backend/manager/README.md#kernelsystem-configuration) for the details of the kernel parameters and the ulimit settings. Depending on the Backend.AI services you install, the optimal values may vary. Each service installation section guide with the values, if needed.

:::info
**Note**

Modern systems may have already set the optimal parameters. In that case, you can skip this step.
:::

To cleanly separate the configurations, you may follow the steps below.

*   Save the resource limit parameters in `/etc/security/limits.d/99-backendai.conf`.

    ```sh
    root hard nofile 512000
    root soft nofile 512000
    root hard nproc 65536
    root soft nproc 65536
    bai hard nofile 512000
    bai soft nofile 512000
    bai hard nproc 65536
    bai soft nproc 65536
    ```
* Logout and login again to apply the resource limit changes.
*   Save the kernel parameters in `/etc/sysctl.d/99-backendai.conf`.

    ```shell
    fs.file-max=2048000
    net.core.somaxconn=1024
    net.ipv4.tcp_max_syn_backlog=1024
    net.ipv4.tcp_slow_start_after_idle=0
    net.ipv4.tcp_fin_timeout=10
    net.ipv4.tcp_window_scaling=1
    net.ipv4.tcp_tw_reuse=1
    net.ipv4.tcp_early_retrans=1
    net.ipv4.ip_local_port_range="10000 65000"
    net.core.rmem_max=16777216
    net.core.wmem_max=16777216
    net.ipv4.tcp_rmem=4096 12582912 16777216
    net.ipv4.tcp_wmem=4096 12582912 16777216
    vm.overcommit_memory=1
    ```
* Apply the kernel parameters with `sudo sysctl -p /etc/sysctl.d/99-backendai.conf`.

## Prepare required Python versions and virtual environments

Prepare a Python distribution whose version meets the requirements of the target package. Backend.AI 25.6, for example, requires Python 3.13. Ensure that the appropriate environment is set up by verifying against the version table provided below.

| Backend.AI Core Version | Python Version | Pantsbuild Version |
| ----------------------- | -------------- | ------------------ |
| 25.x                    | 3.13.x         | 2.23.2             |
| 24.03.x \~ 24.09.x      | 3.12.x         | 2.21.x             |
| 23.03.x \~ 23.09.x      | 3.11.x         | 2.19.x             |
| 22.03.x \~ 22.09.x      | 3.10.x         |                    |
| 21.03.x \~ 21.09.x      | 3.8.x          |                    |

There can be several ways to prepare a specific Python version. Here, we will be using a standalone static built Python.

### Use a standalone static built Python (Recommended)

Obtain distribution of [a standalone static built Python](https://github.com/indygreg/python-build-standalone/releases) according to required python version, target machine architecture and etc. Then extract the distribution to a directory of your choice.

```bash
$ curl -L "https://github.com/indygreg/python-build-standalone/releases/download/${PYTHON_RELEASE_DATE}/cpython-${PYTHON_VERSION}+${PYTHON_RELEASE_DATE}-${TARGET_MACHINE_ARCHITECTURE}-${ARCHIVE_FLAVOR}.tar.gz" > cpython-${PYTHON_VERSION}+${PYTHON_RELEASE_DATE}-${TARGET_MACHINE_ARCHITECTURE}-${ARCHIVE_FLAVOR}.tar.gz
$ tar -xf "cpython-${PYTHON_VERSION}+${PYTHON_RELEASE_DATE}-${TARGET_MACHINE_ARCHITECTURE}-${ARCHIVE_FLAVOR}.tar.gz"
$ mkdir -p "/home/${USERNAME}/.static-python/versions"
$ mv python "/home/${USERNAME}/.static-python/versions/${PYTHON_VERSION}"
```

For example,

```bash
$ curl -L "https://github.com/indygreg/python-build-standalone/releases/download/20231002/cpython-3.12.2+20240224-x86_64-unknown-linux-gnu-install_only.tar.gz" > cpython-3.12.2+20240224-x86_64-unknown-linux-gnu-install_only.tar.gz
$ tar -xf "cpython-3.12.2+20240224-x86_64-unknown-linux-gnu-install_only.tar.gz"
$ mkdir -p "/home/bai/.static-python/versions"
$ mv python "/home/bai/.static-python/versions/3.12.2"
```

Then, you can create multiple virtual environments per service. To create a virtual environment for Backend.AI Manager and activate it, for example, you may run:

```bash
$ mkdir "${HOME}/manager"
$ cd "${HOME}/manager"
$ ~/.static-python/versions/3.12.2/bin/python3 -m venv .venv
$ source .venv/bin/activate
$ pip install -U pip setuptools wheel
```

You also need to make `pip` available to the Python installation with the latest `wheel` and `setuptools` packages, so that any non-binary extension packages can be compiled and installed on your system.

### (Alternative) Use pyenv to manually build and select a specific Python version

If you prefer, there is no problem using pyenv and pyenv-virtualenv.

Install [pyenv](https://github.com/pyenv/pyenv) and [pyenv-virtualenv](https://github.com/pyenv/pyenv-virtualenv). Then, install a Python version that are needed:

```
$ pyenv install "${YOUR_PYTHON_VERSION}"
```

:::info
**Note**

You may need to install [suggested build environment](https://github.com/pyenv/pyenv/wiki#suggested-build-environment) to build Python from pyenv.
:::

Then, you can create multiple virtual environments per service. To create a virtual environment for Backend.AI Manager 22.09.x and automatically activate it, for example, you may run:

```sh
$ mkdir "${HOME}/manager"
$ cd "${HOME}/manager"
$ pyenv virtualenv "${YOUR_PYTHON_VERSION}" bai-22.09-manager
$ pyenv local bai-22.09-manager
$ pip install -U pip setuptools wheel
```

You also need to make `pip` available to the Python installation with the latest `wheel` and `setuptools` packages, so that any non-binary extension packages can be compiled and installed on your system.

## Configure network aliases

Although not required, using a network aliases instead of IP addresses can make setup and operation easier. Edit the `/etc/hosts` file for each node and append the contents like example below to access each server with network aliases.

```
##### BEGIN for Backend.AI services #####
10.20.30.10 bai-m1   # management node 01
10.20.30.20 bai-a01  # agent node 01 (GPU 01)
10.20.30.22 bai-a02  # agent node 02 (GPU 02)
##### END for Backend.AI services #####
```

Note that the IP addresses should be accessible from other nodes, if you are installing on multiple servers.

## Mount a shared storage

Having a shared storage volume makes it easy to save and manage data inside a Backend.AI compute environment. If you have a dedicated storage, mount it with the name of your choice under `/vfroot/` directory on each server. You must mount it in the same path in all management and compute nodes.

Detailed mount procedures may vary depending on the storage type or vendor. For a usual NFS, adding the configurations to `/etc/fstab` and executing `sudo mount -a` will do the job.

:::info
**Note**

It is recommended to unify the UID and GID of the Storage Proxy service, all of the Agent services across nodes, container UID and GID (configurable in `agent.toml`), and the NFS volume.
:::

If you do not have a dedicated storage or installing on one server, you can use a local directory. Just create a directory `/vfroot/local`.

```
$ sudo mkdir -p /vfroot/local
$ sudo chown -R ${UID}.${GID} /vfroot
```

## Setup accelerators

If there are accelerators (e.g., GPU) on the server, you have to install the vendor-specific drivers and libraries to make sure the accelerators are properly set up and working. Please refer to the vendor documentation for the details.

* To integrate NVIDIA GPUs,
  * Install the NVIDIA driver and CUDA toolkit.
  * Install the NVIDIA container toolkit (nvidia-docker2).

## Pull container images

For compute nodes, you need to pull some container images that are required for creating a compute session. Lablup provides a set of open container images and you may pull the following starter images:

```sh
docker pull cr.backend.ai/stable/filebrowser:21.02-ubuntu20.04
docker pull cr.backend.ai/stable/python:3.9-ubuntu20.04
docker pull cr.backend.ai/stable/python-pytorch:1.11-py38-cuda11.3
docker pull cr.backend.ai/stable/python-tensorflow:2.7-py38-cuda11.3
```
