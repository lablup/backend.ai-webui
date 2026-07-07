<a id="vfolders"></a>

# Handling Data & Storage Folders


Backend.AI supports dedicated storage to preserve user's files. Since the files
and directories of a compute session are deleted upon session termination, it is
recommended to save them in a storage folder. List of storage folders can be
found by selecting the Data page on the sidebar. You can see the information
such as the folder name and ID, the NFS host name where the folder is located
(Location), and folder access rights (Permission).


![](../images/data_page.png)

There are two types of storage folders: `User` and `Project`. You can
distinguish between them in the 'Type' column.

## Invitation Badge and Entry Point

When another user invites you to share one of their storage folders, a small
invitation badge appears on the Data page entry in the sidebar and next to the
folder status summary. The badge displays the number of pending invitations
that still need a response.

![](../images/vfolder_invitation_badge.png)

Click the badge to open the invitation list, where you can accept or decline
each pending invitation. Accepted folders immediately appear in your folder
list with the `Invited` type. The `/data` page itself is also a valid entry
point for reviewing invitations — open the Data page and the same invitation
list is reachable from the folder status summary.


<a id="create-storage-folder"></a>
<a id="create_storage_folder"></a>

## Create Storage Folder


To create a new folder, click `Create Folder` on the Data page. Fill in the fields in
the creation dialog as follows:

![](../images/vfolder_create_modal.png)

The meaning of each field in the creation dialog is as follows.

- **Usage Mode**: Set the purpose of the folder.

   * General: Defines a folder for storing various data in a general-purpose manner.
   * Models: Defines a folder specialized for model serving and management. If this mode is selected, it is also possible to toggle the folder's copy availability.
   * Auto Mount: Folders automatically mounted when a session is created. If selected, the folder name must start with a dot ('.').

- **Folder name**: The name of the folder (up to 64 characters).
- **Location**: Select the NFS host where the folder will be created. If there are multiple hosts, choose one. An indicator will show if there is enough available space.
- **Type**: Determines the type of folder to be created. It can be set as User or Project. The User folder is a folder that users can create and use alone and the Project folder is a folder created by admin and shared by users in the project.
- **Project**: Shown only when you select Project type. The folder belongs to the project currently selected in the top bar — there is no separate project selector, and a confirmation message indicates which project will own the folder. This field has no effect when creating a User folder.
- **Permission**: The mount permission applied when the folder is mounted into a compute session. **Read & Write** allows writing to the folder inside sessions; **Read only** prevents it. This applies to both User and Project folders; for a Project folder it governs access for all project members.
- **Cloneable**: Shown only when you select usage mode to "Model". Select whether the vfolder you are creating should be cloneable.

