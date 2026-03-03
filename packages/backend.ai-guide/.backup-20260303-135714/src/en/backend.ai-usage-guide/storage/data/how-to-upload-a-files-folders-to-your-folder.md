---
title: How to upload a files / folders to your folder
order: 61
---
# How to upload a files / folders to your folder

## Exploring folders

<figure><img src="../../../images/folder_name (1).png" alt=""><figcaption></figcaption></figure>

Click the folder name to open a file explorer and view the contents of the folder.





You can see that directories and files inside the folder will be listed, if exists. Click a directory name in the Name column to move to the directory. You can click the download button or delete button in the Actions column to download it or delete it entirely from the directory. You can rename a file/directory as well. For more detailed file operations, you can mount this folder when creating a compute session, and then use a service like Terminal or Jupyter Notebook to do it.

<figure><img src="https://webui.docs.backend.ai/en/latest/_images/folder_explorer1.png" alt=""><figcaption></figcaption></figure>

You can create a new directory on the current path with the 'Create' button (in the folder explorer), or upload a local file or folder with the 'Upload' button. All of these file operations can also be performed using the above-described method of mounting folders into a compute session.

The maximum length of file or directory inside a folder may depends on the host file system. But, it usually cannot exceed 255 characters.

##

## Using a Filebrowser

