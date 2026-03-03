---
title: Summary
order: 56
---
# Summary

Summary tab in Backend.AI provides an at-a-glance overview and management interface for system hardware resources, user invitations, and desktop application downloads. This section is designed to help users and administrators efficiently monitor resource usage, manage access, and set up their working environment.



## **Main Components and Descriptions**

### **Resource Statistics**

The Resource Statistics panel displays both the total resources available for allocation and the resources currently in use within the selected resource group. Users can monitor their CPU, memory (RAM), and GPU (FGPU) usage and quotas, as well as the number of compute sessions they are permitted to run concurrently and how many are currently active.

#### **Key Features:**

* **Resource Group Selection:**\
  At the top of the panel, users can select a resource group. A resource group is a logical grouping of multiple agent nodes, managed as a single resource unit. This allows organizations to allocate specific nodes to different projects or teams. If only one agent node exists, only one resource group will be visible. Changing the resource group updates the displayed resource quotas and usage according to the resources assigned to that group.
* **Resource Utilization:**\
  Progress bars and numerical indicators show the current and maximum allocation for CPU cores, RAM, GPUs, and active sessions.
* **Legend:**\
  Colored indicators distinguish the current resource group’s limits and the user’s personal quota.

***

### **System Resources**

The System Resources panel provides a summary of the Backend.AI infrastructure’s status, including the number of connected agent nodes and the total number of active compute sessions.

#### **Key Features:**

* **Connected Nodes:**\
  Shows the total number of agent worker nodes currently connected to the Backend.AI system.
* **Active Sessions:**\
  Displays the total number of compute sessions currently running across all users.
* **Resource Utilization:**\
  Visual bars and numbers indicate reserved, used, and total resources for CPU, memory, and GPU/NPU. If logged in as a standard user, only your own compute sessions are shown.

***

### **Invitation**

The Invitation panel lists any pending invitations to access storage folders shared by other users.

#### **Key Features:**

* **Shared Folder Access:**\
  When another user shares a storage folder with you, the invitation appears here. Accepting an invitation grants access to the shared folder in your Data & Storage section, with permissions set by the sharing user. You may also decline invitations.

***

### **Download Desktop App**

Download Desktop App panel enables users to download the Backend.AI Web UI desktop application for their operating system. This desktop app itself is a customed web-browser that can run only Backend.AI. It supports Windows, Linux, and MacOS, and users can choose their preferred architecture based on their device.

:::info
**Notes**

If you are using Backend.AI version 23.09 or earlier, Desktop App is required to enable SSH/SFTP connections. Starting from version 24.03, [SSH/SFTP connections](../workload/sessions/ssh-sftp-connection-to-a-compute-session.md) are supported in both the Web browser and the WebUI Desktop application.
:::

***

### **Action Buttons**

There are 4 different action buttons at the bottom of the summary card. These shortcuts allow users to quickly perform key operations related to system resources, reducing navigation steps within the service and enhancing intuitive usability.

* **Update environment images:**\
  Opens a page to update or manage the environment images used for compute sessions.
* **Check resources:**\
  Performs a real-time status check of system resources.
* **Change system setting:**\
  Accesses system configuration options for administrators.
* **System maintenance:**\
  Opens tools and options for system fixes and image/environment health management.
