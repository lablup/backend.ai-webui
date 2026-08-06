"""PHASE 5 — dissolve BAIButtonAstryx into Astryx `Button` / `IconButton`."""
import pathlib
import re

PAGE = 'react/src/pages/AdminVFolderNodeListPage.tsx'
MODAL = 'react/src/components/FolderCreateModalV2.tsx'

page = pathlib.Path(PAGE)
s = page.read_text()

s = s.replace("""              <BAIButton
                type="primary"
                icon={<PlusIcon />}
                onClick={() => {
                  toggleCreateModal();
                }}
              >
                {t('data.CreateFolder')}
              </BAIButton>""",
"""              <Button
                variant="primary"
                icon={<PlusIcon />}
                label={t('data.CreateFolder')}
                onClick={() => {
                  toggleCreateModal();
                }}
              />""")

s = s.replace("""                        <BAIButton
                          icon={
                            <BAIRestoreIcon
                              style={{ color: token.colorInfo }}
                            />
                          }
                          onClick={() => {
                            toggleRestoreModal();
                          }}
                        />""",
"""                        <IconButton
                          // Astryx requires a real accessible name; the antd
                          // original had none (only the wrapping tooltip).
                          label={t('data.folders.Restore')}
                          icon={<BAIRestoreIcon />}
                          onClick={() => {
                            toggleRestoreModal();
                          }}
                        />""")

s = re.sub(r"^import BAIButton from '[^']*BAIButtonAstryx';\n", '', s, flags=re.M)
lines = s.split('\n')
lines[4:4] = [
    "import { Button } from '@astryxdesign/core/Button';",
    "import { IconButton } from '@astryxdesign/core/IconButton';",
]
page.write_text('\n'.join(lines))
print('buttons ->', PAGE)

m = pathlib.Path(MODAL)
s = m.read_text()
s = s.replace("""          <BAIButton
            danger
            onClick={() => {
              formRef.current?.resetFields();
            }}
          >
            {t('button.Reset')}
          </BAIButton>""",
"""          <Button
            variant="destructive"
            label={t('button.Reset')}
            onClick={() => {
              formRef.current?.resetFields();
            }}
          />""")
s = s.replace("""            <BAIButton
              onClick={() => {
                onRequestClose();
              }}
            >
              {t('button.Cancel')}
            </BAIButton>""",
"""            <Button
              variant="secondary"
              label={t('button.Cancel')}
              onClick={() => {
                onRequestClose();
              }}
            />""")
s = s.replace("""            <BAIButton
              type="primary"
              data-testid="create-folder-button"
              action={async () => {
                await handleOk();
              }}
            >
              {t('data.Create')}
            </BAIButton>""",
"""            <Button
              variant="primary"
              label={t('data.Create')}
              // `clickAction` IS Astryx-native async-with-loading; BUI's
              // `action` prop was a hand-rolled version of exactly this.
              clickAction={async () => {
                await handleOk();
              }}
              {...({ 'data-testid': 'create-folder-button' } as object)}
            />""")
s = re.sub(r"^import BAIButton from '[^']*BAIButtonAstryx';\n", '', s, flags=re.M)
lines = s.split('\n')
lines[4:4] = ["import { Button } from '@astryxdesign/core/Button';"]
m.write_text('\n'.join(lines))
print('buttons ->', MODAL)
