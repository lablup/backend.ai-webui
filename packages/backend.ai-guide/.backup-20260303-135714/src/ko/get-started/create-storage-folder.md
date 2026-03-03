---
title: Create Storage Folder
order: 48
---
# Create Storage Folder

## Create storage folder

You can create a storage folder with the desired name by clicking the 'Create Folder' button. Enter the name of the folder to be created in Folder name, and select one of User / Project for Type. (Depending on the server settings, only one of User or Project may be selectable.) If you selected a project folder, the select project field will appear. The project folder will be bound to the project specified in the Project field, and only users belonging to the project can mount and use the project folder. After setting the values as desired, you can create a folder by clicking the 'CREATE' button.

[![Folder creation dialog](https://webui.docs.backend.ai/en/latest/_images/vfolder_create_modal.png)](https://webui.docs.backend.ai/en/latest/_images/vfolder_create_modal.png)

The meaning of each fields that can be selected in the creation dialog is as follows.

* Folder name: The name of the folder. You can enter up to 64 characters.
* Location: NFS host to create folder. You can choose one if you have multiple NFS hosts. You can check whether the selected host has enough capacity remaining through the indicator.
* Usage Mode: You can set the purpose of the folder. There are three types of mode: General, Data, and Model. It is classified for the development of exclusive functions for Data & Model Stores in the future and currently there is no difference in UI depending on the purpose.
* Type: Determines the type of folder to be created. It can be set as User or Project. The User folder is a folder that users can create and use alone and the Project folder is a folder created by admin and shared by users in the project.
* Project: Shown only when you select project type. Designates the project to which the folder belongs when creating a new project folder. Project folders must belong to a project. However, it does not play any role when creating a user folder.
* Permission: Set permission of a project folder for project members. If this is set to "Read-Only", project members cannot write to this folder inside their compute session.
* Cloneable: Shown only when you select usage model to "Model". Select whether the vfolder you are creating should be cloneable.

The folders created here can be [mounted](https://webui.docs.backend.ai/en/latest/mount_vfolder/mount_vfolder.html#session-mounts) when creating a compute session. Folders are mounted under the user's default working directory, `/home/work/`, and the file stored in the mounted directory will not be deleted when the compute session is terminated. (If you delete the folder, the file will also be deleted.)
