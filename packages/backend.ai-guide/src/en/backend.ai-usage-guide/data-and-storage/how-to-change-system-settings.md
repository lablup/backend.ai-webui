---
title: How to change system settings
order: 92
---
# How to Change System Settings

Backend.AI WebUI provides a range of system-level preferences that control interface behavior, language, notifications, and more. You can access these settings from the **User Settings** page under the **General** tab.

## Accessing System Settings

1. Click the person icon at the top right of the header.
2. Select **Preferences** from the dropdown menu.
3. The **User Settings** page opens with the **General** tab active by default.

![](../../images/user_settings_page.png)

You can search for specific settings using the search field at the top. To view only the options you have changed, click **Display Only Changes**. Click the **Reset** button to revert all changes back to their defaults.

## Language

Select your preferred UI language from the **Language** dropdown. Backend.AI supports over 20 languages, including English, Korean, Japanese, Chinese (Simplified and Traditional), French, German, and more.

:::note
Some UI elements may not update their language until you refresh the page. Certain translated items may appear as `__NOT_TRANSLATED__`, indicating that translation for that language is not yet complete.
:::

## Desktop Notifications

Toggle **Desktop Notification** to enable or disable browser-level notifications. When enabled, important messages from the WebUI are displayed in your operating system's notification panel in addition to the in-app notification area.

:::tip
If your browser prompts you to allow notifications, make sure to grant permission. If notifications were previously blocked at the OS or browser level, you may need to update those settings manually.
:::

## Compact Sidebar

Enable **Use Compact Sidebar** to display the left sidebar in a narrower form. The change takes effect after a page refresh. You can also toggle the sidebar width instantly by clicking the collapse icon at the top of the sidebar, or by pressing the `[` shortcut key.

## Automatic Update Check

When enabled, the WebUI displays a notification when a new version is detected. This feature requires Internet access.

## Auto Logout

When **Auto Logout** is turned on, the system automatically logs you out when all Backend.AI WebUI browser tabs are closed. Pages opened for running applications in sessions (such as Jupyter Notebook or web terminal) do not trigger a logout.

## Max Concurrent Uploads

Select the maximum number of files that can be uploaded simultaneously to storage folders. The available options are 2 (default), 3, 4, or 5.

## Shell Environments

The **Shell Environments** section provides access to two script editors:

- **Edit Bootstrap Script**: Write a one-time script that runs immediately after each compute session starts.
- **Edit User Config Script**: Customize shell configuration files (such as `.bashrc`, `.tmux.conf.local`, or `.vimrc`) that are applied inside your compute sessions.

Click the **Config** button next to each option to open the script editor dialog.

:::note
The compute session remains in the `PREPARING` status until the bootstrap script finishes execution. If your script contains long-running tasks, consider running them manually inside the session instead.
:::

## Experimental Features

The **Experimental Features** section allows you to enable features that are not yet officially released. Toggle individual features on or off as needed. Currently available experimental features include **AI Agents**.

For a complete reference of all user settings, see the [User Settings](../../administration/user-settings.md) page.

