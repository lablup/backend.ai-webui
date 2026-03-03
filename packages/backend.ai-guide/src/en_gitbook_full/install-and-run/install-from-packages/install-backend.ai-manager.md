---
title: Install Backend.AI Manager
order: 38
---
# Install Backend.AI Manager

:::warning
**Before Installing the manager**

Refer to Prepare required Python versions and virtual environments section to setup Python and virtual environment for the service.
:::

Install the latest version of Backend.AI Manager for the current Python version:

```python
$ cd "${HOME}/manager"
$ # Activate a virtual environment if needed.
$ pip install -U backend.ai-manager
```

To install a specific version:

```python
$ pip install -U backend.ai-manager==${BACKEND_PKG_VERSION}
```

An RPC keypair must be generated during the initial setup. This keypair is required for authentication and encryption in manager-to-agent RPC connections. Even if encryption of the RPC channel is not intended, a keypair is still mandatory.

```python
$ cd "${HOME}/manager"
$ mkdir fixtures
$ backend.ai mgr generate-rpc-keypair fixtures 'manager'
2024-04-23 12:06:31.913 INFO ai.backend.manager.cli [21024] Generating a RPC keypair...
Public Key: >B-mF}N{WygT92d&=Kceix$7cWzg!dT])rIc39=S (stored at fixtures/manager.key)
Secret Key: g.4&?*b&0#oRRC9?DMO[SUXikjKZ7nYj!bzFJN92 (stored at fixtures/manager.key_secret)
```

An RPC keypair for the manager has been generated. The public key is stored in `fixtures/manager.key` and the secret key is stored in `fixtures/manager.key_secret`.

## Local configuration

