import { ThemeConfig } from "antd";
import { useEffect, useState } from "react";

let _customTheme: ThemeConfig;

export const loadCustomThemeConfig = () => {
  fetch("resources/theme.json")
    .then((response) => response.json())
    .then((theme) => {
      _customTheme = theme;
      document.dispatchEvent(new CustomEvent("custom-theme-loaded"));
    });
};

export const useCustomThemeConfig = () => {
  const [customThemeConfig, setCustomThemeConfig] = useState(_customTheme);
  useEffect(() => {
    if (!customThemeConfig) {
      const handler = () => {
        setCustomThemeConfig(_customTheme);
      };
      document.addEventListener("custom-theme-loaded", handler);

      return () => {
        document.removeEventListener("custom-theme-loaded", handler);
      };
    }
  }, []);

  return customThemeConfig;
};
