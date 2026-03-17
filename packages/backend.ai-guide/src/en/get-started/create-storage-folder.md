---
title: Create Storage Folder
order: 48
---
# Create Storage Folder

Backend.AI provides dedicated storage to preserve user files. Since the files and directories of a compute session are deleted upon session termination, it is recommended to save important data in a storage folder (also known as a *virtual folder* or *vfolder*).

## Create a Storage Folder

To create a new folder, click the **Create Folder** button on the **Data** page. Fill in the fields in the creation dialog as follows:

![](../images/vfolder_create_modal.png)

- **Usage Mode**: Set the purpose of the folder.
   * General: A folder for storing various data in a general-purpose manner.
   * Models: A folder specialized for model serving and management. If this mode is selected, you can also toggle the folder's cloneability.
   * Auto Mount: Folders automatically mounted when a session is created. If selected, the folder name must start with a dot (`.`).
- **Folder name**: The name of the folder (up to 64 characters).
- **Location**: Select the storage host where the folder will be created. If there are multiple hosts, choose one. An indicator shows whether there is enough available space.
- **Type**: Determines the type of folder to be created.
   * User: A folder that you can create and use individually.
   * Project: A folder created by an administrator and shared by users in the project.
- **Project**: Shown only when you select the Project type. Designates the project to which the folder belongs.
- **Permission**: Set permission of a project folder for project members. If set to `Read-Only`, project members cannot write to this folder inside their compute session.
- **Cloneable**: Shown only when you select `Models` as the usage mode. Determines whether the folder can be cloned.

After entering the required information, click the **Create** button to create the folder.

The folders created here can be mounted when creating a compute session. Folders are mounted under the user's default working directory, `/home/work/`, and files stored in the mounted directory will not be deleted when the session is terminated. However, if you delete the folder itself, the files will also be permanently removed.

:::note
For detailed information on managing storage folders (exploring, renaming, deleting, sharing), refer to the [Data Management Guide](../backend.ai-usage-guide/storage/data/data-management-guide.md).
:::
