import type { Browser } from "@e2e-dev/web";

/** The user settings the superadmin's admin/user view switch tours set once seen. */
export const TOUR_SETTINGS = [
  "has_opened_tour_back_to_user_view",
  "has_opened_tour_back_to_admin_settings",
];

// The first-use tours cover the header for a superadmin in a fresh context.
export const skipAdminViewSwitchTours = (browser: Browser) =>
  browser.addInitScript((names: string[]) => {
    for (const name of names) {
      window.localStorage.setItem(
        `backendaiwebui.settings.user.${name}`,
        "true",
      );
    }
  }, TOUR_SETTINGS);