Backend.AI supports [FileBrowser](https://filebrowser.org/) from version 20.09. FileBrowser is a program that helps you manage files on a remote server through a web browser. This is especially useful when uploading a directory from the user's local machine.

Currently, Backend.AI provides a FileBrowser as an application of a compute session. Therefore, the following conditions are required to launch it.

* User can create at least one compute session.
* User can allocated at least 1 core of CPU and 512 MB of memory.
* Image that supports FileBrowser must be installed.

You can access FileBrowser in two ways.

* Execute FileBrowser from file explorer dialog of a data folder.
* Launch a compute session directly from a FileBrowser image on Sessions page.

**Execute FileBrowser from folder explorer dialog**[****](https://webui.docs.backend.ai/en/latest/vfolder/vfolder.html#execute-filebrowser-from-folder-explorer-dialog)

Go to the Data page and open the file explorer dialog of target data folder. Click the folder name to open the file explorer.

![first step to access FileBrowser](https://webui.docs.backend.ai/en/latest/_images/click_folder_name.png)

Click 'Execute filebrowser' button in the upper-right corner of the explorer.

![Folder explorer with FileBrowser](https://webui.docs.backend.ai/en/latest/_images/folder_explorer1.png)

You can see the FileBrowser is opened in a new window. You can also see that the data folder you opened the explorer dialog becomes the root directory. From the FileBrowser window, you can freely upload, modify, and delete any directories and files.

![FileBrowser with new window](https://webui.docs.backend.ai/en/latest/_images/filebrowser_with_new_window.png)

When user clicks 'EXECUTE FILEBROWSER' button, Backend.AI automatically creates a dedicated compute session for the app. So, in the Sessions page, you should see FileBrowser compute session. It is user's responsibility to delete this compute session.

![FileBrowser in session page](https://webui.docs.backend.ai/en/latest/_images/filebrowser_in_session_page.png)

Note

If you accidentally close the FileBrowser window and want to reopen it, just go to Sessions page and click the FileBrowser application button of the FileBrowser compute session.

[![../\_images/app\_dialog\_with\_filebrowser.png](https://webui.docs.backend.ai/en/latest/_images/app_dialog_with_filebrowser.png)](https://webui.docs.backend.ai/en/latest/_images/app_dialog_with_filebrowser.png)\
When you click 'EXECUTE FILEBROWSER' button again in the data folder explorer, a new compute session will be created and a total of two FileBrowser sessions will appear.

**Create a compute session with FileBrowser image**[****](https://webui.docs.backend.ai/en/latest/vfolder/vfolder.html#create-a-compute-session-with-filebrowser-image)

You can directly create a compute session with FileBrowser supported images. You need to mount at least one or more data folders to access them. You can use FileBrowser without a problem even if you do not mount any data folder, but every uploaded/updated files will be lost after the session is terminated.

Note

The root directory of FileBrowser will be `/home/work`. Therefore, you can access any mounted data folders for the compute session.

**Basic usage examples of FileBrowser**[****](https://webui.docs.backend.ai/en/latest/vfolder/vfolder.html#basic-usage-examples-of-filebrowser)

Here, we present some basic usage examples of FileBrowser in Backend.AI. Most of the FileBrowser operations are intuitive, but if you need more detailed guide, please refer to the [FileBrowser documentation](https://filebrowser.org/).

**Upload local directory using FileBrowser**

FileBrowser supports uploading one or more local directories while maintaining the tree structure. Click the upload button in the upper right corner of the window, and click Folder button. Then, local file explorer dialog will appear and you can select any directory you want to upload.

Note

If you try to upload a file to a read-only folder, FileBrowser will raise a server error.

![../\_images/filebrowser\_upload.png](https://webui.docs.backend.ai/en/latest/_images/filebrowser_upload.png)

Let's upload a directory with the following structure.

```
foo
+-- test
|   +-- test2.txt
+-- test.txt
```

After selecting `foo` directory, you can see the directory just uploaded successfully.

![../\_images/filebrowser\_upload\_finished.png](https://webui.docs.backend.ai/en/latest/_images/filebrowser_upload_finished.png)

You can also upload local files and directories by drag and drop.

**Move files or directories to another directory**

Moving files or directories in data folder is also possible from FileBrowser. You can move files or directories by following steps below.

1. Select directories or files from FileBrowser.

![../\_images/select\_folders.png](https://webui.docs.backend.ai/en/latest/_images/select_folders.png)

2. Click the 'arrow' button in the upper right corner of FileBrowser

[![../\_images/click\_arrow\_icon.png](https://webui.docs.backend.ai/en/latest/_images/click_arrow_icon.png)](https://webui.docs.backend.ai/en/latest/_images/click_arrow_icon.png)

3. Select the destination

[![../\_images/select\_the\_destination.png](https://webui.docs.backend.ai/en/latest/_images/select_the_destination.png)](https://webui.docs.backend.ai/en/latest/_images/select_the_destination.png)

4. Click 'MOVE' button

You will see that moving operation is successfully finished.

![../\_images/moving\_operation\_in\_filebrowser\_finished.png](https://webui.docs.backend.ai/en/latest/_images/moving_operation_in_filebrowser_finished.png)

Note

FileBrowser is provided via application inside a compute session currently. We are planning to update FileBrowser so that it can run independently without creating a session.

\
\
Using SFTP Server[](https://webui.docs.backend.ai/en/latest/vfolder/vfolder.html#using-sftp-server)

From 22.09, Backend.AI supports SSH / SFTP file upload from both desktop app and web-based WebUI. The SFTP server allows you to upload files quickly through reliable data streams.

Note

Depending on the system settings, running SFTP server from the file dialog may not be allowed.

**Execute SFTP server from folder explorer dialog in Data page**[****](https://webui.docs.backend.ai/en/latest/vfolder/vfolder.html#execute-sftp-server-from-folder-explorer-dialog-in-data-page)

Go to the Data page and open the file explorer dialog of target data folder. Click the folder button or the folder name to open the file explorer.

Click 'Run SFTP server' button in the upper-right corner of the explorer.

![Folder explorer with SFTP Server](https://webui.docs.backend.ai/en/latest/_images/folder_explorer1.png)

You can see the SSH / SFTP connection dialog. And a new SFTP session will be created automatically. (This session will not affect resource occupancy.)

[![SSH / SFTP connection dialog](https://webui.docs.backend.ai/en/latest/_images/SSH_SFTP_connection.png)](https://webui.docs.backend.ai/en/latest/_images/SSH_SFTP_connection.png)

Note

We provide a detailed information about using large file upload via ssh/sftp connection. For more information, please click the 'Read more' text link to see all the details of execution.

[![SSH / SFTP connection dialog expanded](https://webui.docs.backend.ai/en/latest/_images/SSH_SFTP_connection_expanded.png)](https://webui.docs.backend.ai/en/latest/_images/SSH_SFTP_connection_expanded.png)

For the connection, click 'DOWNLOAD SSH KEY' button to download the SSH private key (`id_container`). Also, remember the host and port number. Then, you can copy your files to the session using the Connection Example code written in the dialog, or referring to the following guide: [link](https://webui.docs.backend.ai/en/latest/sftp_to_container/sftp_to_container.html#sftp-connection-for-linux-and-mac). To preserve the files, you need to transfer the files to the data folder. Also, the session will be terminated when there is no transfer for some time.

:::info
**Note**

If you upload your SSH keypair, the `id_container` will be set with your own SSH private key. So, you don't need to download it every time you want to connect via SSH to your container. Please refer to[managing user's SSH keypair](https://webui.docs.backend.ai/en/latest/user_settings/user_settings.html#user-ssh-keypair-management).
:::



