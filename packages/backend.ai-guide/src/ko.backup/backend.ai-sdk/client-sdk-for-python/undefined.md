---
title: 설치
order: 119
---
# 설치

## Linux/macOS

We recommend using [pyenv](https://github.com/pyenv/pyenv) to manage your Python versions and virtual environments to avoid conflicts with other Python applications.

Create a new virtual environment (Python 3.6 or higher) and activate it on your shell. \
Then run the following commands:

```
pip install -U pip setuptools
pip install -U backend.ai-client-py
```

Create a shell script `my-backendai-env.sh` like:

```
export BACKEND_ACCESS_KEY=...
export BACKEND_SECRET_KEY=...
export BACKEND_ENDPOINT=https://my-precious-cluster
export BACKEND_ENDPOINT_TYPE=api
```

`backend.ai` 명령을 사용하기 전에 아래의 셸 스크립트를 실행하세요.

:::info
**Note**

The console-server users should set `BACKEND_ENDPOINT_TYPE` to `session`. For details, check out [the client configuration document](https://docs.backend.ai/en/latest/client/gsg/config.html).
:::

## Windows

GUI 앱으로 Python 환경을 관리하려면 [Anaconda Navigator](https://www.anaconda.com/download/)를 사용하는 것을 권장합니다.

새 환경(Python 3.6 이상)을 만들고 터미널(명령 프롬프트)을 실행합니다. 이후아래의 명령을 실행합니다.

```
python -m pip install -U pip setuptools
python -m pip install -U backend.ai-client-py
```

Create a batch file `my-backendai-env.bat` like:

```
chcp 65001
set PYTHONIOENCODING=UTF-8
set BACKEND_ACCESS_KEY=...
set BACKEND_SECRET_KEY=...
set BACKEND_ENDPOINT=https://my-precious-cluster
set BACKEND_ENDPOINT_TYPE=api
```

Run this batch file before using `backend.ai` command.

Note that this batch file switches your command prompt to use the UTF-8 codepage for correct display of special characters in the console logs.

## Verification

`backend.ai ps` 명령을 실행하고 “실행 중인 컴퓨팅 세션이 없습니다” 또는 이와 유사한 내용이 표시되는지 확인합니다.

“ACCESS\_KEY”에 대한 오류 메시지가 표시되면 배치/셸 스크립트에 올바른 환경 변수 이름이 있는지 확인하십시오.

네트워크 연결 오류 메시지가 표시되면 엔드포인트 서버가 올바르게 구성되어 있고 액세스할 수 있는지 확인하시기 바랍니다.
