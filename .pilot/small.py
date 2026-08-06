"""PHASE 5 — dissolve BAITag/BAILink; re-point the two survivors."""
import pathlib
import re

VF = pathlib.Path('react/src/components/VFolderNodes.tsx')
s = VF.read_text()

# BAITag -> Astryx Badge directly (pure styling wrapper: dissolved).
s = s.replace("""                <BAITag
                  color={
                    status
                      ? statusTagColor[status as keyof typeof statusTagColor]
                      : undefined
                  }
                >
                  {_.toUpper(status)}
                </BAITag>""",
"""                <Badge
                  variant={
                    status
                      ? statusTagColor[status as keyof typeof statusTagColor]
                      : 'neutral'
                  }
                  label={_.toUpper(status)}
                />""")

# BAILink -> Astryx Link directly.
s = s.replace("""                                    <BAILink
                                      key={sessionId}
                                      style={{ fontWeight: 'normal' }}
                                      onClick={() => {""",
"""                                    <Link
                                      key={sessionId}
                                      href="#"
                                      style={{ fontWeight: 'normal' }}
                                      onClick={(e: React.MouseEvent) => {
                                        e.preventDefault();""")
s = s.replace("""                                    </BAILink>""", """                                    </Link>""")

# BAIText copyable -> the surviving behavioural component.
s = s.replace("value ? <BAIText copyable>{value}</BAIText> : '-',",
              "value ? <BAICopyableText>{value}</BAICopyableText> : '-',")

s = re.sub(r"^import \{ BAILink, BAITag, BAIText \} from '[^']*smallPrimitives';\n",
           '', s, flags=re.M)
lines = s.split('\n')
lines[4:4] = [
    "import { Badge } from '@astryxdesign/core/Badge';",
    "import { Link } from '@astryxdesign/core/Link';",
    "import BAICopyableText from './astryx-bui/BAICopyableText';",
]
VF.write_text('\n'.join(lines))
print('smallPrimitives ->', VF)

PAGE = pathlib.Path('react/src/pages/AdminVFolderNodeListPage.tsx')
s = PAGE.read_text()
s = re.sub(r"^import \{ BAISelectionLabel \} from '[^']*smallPrimitives';\n",
           "import BAISelectionLabel from '../components/astryx-bui/BAISelectionLabel';\n",
           s, flags=re.M)
PAGE.write_text(s)
print('selection label ->', PAGE)

pathlib.Path('react/src/components/astryx-bui/smallPrimitives.tsx').unlink()
print('deleted smallPrimitives.tsx')
