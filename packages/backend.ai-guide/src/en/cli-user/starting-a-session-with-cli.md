---
title: Starting a Session with CLI
order: 97
---
# Starting a Session with CLI

## Starting a Session

Create a single compute session with the `create` command.

```shell
$ backend.ai session create [OPTIONS] IMAGE
```

### Resource Settings

- `-r, --resources KEY=VAL`
   * `-r cpu`: Number of CPU cores. e.g., `-r cpu=2` allocates 2 CPU cores.
   * `-r mem`: Memory in MiB (no unit suffix needed). e.g., `-r mem=256` allocates 256 MiB of memory.
   * `-r cuda.shares`: Number of fGPUs to use. e.g., `-r cuda.shares=1` allocates 1 fGPU.

### Architecture Settings

- `--arch <Architecture Name>`: The architecture of the image to use. e.g., `--arch aarch64` uses ARM 64-bit architecture.

### Available Architectures

| Architecture | Description |
|--------------|-------------|
| aarch64 | 64-bit ARM architecture |
| x86_64 | 64-bit Intel/AMD architecture |

### Examples

```shell
$ backend.ai session create -r cpu=2 -r mem=256 -r cuda.shares=1 --arch aarch64 cr.backend.ai/multiarch/python:3.11-ubuntu24.04
```

This example creates a session with:

- 2 CPU cores
- 256 MiB memory
- 1 fGPU
- aarch64 architecture
