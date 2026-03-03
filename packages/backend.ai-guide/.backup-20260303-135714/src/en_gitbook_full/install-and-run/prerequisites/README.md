---
title: Prerequisites
order: 26
---
# Prerequisites

Install the followings accordingly to your host operating system.

* [Git LFS](https://git-lfs.github.com/)
* [pyenv](https://github.com/pyenv/pyenv) and [pyenv-virtualenv](https://github.com/pyenv/pyenv-virtualenv)
  * Ensure that you have all of the Python versions specified in `pants.toml` with `pyenv`. (both Python 3.9.x and Python 3.10.8 at the time of writing, but please consult your copy of `pants.toml` for the latest information)
  * [Check the prerequisites for Python build environment setup for your system.](https://github.com/pyenv/pyenv/wiki#suggested-build-environment)
* [Docker](https://docs.docker.com/install/)
* [Docker Compose](https://docs.docker.com/compose/install/) (v2 required)
* (For Linux aarch64/arm64 setups only) [Rust](https://rustup.rs/) to build Pants from its source
* [Pants](https://www.pantsbuild.org/2.18/docs/getting-started/installing-pants)
  * For pants version 2.18 and later. The following verions are released from Github Releases instead of PyPI.

:::warning
**Warning**

To avoid conflicts with your system Python such as macOS/XCode versions, our default `pants.toml` is configured to search only `pyenv`-provided Python versions.
:::

:::info
**Notes**

In some cases, locale conflicts between the terminal client and the remote host may cause encoding errors when installing Backend.AI components due to Unicode characters in README files. Please keep correct locale configurations to prevent such errors.
:::
