#!/bin/bash
# Ticket 22 — Settings-area antd import evidence.
#   ./p15-area.sh HEAD   -> before (from git, to-astryx tip)
#   ./p15-area.sh WORK   -> after  (working tree)
cd "$(dirname "$0")/../../../.." || exit 1
FILES="pages/UserSettingsPage pages/ConfigurationsPage pages/MaintenancePage pages/BrandingPage components/SettingList components/SettingItem components/Information components/DescriptionLabel components/ConfigurationsSettingList components/MaintenanceSettingList components/BrandingSettingList components/OverlayNetworkSettingModal components/SchedulerSettingModal components/AnnouncementEditModal components/BrandingSettingItems/FontFamilySettingItem components/BrandingSettingItems/LogoSizeSettingItem components/BrandingSettingItems/LogoPreviewer components/BrandingSettingItems/ThemeColorPicker components/BrandingSettingItems/ThemeJsonConfigModal components/ThemeAccentColorPicker components/LightDarkColorPicker components/ErrorLogList components/LoginHistory components/LoginSession components/MyKeypairInfoModalLegacy components/MyKeypairManagementModal components/SSHKeypairManagementModal components/SSHKeypairGenerationModal components/SSHKeypairManualFormModal components/ShellScriptEditModal"
for f in $FILES; do
  echo "== react/src/$f.tsx"
  if [ "$1" = "HEAD" ]; then
    git show "to-astryx:react/src/$f.tsx" 2>/dev/null |
      grep -nE "from '(antd|antd-style|antd/|@ant-design)" ||
      echo "  (no antd-family import)"
  else
    grep -nE "from '(antd|antd-style|antd/|@ant-design)" "react/src/$f.tsx" ||
      echo "  (no antd-family import)"
  fi
done
