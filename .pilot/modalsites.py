"""PHASE 5 — rewrite the three modal call sites to the Astryx-native
`BAIModalAstryx` API.

Boundary decision: `FolderCreateModalV2`, `DeleteVFolderModal` and
`RestoreVFolderModal` are APP components with consumers OUTSIDE the pilot graph
(9 files import FolderCreateModalV2 alone). Their own public props therefore
keep the repo's existing `open` / `onRequestClose` contract; only their INTERNAL
use of BAIModalAstryx becomes Astryx-native. See the Phase 5 write-up.
"""
import pathlib
import re

# --- DeleteVFolderModal -----------------------------------------------------
f = pathlib.Path('react/src/components/DeleteVFolderModal.tsx')
s = f.read_text()
s = s.replace("interface DeleteVFolderModalProps extends BAIModalProps {",
              "interface DeleteVFolderModalProps\n"
              "  extends Omit<BAIModalProps, 'isOpen' | 'onOpenChange'> {\n"
              "  /** App-level contract, kept: consumers outside the pilot graph use it. */\n"
              "  open?: boolean;")
s = s.replace("""    <BAIModal
      title={t('data.folders.MoveToTrash')}""",
"""    <BAIModal
      isOpen={baiModalProps.open}
      onOpenChange={(next) => {
        if (!next) onRequestClose(false);
      }}
      title={t('data.folders.MoveToTrash')}""")
s = s.replace("      okText={t('data.folders.Delete')}\n", "      actionLabel={t('data.folders.Delete')}\n")
s = s.replace("      okButtonProps={{ danger: true }}\n", "      actionVariant=\"destructive\"\n")
s = s.replace("      onOk={() => {", "      onAction={() => {")
s = re.sub(r'\n\s*onCancel=\{\(\) => onRequestClose\(false\)\}', '', s)
f.write_text(s)
print('delete modal ->', f)

# --- RestoreVFolderModal ----------------------------------------------------
f = pathlib.Path('react/src/components/RestoreVFolderModal.tsx')
s = f.read_text()
s = s.replace("interface RestoreVFolderModalProps extends BAIModalProps {",
              "interface RestoreVFolderModalProps\n"
              "  extends Omit<BAIModalProps, 'isOpen' | 'onOpenChange'> {\n"
              "  /** App-level contract, kept: consumers outside the pilot graph use it. */\n"
              "  open?: boolean;")
s = s.replace("""    <BAIModal
      title={t('data.folders.Restore')}""",
"""    <BAIModal
      isOpen={baiModalProps.open}
      onOpenChange={(next) => {
        if (!next) onRequestClose?.(false);
      }}
      title={t('data.folders.Restore')}""")
s = s.replace("      okText={t('data.folders.Restore')}\n", "      actionLabel={t('data.folders.Restore')}\n")
s = s.replace("      onOk={() => {", "      onAction={() => {")
s = re.sub(r'\n\s*onCancel=\{\(\) => onRequestClose\?\.\(false\)\}', '', s)
s = re.sub(r'\n\s*centered\n', '\n', s)
f.write_text(s)
print('restore modal ->', f)

# --- FolderCreateModalV2 ----------------------------------------------------
f = pathlib.Path('react/src/components/FolderCreateModalV2.tsx')
s = f.read_text()
s = s.replace("export interface FolderCreateModalProps extends BAIModalProps {",
              "export interface FolderCreateModalProps\n"
              "  extends Omit<BAIModalProps, 'isOpen' | 'onOpenChange'> {\n"
              "  /** App-level contract, kept: 9 consumers outside the pilot graph. */\n"
              "  open?: boolean;")
s = s.replace("""    <BAIModal
      loading={isFetchingAllowedTypes}""",
"""    <BAIModal
      isOpen={modalProps.open}
      onOpenChange={(next) => {
        if (!next) onRequestClose();
      }}
      isLoading={isFetchingAllowedTypes}""")
s = re.sub(r'\n\s*onCancel=\{\(\) => \{\n\s*onRequestClose\(\);\n\s*\}\}', '', s)
s = re.sub(r'\n\s*destroyOnHidden', '', s)
s = s.replace("""      {...modalProps}
      afterOpenChange={(open) => {
        if (open) {""",
"""      {...modalProps}
      onAfterOpen={() => {
        {""")
f.write_text(s)
print('create modal ->', f)
