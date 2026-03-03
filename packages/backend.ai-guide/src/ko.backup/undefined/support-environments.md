---
title: 지원되는 환경
order: 23
---
# 지원되는 환경





Backend.AI 는 다음 목록의 하드웨어를 지원하며 24.03 버전 기준으로 PyThon 3.12 실행 환경이 필요합니다.

## Hardware


| 베이스 플랫폼 | 최소 사양 | 권장 사양 |
| --- | --- | --- |
| 호스트 CPU | x86-64 (AVX2, SSE4.2), Armv8/v9 | 최소 사양과 동일 |
| 운영체제 | Ubuntu 22.04 / RHEL 8 | Ubuntu 24.04 / RHEL 9+ / Alma Linux 9+ |
| Docker Engine | 19.03 | 23.0 |
| 스토리지 | NFS or FUSE volume mounts | GPUDirect Storage, Per-directory quota |
| 네트워크 | 1G (서비스 / 컨트롤 / 데이터 / P2P) | 10G+ (서비스), 100G+ IB or RoCE (데이터 / P2P), 1G (컨트롤) |






|   | CPU* | RAM* | Disk (min) |
| --- | --- | --- | --- |
| 매니저 | 2 - 16 | 2 GiB | 50 GB |
| 에이전트 | 1 | 512 MiB - 1 GiB | 20 GB - 2 TB** |
| 앱 프록시, 웹 서 | 1 - 8 | 2 GiB - 16 GiB | 10 GB |
| 스토리지 프록시 | 1 - 8 | 4 GiB - 16 GiB | 10 GB (exel. storage volume) |
| 컨테이너 레지스트리 (옵션) | 1 - 4 | 2 GiB - 8 GiB | 500 GB - 10 TB |
| Reservoir (옵션) | 1 - 4 | 4 GiB - 16 GiB | 40 TB+ (cf. PyPI takes 23.9 TB at Nov. 2024) |



\* This specification is only for the agent service itself. The actual per-node hardware requirements vary by the user workloads. It is recommended to have at least twice as much system memory as the GPU memory installed in the system.&#x20;

\*\* The desired disk space varies depending on the number and size of locally cached images and the number of containers running concurrently per node.



## Supported Accelerators


| Vendor | Minimum Requirements | Dedicated features |
| --- | --- | --- |
| NVIDIA | CUDA compute capability 7.5 or later | Fractional GPU virtualization for containers |
| Intel | Gaudi 2 and 3 |   |
| AMD | MI250X or later |   |
| Rebellions | ATOM / ATOM+ |   |
| Furiosa | RNGD |   |
| Sapeon | X220 |   |
| Graphcore |   |   |
| Tenstorrent |   |   |
| Groq |   |   |
| Samba Nova |   |   |



## Supported Platforms and Architectures


### NVIDIA

| NVIDIA Hardware Platform  | Operating System         | CPU Architecture |
| ------------------------- | ------------------------ | ---------------- |
| DGX (B200, H200)          | DGX OS                   | x86-64           |
| DGX (GB200, GH200)        | DGX OS                   | Arm64            |
| HGX                       | Ubuntu / RHEL-Compatible | x86-64           |
| DGX Spark (GB10)          | Ubuntu-based             | Arm64            |
| Jetson (NX, Xavier, Orin) | Jetpack (Ubuntu-based)   | Arm64            |



### Intel

| Intel Hardware Platform | Operating System | CPU Architecture |
| ----------------------- | ---------------- | ---------------- |
| Gaudi 2                 |                  |                  |
| Gaudi 3                 |                  |                  |
|                         |                  |                  |





### Graphcore





### Rebellions

| Rebellions Hardware Platforms |   |   |
| ----------------------------- | - | - |
| ATOM                          |   |   |
| ATOM+                         |   |   |
|                               |   |   |





### AMD





### Tenstorrent





### Furiosa






## Storage


|   | Minimum |
| --- | --- |
| Pure Storage | - |
| NetApp | - |
| WEKA.IO | - |
| IBM SpectrumScale | - |
| DELL PowerScale | - |
| CephFS | - |





## Software



| Software         | Minimum                         | Recommended |
| ---------------- | ------------------------------- | ----------- |
| Operating System | <p>Ubuntu 18.04<br>CentOS 8</p> |             |
| Docker Engine    | 19.03                           |             |
| CUDA             |                                 |             |
| PostgreSQL       |                                 |             |
| Redis            |                                 |             |



## Memory

## Storage

## Operating System

| Linux        | MacOS | Windows |
| ------------ | ----- | ------- |
| Ubuntu 20.04 |       |         |
|              |       |         |
|              |       |         |
