---
title: SSH/SFTP Connection to a Compute Session
order: 72
---
# SSH/SFTP Connection to a Compute Session

## Overview

When additional programs or libraries are required but not present in the current environment, install them using linuxbrew.

:::info
**Note**

Newly installed programs are placed in the user directory and are not dependent on the environment.
:::

## Install packages with linuxbrew

For users familiar with [Homebrew](https://brew.sh/) on macOS, linuxbrew provides similar functionality for installing Unix programs within Backend.AI.

### Creating a user linuxbrew directory

* Directories prefixed with a dot (e.g., `.linuxbrew`) are automatically mounted at session start.
* Create a `.linuxbrew` directory in the home directory (storage section) to ensure that programs installed via linuxbrew are accessible across all sessions.

Enter the following command with CLI:

```bash
$ backend.ai vfolder create .linuxbrew
```

Verify correct creation of the directories as follows.

```bash
$ backend.ai vfolder list
```

A directory with the same name may also be created using the GUI console. To see how to create a directory via Backend.AI WebUI (GUI), refer to [how-to-create-rename-update-delete-storage-folders.md](../../storage/data/how-to-create-rename-update-delete-storage-folders.md "mention").

### Installing linuxbrew

Begin installation of linuxbrew by starting a new session. Select the desired environment and allocate appropriate resources. For most installations, 1 CPU and 4GB RAM are sufficient. When compiling or installing GPU-dependent libraries, adjust resource allocation as necessary.

Enter the following command to fetch Linuxbrew installation script from the internet and immediately executes it in the shell.

```bash
$ sh -c "$(curl -fsSL https://raw.githubusercontent.com/Linuxbrew/install/master/install.sh)"
```













### Testing linuxbrew

Enter the brew command to verify that linuxbrew is installed. In general, to use `linuxbrew` you need to add the path where `linuxbrew` is installed to the PATH variable.

Enter the following command to temporarily add the path and verify that it is installed correctly.

```bash
$ brew
```

### Setting linuxbrew environment variables automatically

To correctly reference the binaries and libraries installed by linuxbrew, add the configuration to `.bashrc`. You can add settings from the settings tab.

### Example: Installing and testing htop

To test the program installation, let’s install a program called `htop`. `htop` is a program that extends the top command, allowing you to monitor the running computing environment in a variety of ways.

Let’s install it with the following command:

```bash
$ brew install htop
```

If there are any libraries needed for the `htop` program, they will be installed automatically.

Now let’s run:

```bash
$ htop
```

From the run screen, you can press q to return to the terminal.

1.6 Deleting the linuxbrew Environment

To reset all programs installed with linuxbrew, just delete everything in the .linuxbrew directory.

Note: If you want to remove a program by selecting it, use the `brew uninstall [PROGRAM_NAME]` command.

```bash
$ rm -rf ~/.linuxbrew/*
```

## Install packages with miniconda

Some environments support miniconda. In this case, you can use _miniconda \<https://docs.conda.io/projects/conda/en/latest/user-guide/install/>_ to install the packages you want.

### Creating a user miniconda-required directory

Directories that begin with a dot are automatically mounted when the session starts. Create a `.conda`, `.continuum` directory that will be automatically mounted so that programs you install with miniconda can be used in all sessions.

Create `.conda`, `.continuum` in the Storage section.

With CLI:

```bash
$ backend.ai vfolder create .conda
$ backend.ai vfolder create .continuum
```

Let’s check if they are created correctly.

```bash
$ backend.ai vfolder list
```

Also, you can create a directory using GUI console with same name.

### miniconda test

Make sure you have miniconda installed in your environment. Package installation using miniconda is only available if miniconda is preinstalled in your environment.

```bash
$ conda
```

### Example: Installing and testing htop

To test the program installation, let’s install a program called `htop`. `htop` is a program that extends the top command, allowing you to monitor the running computing environment in a variety of ways.

Let’s install it with the following command:

```bash
$ conda install -c conda-forge htop
```

If there are any libraries needed for the `htop` program, they will be installed automatically.

Now let’s run:

```bash
$ htop
```

From the run screen, you can press q to return to the terminal.
