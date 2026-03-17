---
title: Client SDK for Python
order: 177
---
# Client SDK for Python

Python 3.8 or higher is required.

You can download [its official installer from python.org](https://www.python.org/downloads/), or use a 3rd-party package/version manager such as [homebrew](https://brew.sh/), [miniconda](http://conda.pydata.org/miniconda.html), or [pyenv](https://github.com/pyenv/pyenv). It works on Linux, macOS, and Windows.

We recommend creating a virtual environment for isolated, unobtrusive installation of the client SDK library and tools.

```shell
$ python3 -m venv venv-backend-ai
$ source venv-backend-ai/bin/activate
(venv-backend-ai) $
```

Then install the client library from PyPI.

```shell
(venv-backend-ai) $ pip install -U pip setuptools
(venv-backend-ai) $ pip install backend.ai-client
```

:::info
We recommend installing the client library with the same version as the server. You can check the server version by visiting the server's WebUI, clicking the profile icon on the top-right corner, and then clicking the "About Backend.AI" menu. Then install the client library with the same version as the server.

```shell
(venv-backend-ai) $ pip install backend.ai-client==<server_version>
```
:::

Set your API keypair as environment variables:

```shell
(venv-backend-ai) $ export BACKEND_ACCESS_KEY=AKIA...
(venv-backend-ai) $ export BACKEND_SECRET_KEY=...
```

And then try the first commands:

```shell
(venv-backend-ai) $ backend.ai --help
...
(venv-backend-ai) $ backend.ai ps
...
```

Check out more details with the below table of contents.