The folders created here can be [mounted](#session-mounts) when creating a compute session. Folders are mounted
under the user's default working directory, `/home/work/`, and the file stored in the mounted
directory will not be deleted when the compute session is terminated.
(If you delete the folder, the file will also be deleted.)

<a id="explore-folder"></a>

## Explore Folder


Click the folder name to open the folder explorer and view the contents of the folder.

![](../images/click_folder_name.png)

The folder explorer uses a two-panel layout:

- **Left panel**: File browser showing the directory tree and file list for the storage folder.
- **Right panel**: Additional information and logs, organized into two tabs:
  * **Metadata**: Folder description and properties (previously shown as a side panel).
  * **Audit Log**: A chronological record of operations performed on this folder.

On wide (xl) screens a draggable divider separates the two panels so you can resize them to suit your workflow. On narrow screens the panels stack vertically.

![](../images/folder_explorer.png)

![](../images/split_panel_folder_explorer.png)

### File Operations

Inside the left panel you can see all directories and files in the folder. Click a directory name in the Name column to navigate into it. Use the buttons in the Actions column to download or delete a file or directory. You can rename a file or directory as well. For more detailed file operations, you can mount this folder when creating a compute session and then use a service like Terminal or Jupyter Notebook.

You can create a new folder on the current path with the **Create Folder** button, or upload a local file or folder with the **Upload** button. All of these file operations can also be performed using the above-described method of mounting folders into a compute session.

:::warning
The **Upload** button (and drag-and-drop upload) is **disabled** when your account
does not have the `upload-file` permission on the storage host that hosts this
folder. The button itself remains visible but is greyed out, and tooltips
explain that uploads are not permitted.

`upload-file` is a host-level capability granted through domain-level
permissions, project-level permissions, or your keypair resource policy — you
receive it if **any one** of these grants it for the storage host. If the button
is disabled, ask your administrator to grant you `upload-file` permission for
the host that stores this folder. You can identify which host the folder lives
on from the **Location** column in the folder list or from the folder detail
drawer.
:::

![](../images/vfolder_upload_disabled.png)

The maximum length of a file or directory name inside a folder depends on the host file system, but it usually cannot exceed 255 characters.

:::note
To ensure smooth performance, the screen limits the maximum number of files that can be displayed when a
directory contains an excessive number of files. If a folder contains a large number of files, some may
not be shown on the screen. In such cases, please use the terminal or other applications to view all files
in the directory.
:::

### Edit Text Files

You can edit text files directly in the folder explorer. Click the folder name to open the file explorer, then click the **Edit File** button in the Control column for any text file.

![](../images/folder_explorer_edit_button.png)

The text file editor opens in a modal with a code editor interface. The editor automatically detects the file type based on the file extension and applies appropriate syntax highlighting (e.g., Python, JavaScript, Markdown). The modal title displays the file name and size.

![](../images/text_file_editor_modal.png)

The editor supports both light and dark themes matching your UI preferences. You can edit the file content, then click **Save** to upload the modified file, or **Cancel** to discard changes.

:::note
The Edit File button is only available when your access to this storage folder includes the `write_content` permission (granted via folder sharing permission or your role on the folder). Storage-host level settings in the control panel do not affect this. If the file fails to load, an error message will be displayed.
:::

### Audit Log Tab

The **Audit Log** tab in the right panel shows a chronological list of all operations performed on this storage folder (create, update, delete events, and more).

![](../images/vfolder_audit_log_tab.png)

The audit log shows the following columns, in order:

- **Time**: When the operation occurred.
- **Operation**: The type of action (for example, create, update, or delete).
- **Status**: The result of the operation (for example, SUCCESS or ERROR).
- **Description**: Additional details about the operation.
- **Duration**: How long the operation took.
- **Triggered By**: The user who performed the operation, shown in "email (id)" format.

You can filter the log by **Time**, **Operation**, **Status**, and **Triggered By**.

## Rename Folder


If you have permission to rename the storage folder, open the folder's detail
drawer and click the edit button next to the folder name. Renaming is performed
inside the detail drawer.

![](../images/rename_vfolder.png)


## Delete Folder


If you have permission to delete the storage folder, you can send the folder to the `Trash`
tab by clicking the `trash bin` button. When you move a folder to the Trash tab, it is marked as delete-pending.

![](../images/move_to_trash.png)

In this status, you can restore the folder by clicking restore button in Control column. If you want to permanently delete the folder,
please click `trash bin` button in the same column.

![](../images/vfolder_trash_list.png)

A confirmation modal will appear asking you to type the folder name. Once you enter the folder name correctly, the **Delete Forever** button becomes active. Click it to permanently delete the folder.

![](../images/vfolder_delete_dialog.png)

:::warning[Cascading model card deletion]
If the folder you are deleting is associated with a **model card**, the
confirmation modal additionally surfaces the option *"Also delete the
associated model folder"* with the warning *"Deleting the associated model
folder will also delete every model card that uses it."* Proceeding with the
deletion permanently removes every model card backed by this storage folder —
not just the folder's files. Review the listed model cards before confirming;
this action cannot be undone.
:::

![](../images/vfolder_cascading_delete_warning.png)

## Using FileBrowser


Backend.AI supports [FileBrowser](https://filebrowser.org). FileBrowser is a program that helps you manage files on a remote server
through a web browser. This is especially useful when uploading a directory from
the user's local machine.

Currently, Backend.AI provides a FileBrowser as an application of a compute
session. Therefore, the following conditions are required to launch it.

- User can create at least one compute session.
- User can allocated at least 1 core of CPU and 512 MB of memory.
- Image that supports FileBrowser must be installed.

You can access FileBrowser in two ways.

- Execute FileBrowser from file explorer dialog of a storage folder.
- Launch a compute session directly from a FileBrowser image on Sessions page.


### Execute FileBrowser From Folder Explorer Dialog

Go to the Data page and open the file explorer dialog of target
storage folder. Click the folder name to open the file explorer.

![](../images/click_folder_name.png)

Click `Execute filebrowser` button in the upper-right corner of the explorer.

![](../images/folder_explorer.png)

You can see the FileBrowser is opened in a new window. You can also see that the
storage folder you opened the explorer dialog becomes the root directory. From the
FileBrowser window, you can freely upload, modify, and delete any directories
and files.

![](../images/filebrowser_with_new_window.png)

When user clicks `Execute FileBrowser` button, Backend.AI automatically creates a
dedicated compute session for the app. So, in the Sessions page, you should see
FileBrowser compute session. It is user's responsibility to delete this compute
session.

![](../images/filebrowser_in_session_page.png)


:::note
If you accidentally close the FileBrowser window and want to reopen it, just
go to Sessions page and click the FileBrowser application button of the
FileBrowser compute session.

![](../images/app_dialog_with_filebrowser.png)

When you click `Execute FileBrowser` button again in the storage folder
explorer, a new compute session will be created and a total of two
FileBrowser sessions will appear.
:::

### Create a Compute Session With FileBrowser Image

You can directly create a compute session with FileBrowser supported images.
You need to mount at least one or more storage folders to access them. You can use
FileBrowser without a problem even if you do not mount any storage folder, but
every uploaded/updated files will be lost after the session is terminated.


:::note
The root directory of FileBrowser will be `/home/work`. Therefore, you
can access any mounted storage folders for the compute session.
:::

### Basic Usage Examples of FileBrowser

Here, we present some basic usage examples of FileBrowser in Backend.AI. Most
of the FileBrowser operations are intuitive, but if you need more detailed
guide, please refer to the
[FileBrowser documentation](https://filebrowser.org).

**Upload local directory using FileBrowser**

FileBrowser supports uploading one or more local directories while maintaining
the tree structure. Click the upload button in the upper right corner of the
window, and click Folder button. Then, local file explorer dialog will appear
and you can select any directory you want to upload.


:::note
If you try to upload a file to a read-only folder, FileBrowser will raise a
server error.
:::

![](../images/filebrowser_upload.png)

Let's upload a directory with the following structure.

```shell
foo
+-- test
|   +-- test2.txt
+-- test.txt
```

After selecting `foo` directory, you can see the directory just uploaded
successfully.

![](../images/filebrowser_upload_finished.png)

You can also upload local files and directories by drag and drop.

**Move files or directories to another directory**

Moving files or directories in storage folder is also possible from FileBrowser.
You can move files or directories by following steps below.

1. Select directories or files from FileBrowser.

![](../images/select_folders.png)

2. Click the `arrow` button in the upper right corner of FileBrowser

![](../images/click_arrow_icon.png)

3. Select the destination

![](../images/select_the_destination.png)

4. Click `Move` button

You will see that moving operation is successfully finished.

![](../images/moving_operation_in_filebrowser_finished.png)


:::note
FileBrowser is provided via application inside a compute session currently.
We are planning to update FileBrowser so that it can run independently
without creating a session.
:::

## Using SFTP Server


Backend.AI supports SSH / SFTP file upload from both desktop app and
web-based WebUI. The SFTP server allows you to upload files quickly through reliable
data streams.


:::note
Depending on the system settings, running SFTP server from the file dialog may not
be allowed.
:::

### Execute SFTP Server From Folder Explorer Dialog in Data Page

Go to the Data page and open the file explorer dialog of target storage folder.
Click the folder button or the folder name to open the file explorer.

Click `Run SFTP server` button in the upper-right corner of the explorer.

![](../images/folder_explorer.png)

You can see the SSH / SFTP connection dialog. And a new SFTP session will be created
automatically. (This session will not affect resource occupancy.)

![](../images/SSH_SFTP_connection.png)

For the connection, click `Download SSH Key` button to download the SSH private key
(`id_container`). Also, remember the host and port number. Then, you can copy your
files to the session using the Connection Example code written in the dialog, or
referring to the following guide: [SFTP Connection Guide](#ssh-sftp-container).
To preserve the files, you need to transfer the files to the storage folder. Also,
the session will be terminated when there is no transfer for some time.


:::note
If you upload your SSH keypair, the `id_container` will be set with your
own SSH private key. So, you don't need to download it every time you
want to connect via SSH to your container. Please refer to
[managing user's SSH keypair](#user-ssh-keypair-management).
:::

## Pipeline Folders

This tab shows the list of folders that are automatically created when executing a
pipeline in FastTrack. When a pipeline is created, a new folder is created and mounted
under `/pipeline` for each instance of work (computing session).

<a id="automount-folder"></a>

## Automount Folders


Data page has an Automount Folders tab. Click this tab to see a
list of folders whose names prefixed with a dot (`.`). When you create a folder,
if you specify a name that starts with a dot (`.`), it is added to the Automount
Folders tab, not the Folders tab. Automount Folders are special folders that are
automatically mounted in your home directory even if you do not mount them
manually when creating a compute session. By using this feature, creating and
using Storage folders such as `.local`, `.linuxbrew`, `.pyenv`, etc.,
you can configure a certain user packages or environments that do not change
with different kinds of compute session.

For more detailed information on the usage of Automount folders, refer to
[examples of using automount folders](#using-automount-folder).

![](../images/vfolder_automount_folders.png)

<a id="models"></a>

## Models


The Models tab facilitates straightforward model serving.
You can store the necessary data, including input data for [model serving](#model-serving) and training data, in the model folder.

![](../images/models.png)