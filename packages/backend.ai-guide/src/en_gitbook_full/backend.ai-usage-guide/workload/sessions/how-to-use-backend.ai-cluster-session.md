---
title: How to use Backend.AI Cluster Session
order: 69
---
# How to use Backend.AI Cluster Session

## OpenMPI Example

```bash
BACKENDAI_CLUSTER_HOSTS=main1,sub1,sub2,sub3
BACKENDAI_CLUSTER_SIZE=4
```

```bash
#!/bin/bash
slots_per_host=${GPU_COUNT}  # assuming all containers have same number of GPUs
num_proc=$(expr "$slots_per_host" '*' "$BACKENDAI_CLUSTER_SIZE")
IFS=',' read -r -a cluster_hosts <<< "$BACKENDAI_CLUSTER_HOSTS"
function join_with_slots {
  local d=${1-} f=${2-}
  if shift 2; then
    printf "%s:$slots_per_host" "$f" "${@/#/$d}"
  fi
}
mpirun -np $(num_proc) --hosts $(join_with_slots "," ${cluster_hosts[@]}) ...
```

is equivalent to the following:

```bash
mpirun -np 32 --hosts main1:8,sub1:8,sub2:8,sub3:8 ...
```

:::info
slots\_per\_host may be calculated from the CPU core count or the number of GPUs, depending on your program.
:::

:::info
Since OpenMPI uses the standard SSH client, there is no need to take care of port numbers for the host networking mode as \~/.ssh/config is automatically populated by Backend.AI.
:::