Backend.AI Manager uses a TOML file (`manager.toml`) to configure local service. Refer to the [manager.toml sample file](https://github.com/lablup/backend.ai/blob/main/configs/manager/sample.toml) for a detailed description of each section and item. A configuration example would be:

```python
[etcd]
namespace = "local"
addr = { host = "bai-m1", port = 8120 }
user = ""
password = ""

[db]
type = "postgresql"
addr = { host = "bai-m1", port = 8100 }
name = "backend"
user = "postgres"
password = "develove"

[manager]
num-proc = 2
service-addr = { host = "0.0.0.0", port = 8081 }
# user = "bai"
# group = "bai"
ssl-enabled = false

heartbeat-timeout = 40.0
rpc-auth-manager-keypair = "fixtures/manager.key_secret"
pid-file = "manager.pid"
disabled-plugins = []
hide-agents = true
# event-loop = "asyncio"
# importer-image = "lablup/importer:manylinux2010"
distributed-lock = "filelock"

[docker-registry]
ssl-verify = false

[logging]
level = "INFO"
drivers = ["console", "file"]

[logging.pkg-ns]
"" = "WARNING"
"aiotools" = "INFO"
"aiopg" = "WARNING"
"aiohttp" = "INFO"
"ai.backend" = "INFO"
"alembic" = "INFO"

[logging.console]
colored = true
format = "verbose"

[logging.file]
path = "./logs"
filename = "manager.log"
backup-count = 10
rotation-size = "10M"

[debug]
enabled = false
enhanced-aiomonitor-task-info = true
```

Save the contents to `${HOME}/.config/backend.ai/manager.toml`. Backend.AI will automatically recognize the location. Adjust each field to conform to the system.

## Global configuration

Etcd (cluster) stores globally shared configurations for all nodes. Some of them should be populated prior to starting the service.

:::info
**Note**

Creating a backup of the current etcd configuration before modifying its values is recommended.&#x20;
:::

This can be done by executing the following command:

```python
$ backend.ai mgr etcd get --prefix "" > ./etcd-config-backup.json
```

To restore the backup:

```python
$ backend.ai mgr etcd delete --prefix ""
$ backend.ai mgr etcd put-json "" ./etcd-config-backup.json
```

The commands below should be executed at `${HOME}/manager` directory.

To list a specific key from Etcd, for example, `config` key:

```python
$ backend.ai mgr etcd get --prefix config
```

Now, configure Redis access information. This should be accessible from all nodes.

```python
$ backend.ai mgr etcd put config/redis/addr "bai-m1:8110"
$ backend.ai mgr etcd put config/redis/password "develove"
```

Configure the container registry. The default setting uses Lablup’s open registry (`cr.backend.ai`). If required, a custom registry can be configured with a username and password. This configuration can also be managed through the graphic user interface (GUI).

```python
$ backend.ai mgr etcd put config/docker/image/auto_pull "tag"
$ backend.ai mgr etcd put config/docker/registry/cr.backend.ai "https://cr.backend.ai"
$ backend.ai mgr etcd put config/docker/registry/cr.backend.ai/type "harbor2"
$ backend.ai mgr etcd put config/docker/registry/cr.backend.ai/project "stable"
$ # backend.ai mgr etcd put config/docker/registry/cr.backend.ai/username "bai"
$ # backend.ai mgr etcd put config/docker/registry/cr.backend.ai/password "secure-password"
```

Populate the Storage Proxy configuration to the Etcd:

```python
$ # Allow project (group) folders.
$ backend.ai mgr etcd put volumes/_types/group ""
$ # Allow user folders.
$ backend.ai mgr etcd put volumes/_types/user ""
$ # Default volume host. The name of the volume proxy here is "bai-m1" and volume name is "local".
$ backend.ai mgr etcd put volumes/default_host "bai-m1:local"
$ # Set the "bai-m1" proxy information.
$ # User (browser) facing API endpoint of Storage Proxy.
$ # Cannot use host alias here. It should be user-accessible URL.
$ backend.ai mgr etcd put volumes/proxies/bai-m1/client_api "http://127.0.0.1:6021"
$ # Manager facing internal API endpoint of Storage Proxy.
$ backend.ai mgr etcd put volumes/proxies/bai-m1/manager_api "http://bai-m1:6022"
$ # Random secret string which is used by Manager to communicate with Storage Proxy.
$ backend.ai mgr etcd put volumes/proxies/bai-m1/secret "secure-token-to-authenticate-manager-request"
$ # Option to disable SSL verification for the Storage Proxy.
$ backend.ai mgr etcd put volumes/proxies/bai-m1/ssl_verify "false"
```

Verify if the configuration is properly populated:

```python
$ backend.ai mgr etcd get --prefix volumes
```

Update the secret to a unique, randomly generated string to ensure secure communication between the Manager and the Storage Proxy. The latest set of parameters can be found in [sample.etcd.volumes.json](https://github.com/lablup/backend.ai/blob/main/configs/manager/sample.etcd.volumes.json).

To enable user access to the volumes defined by the Storage Proxy, update the `allowed_vfolder_hosts` column in the `domains` table to include the storage volume reference (e.g., `bai-m1:local`). This can be achieved by executing an SQL statement directly within the PostgreSQL container. Use the following command to access the container and run the query:

```python
$ vfolder_host_val='{"bai-m1:local": ["create-vfolder", "modify-vfolder", "delete-vfolder", "mount-in-session", "upload-file", "download-file", "invite-others", "set-user-specific-permission"]}'
$ docker compose -f "$HOME/halfstack/postgres-cluster-default" exec -it backendai-half-db psql -U postgres -d backend \
      -c "UPDATE domains SET allowed_vfolder_hosts = '${vfolder_host_val}' WHERE name = 'default';"
```

## Populate the database with initial fixtures

Prepare the `alembic.ini` file under `${HOME}/manager` to manage the database schema. Copy the sample file [halfstack.alembic.ini](https://github.com/lablup/backend.ai/blob/main/configs/manager/halfstack.alembic.ini) and save it as `${HOME}/manager/alembic.ini`. Update the `sqlalchemy.url` field if the database connection details differ from the default configuration. For example, replace `localhost` with `bai-m1` if necessary.

Populate the database schema and initial fixtures by copying the example JSON files (`example-keypairs.json` and `example-resource-presets.json`) as `keypairs.json` and `resource-presets.json`, respectively, and saving them under `${HOME}/manager/`. Customize these files to include unique keypairs and passwords for your initial superadmin and sample user accounts to ensure security.

```python
$ backend.ai mgr schema oneshot
$ backend.ai mgr fixture populate ./users.json
$ backend.ai mgr fixture populate ./keypairs.json
$ backend.ai mgr fixture populate ./resource-presets.json
$ backend.ai mgr fixture populate ./set-user-main-access-keys.json
```

## Sync the information of container registry

The image catalog and metadata must be scanned from the container registry to the Manager. This step is necessary to display the list of compute environments in the user web interface (Backend.AI WebUI). Use the following command to synchronize the information with Lablup’s public container registry:

```python
$ backend.ai mgr image rescan cr.backend.ai
```

## Run Backend.AI Manager service

The service can be started by running the following command:

```python
$ cd "${HOME}/manager"
$ python -m ai.backend.manager.server
```

Verify whether the service is running. Manager API port can be can be configured in the `manager.toml` file. Default Manager API port is set to `8081`:

```python
$ curl bai-m1:8081
{"version": "v6.20220615", "manager": "22.09.6"}
```

Press `Ctrl-C` to stop the service.

## Register systemd service

The service can be registered as a systemd daemon. It is recommended to automatically run the service after rebooting the host machine, although this is entirely optional.

Create a runner script at `${HOME}/bin/run-manager.sh`:

```python
#! /bin/bash
set -e

if [ -z "$HOME" ]; then
   export HOME="/home/bai"
fi

# -- If you have installed using static python --
source .venv/bin/activate

# -- If you have installed using pyenv --
if [ -z "$PYENV_ROOT" ]; then
   export PYENV_ROOT="$HOME/.pyenv"
   export PATH="$PYENV_ROOT/bin:$PATH"
fi
eval "$(pyenv init --path)"
eval "$(pyenv virtualenv-init -)"

if [ "$#" -eq 0 ]; then
   exec python -m ai.backend.manager.server
else
   exec "$@"
fi
```

Make the script executable:

```python
$ chmod +x "${HOME}/bin/run-manager.sh"
```

Create a systemd service file at `/etc/systemd/system/backendai-manager.service`:

```python
[Unit]
Description= Backend.AI Manager
Requires=network.target
After=network.target remote-fs.target

[Service]
Type=simple
ExecStart=/home/bai/bin/run-manager.sh
PIDFile=/home/bai/manager/manager.pid
User=1100
Group=1100
WorkingDirectory=/home/bai/manager
TimeoutStopSec=5
KillMode=process
KillSignal=SIGTERM
PrivateTmp=false
Restart=on-failure
RestartSec=10
LimitNOFILE=5242880
LimitNPROC=131072

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```python
$ sudo systemctl daemon-reload
$ sudo systemctl enable --now backendai-manager

$ # To check the service status
$ sudo systemctl status backendai-manager
$ # To restart the service
$ sudo systemctl restart backendai-manager
$ # To stop the service
$ sudo systemctl stop backendai-manager
$ # To check the service log and follow
$ sudo journalctl --output cat -u backendai-manager -f
```
