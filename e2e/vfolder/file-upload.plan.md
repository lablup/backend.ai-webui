# BAIFileExplorer File Upload - Comprehensive E2E Test Plan

## Application Overview

The BAIFileExplorer component provides file management within Backend.AI Virtual Folders (VFolders). The file upload functionality includes:

- **Button-based upload**: Click "Upload" dropdown button to select "Upload Files" (multi-file) or "Upload Folder" (directory)
- **Drag-and-drop upload**: Drag files onto the file explorer area to trigger an overlay and upload
- **Duplicate detection**: Checks for existing files and shows a confirmation modal to overwrite
- **Resumable uploads**: Uses TUS protocol with adaptive chunking
- **Progress notifications**: Real-time upload progress via Jotai state + notification system
- **Permission controls**: Upload UI is only available when `enableWrite` is true (Read & Write VFolders)

## Test Infrastructure Notes

- **Cleanup Required**: Yes - VFolders must be deleted (trash + delete forever) after tests
- **Temporary Files**: Test files created in OS temp directory, cleaned up in `afterAll`
- **Authentication**: `loginAsUser` for standard user tests
- **Navigation**: `navigateTo(page, 'data')` to reach VFolder list
- **Tags**: `@critical`, `@vfolder`, `@functional`

---

## Suite 1: Button-Based File Upload

**Seed:** Login as user, create VFolder with RW permissions, open FolderExplorerModal
**Execution Mode:** Serial (tests share VFolder state)
**File:** `e2e/vfolder/file-upload.spec.ts`

### 1.1 User can upload a single file via Upload button

**Steps:**
1. Create a VFolder with Read & Write permissions
2. Open the VFolder in FolderExplorerModal (click folder name link)
3. Verify file explorer loaded (column header "Name" visible)
4. Click the "Upload" button (role: button, name: "upload Upload")
5. In the dropdown, click "Upload Files" button (role: button, name: "file-add Upload Files")
6. Handle file chooser event and set a single test file
7. Verify the uploaded file appears in the file table

**Expected Results:**
- Upload dropdown opens with "Upload Files" and "Upload Folder" options
- File chooser dialog is triggered
- After upload completes, the file is visible in the file list

### 1.2 User can upload multiple files via Upload button

**Steps:**
1. Open the same VFolder in FolderExplorerModal
2. Verify file explorer loaded
3. Click the "Upload" button
4. In the dropdown, click "Upload Files"
5. Handle file chooser and set multiple test files (2 files)
6. Verify all uploaded files appear in the file table

**Expected Results:**
- Both uploaded files are visible in the file list

---

## Suite 2: Drag-and-Drop File Upload

**Seed:** Login as user, create VFolder with RW permissions, open FolderExplorerModal
**Execution Mode:** Serial
**File:** `e2e/vfolder/file-upload-dnd.spec.ts`

### 2.1 User can upload a file via drag and drop

**Steps:**
1. Create a VFolder with Read & Write permissions
2. Open the VFolder in FolderExplorerModal
3. Verify file explorer loaded
4. Simulate drag-and-drop of a file onto the file explorer area
5. Verify the drag-and-drop overlay appears (text: "Drag and drop")
6. Drop the file
7. Verify the uploaded file appears in the file table

**Expected Results:**
- Drag overlay with blur backdrop appears when dragging files over the explorer
- After drop and upload, the file is visible in the file list

---

## Suite 3: Duplicate File Upload

**Seed:** Login as user, create VFolder with RW permissions, upload a file first, then upload the same file again
**Execution Mode:** Serial
**File:** `e2e/vfolder/file-upload-duplicate.spec.ts`

### 3.1 User sees duplicate confirmation when uploading existing file

**Steps:**
1. Create a VFolder with Read & Write permissions
2. Open the VFolder in FolderExplorerModal
3. Upload a test file via Upload button (establish baseline)
4. Verify the file appears in the file table
5. Click "Upload" button again
6. Upload the same file again
7. Verify a confirmation modal appears with duplicate warning (i18n: `comp:FileExplorer.DuplicatedFiles`)
8. Click "OK" to confirm overwrite
9. Verify the file still exists in the file table (overwritten)

