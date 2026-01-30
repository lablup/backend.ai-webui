# I18n Terminology Unification - Usage Examples

This document provides real-world examples of how the terminology changes appear in the Backend.AI WebUI interface.

## 1. Session Terminology Changes

### Example 1: Session Creation Flow (EduAPI)

**Before:**
```
Creating compute session ...
Querying existing compute session ...
Found existing compute session
Compute session prepared
```

**After:**
```
Creating session ...
Querying existing session ...
Found existing session
Session prepared
```

**Context**: Displayed during session creation in educational API integration

---

### Example 2: Session Management Description

**Before:**
```
Backend.AI supports inactivity (idleness) criteria for automatic garbage 
collection of compute sessions.
```

**After:**
```
Backend.AI supports inactivity (idleness) criteria for automatic garbage 
collection of sessions.
```

**Context**: Idle Checks description in session settings

---

### Example 3: Statistics Panel

**Before:**
```
The number of compute sessions created.
The number of CPU cores allocated to the compute sessions.
The number of GPU units allocated to the compute sessions.
The amount of memory allocated to the compute sessions.
```

**After:**
```
The number of sessions created.
The number of CPU cores allocated to the sessions.
The number of GPU units allocated to the sessions.
The amount of memory allocated to the sessions.
```

**Context**: Statistics descriptions for resource usage

---

## 2. Keypair Terminology Changes

### Example 1: Credential Creation

**Before:**
```
Key pair for new users

This key pair is used to authenticate API requests. For security, share it 
only with the newly created user and do not share it with anyone else.

Warning: This key pair will be displayed only once. Copy or download it 
and store it in a safe place.
```

**After:**
```
Keypair for new users

This keypair is used to authenticate API requests. For security, share it 
only with the newly created user and do not share it with anyone else.

Warning: This keypair will be displayed only once. Copy or download it 
and store it in a safe place.
```

**Context**: New credential/keypair creation dialog

---

### Example 2: SFTP Connection Instructions

**Before:**
```
You can upload files quickly and securely through an SSH/SFTP client. 
If you haven't uploaded your SSH key pair beforehand, please click the 
"DOWNLOAD SSH KEY" button to save your SSH key first.
```

**After:**
```
You can upload files quickly and securely through an SSH/SFTP client. 
If you haven't uploaded your SSH keypair beforehand, please click the 
"DOWNLOAD SSH KEY" button to save your SSH key first.
```

**Context**: SFTP connection setup instructions

---

## 3. Folder Terminology Changes

### Example 1: Error Messages

**Before:**
```
You cannot change the options of a vfolder that is not owned by myself.
Cannot share automount vfolders in line with the policy.
You cannot create more vfolders due to resource policy.
A virtual folder with the same name already exists. Delete your own folder 
or decline the invitation.
```

**After:**
```
You cannot change the options of a folder that is not owned by myself.
Cannot share automount folders in line with the policy.
You cannot create more folders due to resource policy.
A folder with the same name already exists. Delete your own folder 
or decline the invitation.
```

**Context**: Error messages in folder management

---

## 4. Resource Group Terminology Changes

### Example 1: Project Table (Backend.AI UI)

**Before:**
```
Scaling Groups
```

**After:**
```
Resource Groups
```

**Context**: Column header in project management table

---

### Example 2: Project Configuration

**Before/After (values were already correct):**
```
No resource group is assigned to this project. Session creation and model 
service creation will be restricted.

A resource group with the same name already exists.

This folder's storage host has no SFTP resource group.
```

**Context**: Error and informational messages (note: key names still contain "ScalingGroup" but values were already using "resource group")

---

## Visual Impact Comparison

### Session Creation Dialog

```
┌─────────────────────────────────────────┐
│  Creating Session...                    │  ← Changed from "Creating compute session"
│                                         │
│  ⚙️  Preparing environment...           │
│  📦 Allocating resources...             │
│  ✓  Session prepared                    │  ← Changed from "Compute session prepared"
└─────────────────────────────────────────┘
```

### Statistics Dashboard

```
┌─────────────────────────────────────────┐
│  Resource Usage Statistics              │
│                                         │
│  Sessions: 42                           │  ← Changed from "Compute Sessions"
│  Description: The number of sessions    │  ← Changed
│  created.                               │
│                                         │
│  CPU: 128 cores                         │
│  Description: CPU cores allocated to    │  ← Changed
│  the sessions.                          │
└─────────────────────────────────────────┘
```

### Keypair Dialog

```
┌─────────────────────────────────────────┐
│  Keypair for new users                  │  ← Changed from "Key pair"
│                                         │
│  ⚠️  This keypair will be displayed     │  ← Changed
│  only once. Copy or download it and     │
│  store it in a safe place.              │
│                                         │
│  Access Key: AKIAIOSFODNN7EXAMPLE       │
│  Secret Key: wJalrXUtnFEMI/K7MDENG/...  │
│                                         │
│  [Copy] [Download] [Close]              │
└─────────────────────────────────────────┘
```

### Folder Error Messages

```
┌─────────────────────────────────────────┐
│  ⚠️  Cannot Create Folder               │
│                                         │
│  You cannot create more folders due to  │  ← Changed from "vfolders"
│  resource policy.                       │
│                                         │
│  Contact your administrator for more    │
│  quota.                                 │
│                                         │
│  [OK]                                   │
└─────────────────────────────────────────┘
```

---

## User-Facing Benefits

### Consistency
- Users see the same terminology across all parts of the application
- Reduces cognitive load when learning the system
- Professional and polished user experience

### Clarity
- "Session" is simpler and clearer than "compute session"
- "Keypair" matches industry-standard terminology (AWS, SSH, etc.)
- "Folder" is more intuitive than "vfolder" or "virtual folder"
- "Resource group" is more descriptive than "scaling group"

### Internationalization
- Simpler English terms are easier to translate consistently
- Reduces ambiguity in non-English translations
- Maintains meaning across all 21 supported languages

---

## Technical Context

### API Alignment
These changes align user-facing terminology with:
- Backend.AI API naming conventions
- Code variable and function names
- Documentation and developer guides

### Backend Compatibility
Changes are UI-only and do not affect:
- API endpoints
- Database schemas
- Backend logic
- Client-server communication

---

*See also*: 
- `TERMINOLOGY_CHANGES_SUMMARY.md` - Complete list of changes
- `i18n-terminology-standards.md` - Future standards and guidelines
