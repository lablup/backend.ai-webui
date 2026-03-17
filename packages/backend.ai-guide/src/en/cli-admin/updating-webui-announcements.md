---
title: Updating WebUI announcements
order: 112
---
# Updating WebUI Announcements

Backend.AI allows administrators to create announcements that are displayed to all users in the WebUI. This feature is useful for communicating maintenance schedules, policy changes, new feature releases, or other important notices.

## Listing Announcements

To view all existing announcements:

```shell
$ backend.ai admin announcement list
```

This displays each announcement with its ID, content, creation date, and active status.

## Creating an Announcement

To create a new announcement that appears in the WebUI:

```shell
$ backend.ai admin announcement create "Scheduled maintenance on Saturday 10PM-12AM UTC."
```

:::note
Newly created announcements are immediately visible to all WebUI users upon their next page load or login.
:::

## Updating an Announcement

To update the content of an existing announcement, specify the announcement ID:

```shell
$ backend.ai admin announcement update ANNOUNCEMENT_ID --content "Updated: Maintenance rescheduled to Sunday 10PM-12AM UTC."
```

You can obtain the announcement ID from the `announcement list` command.

## Deleting an Announcement

To remove an announcement that is no longer needed:

```shell
$ backend.ai admin announcement delete ANNOUNCEMENT_ID
```

:::warning
Deleted announcements are permanently removed and cannot be recovered. Verify the announcement ID before executing the delete command.
:::

## Best Practices

- Keep announcement messages concise and actionable.
- Include specific dates and times (with time zones) for scheduled events.
- Remove outdated announcements promptly to avoid user confusion.
- Use announcements for platform-wide notices; for user-specific communications, consider other channels.
