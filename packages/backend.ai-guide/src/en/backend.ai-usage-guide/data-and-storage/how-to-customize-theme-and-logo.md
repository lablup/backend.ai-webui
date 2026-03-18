---
title: How to customize theme and logo
order: 93
---
# How to Customize Theme and Logo

Backend.AI WebUI supports both light and dark modes and provides a dedicated **Branding** page where administrators can customize theme colors and logo images. These features allow you to match the WebUI appearance to your organization's visual identity.

## Switching Between Light and Dark Mode

You can toggle between light and dark mode at any time using the theme toggle button in the header.

1. Locate the moon/sun icon button in the top-right area of the header, next to the help and notification buttons.
2. Click the icon to switch modes. A moon icon indicates light mode is active (click to switch to dark). A sun icon indicates dark mode is active (click to switch to light).

![](../../images/theme_mode.png)
<!-- TODO: Capture screenshot showing the theme toggle button in the header -->

The theme mode is stored in your browser's local storage. Backend.AI also supports a **system** mode that automatically follows your operating system's theme preference.

:::tip
The theme toggle takes effect immediately without requiring a page refresh.
:::

## Customizing Theme Colors

Administrators can customize the WebUI color scheme from the **Branding** page. Navigate to the **Branding** page from the sidebar menu.

The **Theme** section allows you to adjust the following colors for both light and dark modes:

- **Primary Color**: The main accent color used for buttons, links, and highlights.
- **Header Background**: The background color of the top header bar.
- **Link Color**: The color used for hyperlinks throughout the interface.
- **Info Color**: The color for informational messages and icons.
- **Error Color**: The color for error states and messages.
- **Success Color**: The color for success states and confirmations.
- **Text Color**: The base text color used across the interface.

Each color setting includes a color picker. Click the color swatch to open the picker and select your desired color.

:::note
Theme color changes apply to both light and dark modes simultaneously. Each mode has its own set of color values.
:::

## Customizing the Logo

The **Logo** section on the **Branding** page lets you upload custom logo images. You can configure separate logos for:

- **Wide Logo Size**: Controls the display size of the logo in the expanded sidebar.
- **Light Mode Logo**: The logo displayed when the WebUI is in light mode.
- **Dark Mode Logo**: The logo displayed when the WebUI is in dark mode.
- **Collapsed Logo Size**: Controls the display size of the logo when the sidebar is collapsed.
- **Light Mode Collapsed Logo**: The compact logo for light mode with a collapsed sidebar.
- **Dark Mode Collapsed Logo**: The compact logo for dark mode with a collapsed sidebar.

## Previewing and Resetting

Click the **Preview** button at the top of the Branding page to open a new browser tab that shows how the customized theme looks in practice. Use the **JSON Config** button to view or edit the theme configuration directly as JSON.

To revert all customizations back to the system defaults, click the **Reset** button.

:::warning
Theme and logo customizations are stored per user. If your organization's administrator has set a system-wide theme via server configuration, your personal customizations will override those defaults for your own session only.
:::

For a complete reference of all user settings, see the [User Settings](../../administration/user-settings.md) page.

