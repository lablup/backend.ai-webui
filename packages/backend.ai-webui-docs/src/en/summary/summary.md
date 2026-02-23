:::warning
This feature is deprecated, so please use the [dashboard](../dashboard/dashboard.md) page going forward. Also, technical support and bug fixes for this feature are no longer provided. Please understand that issues may not be addressed.
:::

# Summary Page

On the Summary page, users can check resource status and session usage.

![](../images/summary.png)

### Resource Statistics

It shows the total amount of resources the user can allocate and the amount of
resources currently allocated. You can check the user's CPU, memory, and GPU
resource occupancy and quota respectively. Also on the Sessions slider, you can
see the maximum number of compute sessions you can create simultaneously and how many
compute sessions are currently running.

You can change the resource group by clicking the Resource Group field at the
top. Resource group is a concept to group multiple Agent nodes as a single
resource unit. If you have many agent nodes, you can configure settings such as
assigning them to a specific project for each resource group. When there is only
one agent node, it is normal to see only one resource group. If you change the
resource group, the amount of resources may change depending on the amount of
resources held by that resource group (agents belong to it).

### System Resources

It shows the number of Agent worker nodes connected to the Backend.AI system and
the total number of compute sessions currently created. You can also check the
CPU, memory, and GPU utilization of the agent node. If you are logged in as a
normal user, only the number of compute sessions you have created is displayed.

### Invitation

If another user has shared their storage folder to you, it will be displayed
here. If you accept the share request, you can view and access the shared folder
in the Data & Storage folder. The access rights are determined by the user who has sent the share request.
Of course, you can decline the sharing requests.

### Download Backend.AI Web UI App

Backend.AI WebUI supports desktop applications.
By using desktop app, you can use desktop app specific features, such as [SSH/SFTP connection to a Compute Session](../sftp_to_container/sftp_to_container.md#ssh-sftp-container).
For now Backend.AI WebUI provides desktop application with following OS:

- Windows
- Linux
- Mac


:::note
When you click the button that match with your local environment (e.g. OS, Architecture), It will automatically downloads the same version of current webUI version.
If you want to download later or former version of WebUI as a desktop app, please visit [here](https://github.com/lablup/backend.ai-webui/releases?page=1) and download the desired version(s).
:::