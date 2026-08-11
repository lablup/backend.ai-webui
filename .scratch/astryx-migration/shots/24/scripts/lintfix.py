def rep(p, old, new):
    s = open(p).read()
    assert old in s, (p, old[:100])
    open(p, 'w').write(s.replace(old, new, 1))


rep('react/src/components/MainLayout/WebUISider.tsx',
    "import { useBAIBreakpoint } from '../../theme-shim';",
    "import { theme, useBAIBreakpoint } from '../../theme-shim';")
rep('react/src/components/MainLayout/WebUISider.tsx',
    "import { useTheme } from '@astryxdesign/core/theme';\nimport { theme } from '../../theme-shim';\n",
    "import { useTheme } from '@astryxdesign/core/theme';\n")

rep('react/src/components/UserDropdownMenu.tsx',
    "import { theme } from '../theme-shim';\n", "")
rep('react/src/components/UserDropdownMenu.tsx',
    "import { useBAIBreakpoint } from '../theme-shim';",
    "import { useBAIBreakpoint } from '../theme-shim';")
rep('react/src/components/UserDropdownMenu.tsx',
    "  const { token } = theme.useToken();\n", "")

rep('react/src/components/SignupModal.tsx',
    "import { theme } from '../theme-shim';\n", "")
rep('react/src/components/SignupModal.tsx',
    "  const { token } = theme.useToken();\n", "")

rep('react/src/hooks/useWebUIMenuItems.tsx',
    "import { ReactNode } from 'react';\n", "")
rep('react/src/hooks/useWebUIMenuItems.tsx',
    "  const { hideGroupName = false } = props || {};",
    "  // `hideGroupName` is now consumed by the RENDERER (`BAIMenu` passes it\n"
    "  // to `SideNavSection.isHeaderHidden`); the grouped data always carries\n"
    "  // its title string. Kept on the props type for call-site compatibility.\n"
    "  void props?.hideGroupName;")
print('ok')
