---
title: Optional settings when creating a session
order: 67
---
# Optional settings when creating a session

## How to add environment variable before creating a session

To give more convenient workspace for users, Backend.AI supports environment variable setting in session launching. In this feature, users can add any envs such as `PATH` by filling out variable name and value in environment configuration dialog.

To add environment variable, simply click '+ Add environment variables' button of the Variable. Also, you can remove the variable by clicking '-' button of the row that you want to get rid of.

![Env Configuration Button](https://webui.docs.backend.ai/en/latest/_images/launch_session_env.png)

You can write down variable name and value in the same line of the input fields.

## How to add preopen ports before creating a session

Backend.AI supports preopen ports setting at container startup. When using this feature, there is no need to build separate images when you want to expose the serving port.

To add preopen ports, simply enter multiple values separated by either a comma (,) or a space.

![Preopen Ports Configuration](https://webui.docs.backend.ai/en/latest/_images/preopen-ports-config.png)

In the forth page of session creation page, users can add, update and delete written preopen ports. To see more detail information, please click 'Help (?)'' button.

Users can put port numbers in between 1024 \~ 65535, to the input fields. Then, press 'Enter'. Users can specify multiple ports, separated by commas (,). Users can check the configured preopen ports in the session app launcher.

[![../\_images/session\_app\_launcher.png](https://webui.docs.backend.ai/en/latest/_images/session_app_launcher.png)](https://webui.docs.backend.ai/en/latest/_images/session_app_launcher.png)

:::info
Note

The preopen ports are **the internal ports within the container**. Therefore, unlike other apps, when users click the preopen ports in the session app launcher, a blank page will appear. Please bind a server to the respective port before use.
:::
