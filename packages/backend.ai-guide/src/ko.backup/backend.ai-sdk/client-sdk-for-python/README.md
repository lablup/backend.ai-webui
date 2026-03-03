---
title: Client SDK for Python
order: 118
---
# Client SDK for Python

파이썬 3.8 버전 이상이 필요합니다.

사용자는 [python.org에서 공식 설치 프로그램을 다운로드](https://www.python.org/downloads/)하거나 [homebrew](http://brew.sh/index_ko.html), [miniconda](http://conda.pydata.org/miniconda.html) 또는 [pyenv](https://github.com/pyenv/pyenv)와 같은 타사 패키지/버전 관리자를 사용할 수 있습니다. Linux, macOS 및 Windows에서 작동합니다.

아래의 커맨드를 이용하여 클라이언트 SDK 라이브러리 및 도구를 격리하여 설치할 수 있는 가상 환경을 만드는 것을 권장합니다.

```
$ python3 -m venv venv-backend-ai
$ source venv-backend-ai/bin/activate
(venv-backend-ai) $
```

PyPI에서 클라이언트 라이브러리를 설치합니다.

```
(venv-backend-ai) $ pip install -U pip setuptools
(venv-backend-ai) $ pip install backend.ai-client
```

:::info
**Note**

클라이언트 라이브러리는 서버와 동일한 버전으로 설치하는 것을 권장합니다. 서버 버전은 서버의 웹UI를 방문하여 오른쪽 상단의 프로필 아이콘을 클릭한 다음 'Backend.AI에 대하여' 메뉴를 클릭하여 확인할 수 있습니다. 표시된 서버 버전과 동일한 버전으로 클라이언트 라이브러리를 설치합니다.

```
(venv-backend-ai) $ pip install backend.ai-client==<server_version>
```
:::

API 키페어를 환경 변수로 설정합니다.

```
(venv-backend-ai) $ export BACKEND_ACCESS_KEY=AKIA...
(venv-backend-ai) $ export BACKEND_SECRET_KEY=...
```

이제 첫 번째 명령을 시도할 수 있습니다.

```
(venv-backend-ai) $ backend.ai --help
...
(venv-backend-ai) $ backend.ai ps
...
```

아래 목차를 통해 자세한 내용을 확인하세요.