**Expected Results:**
- Confirmation modal with "Duplicated Files" title appears
- After confirming, the file is overwritten and remains visible

### 3.2 User can cancel duplicate file upload

**Steps:**
1. Open the same VFolder in FolderExplorerModal
2. Upload the same file again (already exists from previous test)
3. Verify the duplicate confirmation modal appears
4. Click "Cancel" to reject overwrite
5. Verify the original file still exists unchanged

**Expected Results:**
- Clicking Cancel dismisses the modal without uploading
- The original file remains in the file list

---

## Suite 4: Upload Permission Controls

**Seed:** Login as user, create VFolders with different permissions
**Execution Mode:** Serial
**File:** `e2e/vfolder/file-upload-permissions.spec.ts`

### 4.1 User cannot upload files to read-only VFolder

**Steps:**
1. Create a VFolder with Read Only permissions
2. Open the VFolder in FolderExplorerModal
3. Verify file explorer loaded
4. Verify the Upload button is disabled
5. Verify the Create folder button is disabled
6. Close modal

**Expected Results:**
- Upload button is visible but disabled
- Create folder button is visible but disabled
- No file upload functionality is accessible

### 4.2 User can upload files to read-write VFolder

**Steps:**
1. Create a VFolder with Read & Write permissions
2. Open the VFolder in FolderExplorerModal
3. Verify file explorer loaded
4. Verify the Upload button is enabled
5. Verify the Create folder button is enabled
6. Close modal

**Expected Results:**
- Upload button is enabled and clickable
- Create folder button is enabled and clickable

---

## Suite 5: Upload to Subdirectory

**Seed:** Login as user, create VFolder with RW permissions, create a subdirectory, navigate into it
**Execution Mode:** Serial
**File:** `e2e/vfolder/file-upload-subdirectory.spec.ts`

### 5.1 User can upload a file to a subdirectory

**Steps:**
1. Create a VFolder with Read & Write permissions
2. Open the VFolder in FolderExplorerModal
3. Create a new folder using the "Create" button
4. Navigate into the newly created folder (click folder name)
5. Verify breadcrumb shows the subdirectory path
6. Upload a file via Upload button
7. Verify the file appears in the subdirectory's file table
8. Navigate back to root (click home in breadcrumb)
9. Verify the subdirectory is visible but the uploaded file is not (it's inside the subdirectory)

**Expected Results:**
- File is uploaded to the current subdirectory path
- Breadcrumb navigation works correctly
- File is only visible in the subdirectory, not in the root

---

## Key UI Selectors Reference

| Element | Locator |
|---------|---------|
| Upload button | `modal.getByRole('button', { name: 'upload Upload' })` |
| Upload Files option | `page.getByRole('button', { name: 'file-add Upload Files' })` |
| Upload Folder option | `page.getByRole('button', { name: 'folder-add Upload Folder' })` |
| Create folder button | `modal.getByRole('button', { name: 'folder-add Create' })` |
| File table Name header | `modal.getByRole('columnheader', { name: 'Name' })` |
| File cell | `modal.getByRole('cell', { name: fileName })` |
| Drag-and-drop overlay | `Upload.Dragger` with "Drag and drop" text |
| Duplicate confirm modal | `page.getByRole('dialog')` with "Duplicated Files" text |
| Breadcrumb home | `HouseIcon` in breadcrumb |

## i18n Keys Reference

| Key | English Value |
|-----|---------------|
| `comp:FileExplorer.UploadFiles` | Upload Files |
| `comp:FileExplorer.UploadFolder` | Upload Folder |
| `comp:FileExplorer.DuplicatedFiles` | Duplicated Files |
| `comp:FileExplorer.DuplicatedFilesDesc` | (confirmation message) |
| `explorer.SuccessfullyUploadedToFolder` | Successfully uploaded to folder |
| `explorer.UploadingFiles` | Uploading Files |
| `explorer.UploadFailed` | Upload failed |
