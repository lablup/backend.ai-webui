# AdminNotificationPage

- Route: `/admin/integrations` (menu "Integrations", key `integrations`; its tabs are the notification channels and rules), superadmin-only (`access: 'superadmin'`).
- Two tabs: Rules (`?tab=rules`, the default) decide which event is sent to which channel with a Jinja2 message template; Channels (`?tab=channels`) are the webhook or email destinations. Both use the manager's `adminNotification*` / `updateNotification*` / `purgeNotification*` / `adminValidateNotification*` GraphQL fields.
- A rule's event type and channel cannot change after creation (`UpdateNotificationRuleInput` has no such fields). Template variables come from `notificationRuleTypeSchema` (`helper/notificationRuleTemplate.ts`); "Send Test Notification" calls `adminValidateNotificationRule`, which renders the template AND delivers it through the rule's channel (it is not a dry-run preview), so the modal says so.
- The manager does not return a channel's saved spec (the `NotificationChannelSpec` interface has no registered implementors, so only `channelType` comes back). Editing a channel therefore replaces its connection settings as a whole, behind the "Replace connection settings" switch; `helper/notificationChannelSpec.ts` builds the one-of spec input.
- Project-agnostic admin page (ADR 0001): it never reads the ambient current project.
