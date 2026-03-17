---
title: Branding
order: 159
---
# Branding

The Branding page enables superadmins to customize the visual appearance of the Backend.AI WebUI. You can adjust theme colors, upload custom logos, and fine-tune the look and feel of the interface to match your organization's identity. Changes made on this page apply globally to all users of the WebUI.

You can access this page by selecting **Branding** from the administration section in the sidebar menu.

![](../images/branding_page.png)
<!-- TODO: Capture screenshot of the Branding page overview -->

:::note
The Branding page is available only to users with the superadmin role.
:::

## Theme Color Configuration

The Branding page provides color pickers for customizing the key color elements of the WebUI. You can configure colors separately for light mode and dark mode, ensuring a consistent visual experience across both themes.

![](../images/branding_color_pickers.png)
<!-- TODO: Capture screenshot of the color picker section -->

The following color settings are available:

- **Primary Color**: The main accent color used for buttons, links, active states, and other interactive elements throughout the interface.
- **Secondary Color**: A complementary color used for secondary UI elements such as badges, tags, and highlighted areas.
- **Sidebar Color**: The background color of the navigation sidebar.
- **Header Color**: The background color of the top header bar.

### Configuring Colors

To change a theme color:

1. Locate the color setting you want to modify (e.g., Primary Color).
2. Click the color swatch to open the color picker.
3. Select your desired color using the picker interface, or enter a hex color code directly.
4. The preview updates in real time to show the effect of your change.
5. Repeat for additional color settings as needed.
6. Click **Save** to apply all color changes.

:::warning
Choose colors with sufficient contrast to maintain readability. Poor contrast between text and background colors can make the interface difficult to use, especially for users with visual impairments.
:::

### Light and Dark Mode

The Branding page allows you to configure separate color palettes for light mode and dark mode. Select the mode you want to configure using the mode toggle, then adjust the colors for that mode independently.

![](../images/branding_light_dark_mode.png)
<!-- TODO: Capture screenshot of the light/dark mode toggle -->

:::tip
Test your color choices in both light and dark modes before saving. Some colors that look good in one mode may not work well in the other.
:::

## Logo Configuration

You can replace the default Backend.AI logo with your organization's logo. The Branding page supports multiple logo variants to accommodate different UI contexts.

![](../images/branding_logo_settings.png)
<!-- TODO: Capture screenshot of the logo upload section -->

### Logo Variants

The following logo variants are available:

- **Light Logo**: Displayed when the WebUI is in light mode. Typically a dark-colored logo that contrasts against a light background.
- **Dark Logo**: Displayed when the WebUI is in dark mode. Typically a light-colored logo that contrasts against a dark background.
- **Collapsed Logo**: A compact version of the logo displayed when the sidebar is collapsed. This should be a square icon or abbreviated mark that remains recognizable at a small size.

### Uploading a Logo

To upload a custom logo:

1. Locate the logo variant you want to replace (Light, Dark, or Collapsed).
2. Click the upload area or the **Upload** button.
3. Select your logo image file from your local filesystem.
4. The preview updates to show how the logo will appear in the interface.
5. Optionally adjust the **Logo Size** setting to scale the logo appropriately.
6. Click **Save** to apply the logo change.

:::note
For best results, use PNG or SVG format logos with transparent backgrounds. Recommended dimensions depend on the variant: full logos should be approximately 200 pixels wide, and collapsed logos should be approximately 40 by 40 pixels.
:::

### Logo Size

You can adjust the display size of each logo variant using the size controls. This ensures that your logo fits well within the sidebar and header areas regardless of its original dimensions.

## Advanced Theme Customization

For administrators who need fine-grained control over the theme, the Branding page includes a JSON theme editor. This editor allows you to directly modify the theme configuration object, providing access to additional styling properties beyond the standard color pickers.

![](../images/branding_json_editor.png)
<!-- TODO: Capture screenshot of the JSON theme editor -->

To use the JSON theme editor:

1. Click the **Advanced** or **JSON Editor** section to expand it.
2. Review the current theme configuration in JSON format.
3. Modify the JSON properties as needed.
4. Click **Save** to apply the changes.

:::warning
Editing the theme JSON directly requires familiarity with the theme configuration schema. Invalid JSON or unrecognized properties may cause the theme to revert to defaults. Always verify your changes in the preview before saving.
:::

## Reset to Defaults

If you want to revert all branding customizations to the original Backend.AI defaults:

1. Click the **Reset** button on the Branding page.
2. Confirm the reset in the confirmation dialog.
3. All colors, logos, and theme settings return to their default values.

:::caution
Resetting the theme discards all custom branding changes, including uploaded logos and color configurations. This action cannot be undone. Consider saving your current theme JSON configuration before resetting.
:::
