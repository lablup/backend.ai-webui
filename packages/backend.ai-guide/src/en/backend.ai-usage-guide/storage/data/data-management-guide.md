---
title: Data
order: 59
---
# Data

## Handling Data & Storage Folders

Backend.AI provides dedicated storage to preserve user files. As all files and directories within a compute session are deleted upon session termination, it is recommended to save important data in a storage folder. The list of storage folders can be accessed by navigating to the **Data** page in the sidebar. Information such as folder name and ID, the NFS host name where the folder is located (Location), and folder access permissions (Permission) are displayed for each storage folder.

<figure><img src="../../../images/image (3).png" alt=""><figcaption></figcaption></figure>

Data page

* Action card
* Monitor card
*











For detailed information about creating, deleting, renaming, sharing folders, please refer to the [how-to-create-rename-update-delete-storage-folders.md](how-to-create-rename-update-delete-storage-folders.md "mention")



There are two types of storage folders, `user` and `project`.

User folders can be created by normal users, and you can see that there is one user button in the Type column. On the other hand, Project folders can be recognized by an button with multiple users in the column. Project folders are created by domain admins, and normal users can only see project folders created for the project in which the users belong.



## About Monitor Card

<figure><img src="../../../images/image (1) (1) (1) (1) (1) (1).png" alt=""><figcaption></figcaption></figure>













The Storage Status and Quota per storage volume show the following information:

* Storage Status
  *   Created Folders: The number of folders that the user created.

      > * Limit: The maximum number of folders that the user can create afterwards. This value depends on the resource policy applied to the user and cannot be changed without changing the resource policy. Folders that were not created by the user (eg. folders invited to share, or project folders) are not counted.
  * Project Folders: The number of project folders that the user created.
  * Invited Folders: The number of folders that the user was invited to share.
* Quota per storage volume
  * Host: The name of the storage host.
  * Project: Current project folder usage / current project folder quota scope.
  * User: Current user folder usage / current user folder quota scope.

:::info
**Note**

Please remind that quota is only available in storage that provides quota setting (e.g. XFS, CephFS, NetApp, Purestorage, etc.). For the quota setting, please refer to the [Quota Setting Panel](https://webui.docs.backend.ai/en/latest/admin_menu/admin_menu.html#quota-setting-panel) section.
:::
