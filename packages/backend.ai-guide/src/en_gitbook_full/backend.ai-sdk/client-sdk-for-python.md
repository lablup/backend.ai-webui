---
title: Client SDK for Python
order: 177
---
# Client SDK for Python

Python 3.8 or higher is required.

You can download [its official installer from python.org](https://www.python.org/downloads/), or use a 3rd-party package/version manager such as [homebrew](http://brew.sh/index_ko.html), [miniconda](http://conda.pydata.org/miniconda.html), or [pyenv](https://github.com/pyenv/pyenv). It works on Linux, macOS, and Windows.

We recommend to create a virtual environment for isolated, unobtrusive installation of the client SDK library and tools.

```
$ python3 -m venv venv-backend-ai
$ source venv-backend-ai/bin/activate
(venv-backend-ai) $
```

Then install the client library from PyPI.

```
(venv-backend-ai) $ pip install -U pip setuptools
(venv-backend-ai) $ pip install backend.ai-client
```

:::info
**Note**

We recommend to install the client library with the same version as the server. You can check the server version by visiting the server’s webui, click the profile icon on the top-right corner, and then click the “About Backend.AI” menu. Then install the client library with the same version as the server.

```
(venv-backend-ai) $ pip install backend.ai-client==<server_version>
```
:::

Set your API keypair as environment variables:

```
(venv-backend-ai) $ export BACKEND_ACCESS_KEY=AKIA...
(venv-backend-ai) $ export BACKEND_SECRET_KEY=...
```

And then try the first commands:

```
(venv-backend-ai) $ backend.ai --help
...
(venv-backend-ai) $ backend.ai ps
...
```

Check out more details with the below table of contents.
