# AdminNotificationPage

- Route: `/admin/integrations` (menu "Integrations", key `integrations`; its tabs are the notification channels and rules), superadmin-only (`access: 'superadmin'`).
- Manages the manager's outbound notification channels (webhook or email) through the `adminNotificationChannels` / `adminCreateNotificationChannel` / `updateNotificationChannel` / `purgeNotificationChannel` / `adminValidateNotificationChannel` GraphQL fields.
- The manager does not return a channel's saved spec (the `NotificationChannelSpec` interface has no registered implementors, so only `channelType` comes back). Editing a channel therefore replaces its connection settings as a whole, behind the "Replace connection settings" switch; `helper/notificationChannelSpec.ts` builds the one-of spec input.
- Project-agnostic admin page (ADR 0001): it never reads the ambient current project.
