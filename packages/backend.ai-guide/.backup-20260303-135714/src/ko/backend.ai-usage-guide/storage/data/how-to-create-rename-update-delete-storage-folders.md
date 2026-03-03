---
title: How to create / rename / update / delete storage folders
order: 60
---
# How to create / rename / update / delete storage folders

## Creating a storage folder

<figure><img src="../../../images/create-folder (1).png" alt=""><figcaption><p>Storage -> Data -> 'Create Folder' button</p></figcaption></figure>

A storage folder can be created by clicking the **'Create Folder'** button under Data page. There are two 'Create Folder' button on the screen. One is located at the top-left of the storage status viewing area, and one is located at the top-right side of the 'Folders' card. Clicking the **'Create Folder'** button opens a modal to enter folder information.&#x20;

<figure><img src="../../../images/image (1) (1) (1) (1) (1) (1) (1) (1).png" alt=""><figcaption><p>Modal: Create a new storage folder</p></figcaption></figure>

The meaning of the each field of the modal as follows:

* **Folder name** (Required): Name of the folder, up to 64 characters.
* **Location**: Select the NFS host where the folder will be created. If multiple NFS hosts are available, one can be chosen from the list. The remaining capacity of the selected host can be checked using the provided indicator.
* **Usage Mode**: The purpose of the folder. Classification is intended to support dedicated features for Model Stores. No difference in the user interface based on the selected purpose.
  * **`General`**: Can handle general types of contents like image, code, datasets.
  * **`Model`**: Model type folder for model service. Model service only recognizes model type folders.&#x20;
*   **Type**: Determines the type of folder to be created.

    * **`User`:** A folder that can be created and used exclusively by an individual user.
    * `Project`**:** A folder created by an administrator and shared among users within a project.

    \* Only one option may be visible depending on the server settings.
* **Permission**: Set permission of a project folder for project members.&#x20;
  * `Read & Write`: Both action is allows to perform.
  * `Read Only`: Project members cannot write to this folder inside their compute session.

<figure><img src="../../../images/usage_mode.png" alt=""><figcaption><p>Modal: Cloneable setting depending on usage mode</p></figcaption></figure>

* **Cloneable** (Optional): Set storage folder as cloneable. Shown only when select `Model` in **Usage Mode**.&#x20;

<figure><img src="../../../images/project_selector (1).png" alt=""><figcaption><p>Modal: Project selector based on folder type</p></figcaption></figure>

* **Project** (Optional): Specifies the project group to which the folder will belong. Project folders must be associated with a project; this setting does not apply when creating a user folder. Shown only when users select a `Project` as a **Type**, creating additional project is not available in this dropdown.

After entering all required information according to the characteristics of the project folder, click the orange **Create** button at the bottom right to create the folder.

Folders created in this section can be [mounted when starting a compute session](../../workload/sessions/mounting-folders-to-a-compute-session.md). These folders will appear under the default working directory, `/home/work/`, for each user. Files stored in the mounted directories are preserved even after the compute session ends. However, if a folder is deleted, all files within that folder will also be permanently removed.

## Renaming a storage folder

Click the edit button (or pencil icon) next to the folder name to modify its name as needed. Edit button will be visible when user hover their focus over the folder name. Once the changes are saved, the new folder name will be applied immediately.

<figure><img src="../../../images/folder_name_edit (1).png" alt=""><figcaption><p>Renaming a folder on a list</p></figcaption></figure>

:::info
**Note**

To rename a storage folder, appropriate permission to change the folder name is required. If there is no option to change a folder name, please contact system administrator.
:::

## Deleting a storage folder

If you have permission to delete the storage folder, you can send the folder to the 'Trash' tab by clicking the 'trash bin' button. When you move a folder to the Trash tab, it is marked as delete-pending.

![move to trash](https://webui.docs.backend.ai/en/latest/_images/move_to_trash.png)

In this status, you can restore the folder by clicking restore button in Control column. If you want to permanently delete the folder, please click 'trash bin' button in the same column.

![trash tab list](https://webui.docs.backend.ai/en/latest/_images/vfolder_trash_list.png)

A confirmation modal will pop up with an input field saying `Type folder name to delete`. Make sure you type the exact folder name correctly into the field, and click the red 'DELETE FOREVER' button to permanently delete the folder.

[![Folder deletion dialog](https://webui.docs.backend.ai/en/latest/_images/vfolder_delete_dialog.png)](https://webui.docs.backend.ai/en/latest/_images/vfolder_delete_dialog.png)



You may need to share the contents of storage folders with other users or project members to collaborate. For this purpose, Backend.AI provides flexible folder sharing feature.\
\
