---
title: How to view logs & errors
order: 94
---
# How to View Logs and Errors

Backend.AI WebUI records client-side logs of all API requests and responses. The **Logs** tab on the **User Settings** page provides a detailed view of these records, which is useful for diagnosing errors and understanding system behavior.

## Accessing the Logs Tab

You can access the Logs tab in two ways:

- **From the user dropdown**: Click the person icon at the top right of the header, then select **Logs / Errors**. This navigates directly to the Logs tab.
- **From the User Settings page**: Click the person icon, select **Preferences**, then click the **Logs** tab at the top of the page.

![](../../images/user_log.png)

## Understanding the Log Table

The log table displays up to 3,000 log entries and includes the following columns:

| Column | Description |
|--------|-------------|
| **Timestamp** | The date and time when the request or response was recorded |
| **Status** | The HTTP status code and status text of the response |
| **Error Title** | The title or summary of the error, if applicable |
| **Error Message** | A detailed description of the error |
| **Error Type** | The category or type of the error |
| **Method** | The HTTP method used (GET, POST, etc.) |
| **Request URL** | The API endpoint that was called |
| **Parameters** | The request parameters sent to the server |

Error entries are displayed in red text for easy identification.

## Searching and Filtering Logs

Use the search field at the top of the log table to filter entries by any keyword. The search matches across all visible columns.

To display only error entries, check the **Show Only Error** checkbox. This hides successful responses and shows only failed requests.

## Refreshing and Clearing Logs

- Click the **Refresh** button to reload the log data from local storage.
- Click the **Clear Logs** button to permanently delete all recorded logs.

:::warning
Clearing logs is irreversible. All recorded log entries will be permanently removed from your browser's local storage.
:::

:::note
Logs are collected from API requests made across all open Backend.AI WebUI tabs. If you only have the Logs page open, clicking **Refresh** may not show new entries because the Logs page itself does not generate API requests. Open another page (such as Sessions or Data) and then return to refresh for updated logs.
:::

## Customizing Visible Columns

Click the gear icon at the bottom right of the log table to open the column settings dialog. From this dialog, you can select which columns to show or hide in the table.

![](../../images/logs_table_setting.png)

For a complete reference of all user settings, see the [User Settings](../../administration/user-settings.md) page.

