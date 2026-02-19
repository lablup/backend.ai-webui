# I18n Terminology Unification - Changes Summary

## Overview

This document summarizes all terminology changes made to unify inconsistent terms across Backend.AI WebUI's i18n translation files.

## Files Changed

- **Main WebUI**: 21 language files in `/resources/i18n/`
- **Backend.AI UI Package**: 21 language files in `/packages/backend.ai-ui/src/locale/`
- **Total**: 42 translation files updated

## Terminology Changes

### 1. Session Terminology

**Changed**: "compute session(s)" → "session(s)"

**Affected Keys in English (`resources/i18n/en.json`)**:

```diff
- eduapi.ComputeSessionPrepared: "Compute session prepared"
+ eduapi.ComputeSessionPrepared: "Session prepared"

- eduapi.CreatingComputeSession: "Creating compute session ..."
+ eduapi.CreatingComputeSession: "Creating session ..."

- eduapi.FoundExistingComputeSession: "Found existing compute session"
+ eduapi.FoundExistingComputeSession: "Found existing session"

- eduapi.QueryingExistingComputeSession: "Querying existing compute session ..."
+ eduapi.QueryingExistingComputeSession: "Querying existing session ..."

- session.IdleChecksDesc: "...automatic garbage collection of compute sessions."
+ session.IdleChecksDesc: "...automatic garbage collection of sessions."

- session.NetworkIdleTimeoutDesc: "...between the user and the compute session..."
+ session.NetworkIdleTimeoutDesc: "...between the user and the session..."

- session.UtilizationThresholdDesc: "...resource of a compute session does not..."
+ session.UtilizationThresholdDesc: "...resource of a session does not..."

- session.VSCodeRemoteDescription: "...connect to the remote compute session..."
+ session.VSCodeRemoteDescription: "...connect to the remote session..."

- session.VSCodeRemoteNoticeSSHConfig: "...to the remote compute session, create..."
+ session.VSCodeRemoteNoticeSSHConfig: "...to the remote session, create..."

- statistics.CPUDesc: "...allocated to the compute sessions."
+ statistics.CPUDesc: "...allocated to the sessions."

- statistics.GPUDesc: "...allocated to the compute sessions..."
+ statistics.GPUDesc: "...allocated to the sessions..."

- statistics.IOReadDesc: "...data read from the compute session..."
+ statistics.IOReadDesc: "...data read from the session..."

- statistics.IOWriteDesc: "...data write from the compute session..."
+ statistics.IOWriteDesc: "...data write from the session..."

- statistics.MemoryDesc: "...allocated to the compute sessions."
+ statistics.MemoryDesc: "...allocated to the sessions."

- statistics.SessionsDesc: "The number of compute sessions created."
+ statistics.SessionsDesc: "The number of sessions created."

- statistics.UsageHistoryNote: "...based on terminated compute sessions."
+ statistics.UsageHistoryNote: "...based on terminated sessions."
```

**Total**: 16 occurrences in English file

---

### 2. Keypair Terminology

**Changed**: "key pair" → "keypair"

**Affected Keys in English (`resources/i18n/en.json`)**:

```diff
- credential.NewCredentialCreated: "Key pair for new users"
+ credential.NewCredentialCreated: "Keypair for new users"

- credential.GeneratedKeypairInfo: "This key pair is used to authenticate..."
+ credential.GeneratedKeypairInfo: "This keypair is used to authenticate..."

- credential.GeneratedKeypairWarning: "This key pair will be displayed only once..."
+ credential.GeneratedKeypairWarning: "This keypair will be displayed only once..."

- session.SFTPDescription: "...uploaded your SSH key pair beforehand..."
+ session.SFTPDescription: "...uploaded your SSH keypair beforehand..."
```

**Total**: 4 occurrences in English file

---

### 3. Folder Terminology

**Changed**: "vfolder(s)" / "virtual folder" → "folder(s)"

**Affected Keys in English (`resources/i18n/en.json`)**:

```diff
- error.CannotChangeVirtualFolderOption: "...options of a vfolder that is not..."
+ error.CannotChangeVirtualFolderOption: "...options of a folder that is not..."

- error.CannotSharePrivateAutomountFolder: "Cannot share automount vfolders..."
+ error.CannotSharePrivateAutomountFolder: "Cannot share automount folders..."

- error.MaximumVfolderCreation: "You cannot create more vfolders due to..."
+ error.MaximumVfolderCreation: "You cannot create more folders due to..."

- error.VirtualFolderAlreadyExist: "A virtual folder with the same name..."
+ error.VirtualFolderAlreadyExist: "A folder with the same name..."
```

**Total**: 4 occurrences in English file

---

### 4. Resource Group Terminology

**Changed**: "scaling group(s)" → "resource group(s)"

**Affected Keys in English (`resources/i18n/en.json`)**:

```diff
- resourceGroup.NoScalingGroupAssignedToThisProject: "No resource group is assigned..."
  (key name inconsistent but value already correct - kept as is)

- error.ScalingGroupAlreadyExist: "A resource group with the same name..."
  (key name inconsistent but value already correct - kept as is)

- data.explorer.NoSFTPSupportingScalingGroup: "...has no SFTP resource group."
  (key name inconsistent but value already correct - kept as is)
```

**Affected Keys in Backend.AI UI (`packages/backend.ai-ui/src/locale/en.json`)**:

```diff
- comp:BAIProjectTable.ScalingGroups: "Scaling Groups"
+ comp:BAIProjectTable.ScalingGroups: "Resource Groups"
```

**Total**: 1 value changed (3 keys have inconsistent names but values were already correct)

---

## Statistics

### Changes by Category

| Category | Occurrences in en.json | Files Affected |
|----------|------------------------|----------------|
| Session Terminology | 16 | 42 |
| Keypair Terminology | 4 | 42 |
| Folder Terminology | 4 | 42 |
| Resource Group | 1 | 42 |
| **Total** | **25** | **42** |

### Language Coverage

All changes were applied consistently across all 21 supported languages:

1. English (en)
2. Korean (ko)
3. Japanese (ja)
4. Chinese Simplified (zh-CN)
5. Chinese Traditional (zh-TW)
6. German (de)
7. Spanish (es)
8. French (fr)
9. Italian (it)
10. Portuguese (pt)
11. Portuguese Brazilian (pt-BR)
12. Russian (ru)
13. Polish (pl)
14. Turkish (tr)
15. Greek (el)
16. Finnish (fi)
17. Thai (th)
18. Vietnamese (vi)
19. Indonesian (id)
20. Malay (ms)
21. Mongolian (mn)

---

## Validation

### JSON Validation

All 42 JSON files were validated:
- ✅ All files contain valid JSON
- ✅ No syntax errors introduced
- ✅ All Unicode characters preserved correctly
- ✅ Formatting maintained

### Terminology Verification

- ✅ No remaining "compute session" references
- ✅ No remaining "key pair" references (except in SSH context where appropriate)
- ✅ No remaining "vfolder" or "virtual folder" references
- ✅ "Scaling group" only remains in key names (values updated)

---

## Future Maintenance

See `i18n-terminology-standards.md` for:
- Complete terminology standards
- Guidelines for adding new translations
- Rationale for terminology decisions
- Examples and exceptions

---

## Related Files

- `i18n-terminology-standards.md` - Comprehensive terminology standards documentation
- `i18n-translation-instruction.md` - General translation guidelines
- `.github/instructions/i18n.instructions.md` - i18n coding guidelines

---

*Generated*: 2026-01-08  
*Commit*: feat(i18n): Unify terminology across all translation files
