---
title: Starting a Session with CLI
order: 97
---
# Starting a Session with CLI

## Starting a Session

Create a single compute session with the `create` command.

```python
./backend.ai-client session create [OPTIONS] IMAGE
```

### Resource Settings

* `-r, --resources KEY=VAL`
  *   `-r cpu`: Number of CPU cores

      e.g. `-r cpu=2` → Use 2 CPU Cores
  *   `-r mem`: Memory (Units are not attached when using MiB units.)

      e.g. `-r mem=256` → Use 256MiB of Memory
  *   `-r cuda.shares`: Number of fGPUs to use

      e.g. `-r cuda.shares=1` → Use 1 fGPU

### Architecture Settings

* `--arch <Architecture Name>` : The architecture the image to use\
  e.g `--arch aarch64` → Use ARM 64-bit architecture

#### List of available architecture


| Architecture | Description |
| --- | --- |
| aarch64 | 64-bit ARM architecture |
| x86_64 | 64-bit Intel/AMD architecture |



### Examples

```python
$ ## Example
$ ./backend.ai-client session create -r cpu=2 -r mem=256 –r cuda.shares=1 --arch aarch64 cr.backend.ai/multiarch/python:3.11-ubuntu24.04
```

This example creates a session with:

* 2 CPU cores
* 256 MiB memory
* 1 fGPU
* aarch64 architecture
