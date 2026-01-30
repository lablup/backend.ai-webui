# I18n Terminology Standards

This document defines the standardized terminology used throughout Backend.AI WebUI's internationalization files to ensure consistency across all translations.

## Terminology Standards

### 1. Session Terminology

**Standard**: Use **"session"** instead of "compute session"

**Rationale**: 
- Simpler and more concise
- "Compute" is implicit in the Backend.AI context
- Consistent with API naming conventions

**Examples**:
- ✅ "Session prepared"
- ✅ "Creating session..."
- ✅ "The number of sessions created"
- ❌ "Compute session prepared"
- ❌ "Creating compute session..."

**Exceptions**: None - always use "session"

---

### 2. Keypair Terminology

**Standard**: Use **"keypair"** (one word) instead of "key pair" (two words)

**Rationale**:
- Matches Backend.AI's API and code naming conventions
- Consistent with technical documentation
- Aligns with industry standard terminology (AWS, etc.)

**Examples**:
- ✅ "Keypair for new users"
- ✅ "This keypair is used to authenticate..."
- ✅ "SSH keypair"
- ❌ "Key pair for new users"
- ❌ "This key pair is used to..."

**Exceptions**: 
- Keep "key" separate when it's a generic reference (e.g., "SSH key", "public key")

---

### 3. Resource Group vs Scaling Group

**Standard**: Use **"resource group"** instead of "scaling group"

**Rationale**:
- "Resource group" is the current preferred terminology in Backend.AI
- More accurately describes the entity (groups of compute resources)
- Aligns with modern Backend.AI documentation

**Examples**:
- ✅ "Select resource group"
- ✅ "No resource group is assigned to this project"
- ✅ "Resource Groups"
- ❌ "Select scaling group"
- ❌ "Scaling Groups"

**Exceptions**: None - always use "resource group"

---

### 4. Folder Terminology

**Standard**: Use **"folder"** instead of "vfolder" or "virtual folder"

**Rationale**:
- More user-friendly and intuitive
- "Virtual" is an implementation detail not relevant to users
- Consistent with modern file system terminology

**Examples**:
- ✅ "You cannot create more folders..."
- ✅ "A folder with the same name already exists"
- ✅ "Cannot share automount folders..."
- ❌ "You cannot create more vfolders..."
- ❌ "A virtual folder with the same name exists"

**Context-specific usage**:
- Use "storage folder" when specifically referring to persistent storage
- Use "automount folder" when referring to auto-mounted folders
- Use plain "folder" in general UI contexts

---

### 5. API Endpoint Terminology

**Standard**: Use **"API endpoint"** for Backend.AI API endpoints

**Rationale**:
- Clear distinction between different types of endpoints
- Reduces ambiguity in authentication context

**Examples**:
- ✅ "API Endpoint is empty. Please specify..."
- ✅ "Backend.AI API endpoint"
- ⚠️  "Endpoint" - only for agent.Endpoint (agent URL)

---

## Implementation Notes

### Automated Changes

All terminology standardization was applied using an automated script to:
- `/resources/i18n/*.json` - Main WebUI translations (21 languages)
- `/packages/backend.ai-ui/src/locale/*.json` - UI component translations (21 languages)

Total files updated: **42 translation files**

### Technical Terms Preserved

The following technical terms were **NOT** changed as they are technically accurate:

1. **Container vs Kernel**: 
   - `kernel.ContainerId` and `kernel.ContainerLogs` kept as "Container"
   - Rationale: Kernels run inside containers; this is technically correct

2. **Storage folder**:
   - Kept when specifically referring to storage context
   - Rationale: Distinguishes between general folders and storage-backed folders

---

## Translation Guidelines for Future Updates

When adding new translations:

1. **Use standardized terms**: Follow the terminology defined in this document
2. **Check existing translations**: Search for similar strings to maintain consistency
3. **Update all languages**: When changing English, update all 21 supported languages
4. **Preserve placeholders**: Keep `{{variable}}` placeholders intact
5. **Follow naming conventions**:
   - Main WebUI: `category.subcategory.key`
   - UI Package: `comp:ComponentName.key`

---

## Supported Languages

Backend.AI WebUI supports the following languages:

1. English (en) - Default
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

## Future Considerations

### Terminology Review Schedule

- **Quarterly**: Review for new inconsistencies
- **Before major releases**: Comprehensive terminology audit
- **When adding new features**: Define terminology standards for new concepts

### Automated Checks

Consider implementing:
- Pre-commit hooks to detect terminology inconsistencies
- Linting rules for i18n JSON files
- CI/CD checks for terminology compliance

---

## References

- [I18n Translation Instructions](/i18n-translation-instruction.md)
- [I18n Guidelines](/.github/instructions/i18n.instructions.md)
- Backend.AI Documentation: https://docs.backend.ai/

---

*Last Updated*: 2026-01-08  
*Version*: 1.0
