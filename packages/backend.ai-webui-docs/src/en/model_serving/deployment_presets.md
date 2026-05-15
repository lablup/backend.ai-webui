<a id="deployment-presets"></a>

# Deployment Presets

A **Deployment Preset** is a reusable, administrator-curated bundle of deployment settings — image, runtime, resource slots, cluster mode, environment variables, startup command, replica count, visibility, and other defaults — that end users can apply when they create a model deployment from a storage folder. Presets let administrators publish a small set of vetted, known-good deployment shapes (for example, *vLLM-GPU-Large* or *SGLang-CPU-Small*) so that end users can deploy a model without having to choose every advanced field from scratch.

![](images/deployment_preset_list.png)
<!-- TODO: Capture screenshot of the deployment preset list (user view) -->

:::info
Deployment Presets are part of the Model Serving feature set introduced in version 26.4. Cross-references to preset-aware revision creation are documented in the [Model Serving](#model-serving) page.
:::

## What Is a Deployment Preset?

A Deployment Preset captures the defaults of a model deployment so that:

- **Administrators** can offer end users a curated catalog of deployment shapes that match the organization's hardware and policy constraints.
- **End users** can pick a preset when deploying a model from the Data page (via the *Create New Deployment with Preset* flow) and skip filling in advanced fields manually.
- **Operators** can ensure that production deployments use consistent resource allocations, runtimes, and visibility defaults across the organization.

When a deployment is created from a preset, the preset's values pre-populate the deployment launcher fields. Users can still review and adjust those fields before confirming the deployment.

Each preset stores the following deployment defaults:

- **Basic Info**: Name, description, runtime variant, rank (display ordering).
- **Image**: The container image to deploy.
- **Resources**: Resource slots (CPU, memory, GPU), shared memory (SHM), and resource options.
- **Cluster**: Cluster mode (Single-Node or Multi-Node) and cluster size.
- **Execution**: Startup command, environment variables, and bootstrap script.
- **Deployment Defaults**: Replica count, revision history limit, and the *Open to Public* visibility default.
- **Advanced**: Model definition JSON (when needed for a custom runtime).

## (Admin) Manage Deployment Presets

Administrators manage deployment presets from the admin Model Serving area on the **Deployment Presets** tab.

![](images/admin_deployment_preset_list.png)
<!-- TODO: Capture screenshot of the admin deployment preset list -->

The list view shows each preset with its name, runtime, image, rank, and key resource fields. From this list, administrators can:

- Filter presets by name, runtime, or tag.
- Click a tag chip on any row to filter the list to presets sharing that tag.
- Open a preset's detail view to inspect its full configuration.
- Create, edit, or delete a preset.

### Create a Deployment Preset

1. Click the **Create Preset** button at the top right of the preset list.
2. Fill in the fields in the *Create Preset* dialog. The dialog is organized into the following sections:

   - **Basic Info**:
      * **Name**: A unique preset name (for example, `vLLM-GPU-Large`).
      * **Description**: A short summary of the preset's intended use.
      * **Runtime**: The runtime variant (for example, vLLM, SGLang, or Custom).
      * **Rank**: Display ordering among presets of the same runtime. Lower values appear first.
   - **Image**: The container image to use when deploying.
   - **Resources**: Resource slots (CPU, memory, GPU), shared memory, and resource options (key/value pairs).
   - **Cluster**: Cluster mode (Single-Node or Multi-Node) and cluster size.
   - **Execution**: Startup command, environment variables, and bootstrap script.
   - **Deployment Defaults**:
      * **Replica Count**: Default number of replicas created from this preset.
      * **Revision History Limit**: Number of past revisions kept for each deployment created from this preset.
      * **Open to Public**: Whether the endpoint of deployments created from this preset is reachable without an access token by default.
   - **Advanced** (optional): Model definition JSON for custom runtimes.

   ![](images/deployment_preset_create_modal.png)
   <!-- TODO: Capture screenshot of the deployment preset create modal -->

3. Click **Create Preset** to save. A success notification confirms the preset has been created.

:::tip
If a required field is missing or invalid, the **Create Preset** button stays disabled until the error is resolved. Required fields show inline validation messages as you type.
:::

### Edit a Deployment Preset

1. From the preset list, open the action menu on the preset row (or open the preset's detail view) and select **Edit Preset**.
2. The *Edit Preset* dialog opens with the preset's current values pre-filled. The available sections are identical to the *Create Preset* dialog.
3. Adjust the fields as needed, then click **Edit Preset** to save your changes.

![](images/deployment_preset_edit_modal.png)
<!-- TODO: Capture screenshot of the deployment preset edit modal (optional, same layout as create) -->

Editing a preset only changes the defaults for **future** deployments. Existing deployments that were already created from this preset are not modified.

### Delete a Deployment Preset

1. From the preset list (or the preset's detail view), open the action menu on the preset and select **Delete Preset**.
2. A typed-confirmation dialog appears asking you to type the preset's name to confirm. The **OK** button stays disabled until the typed value matches the preset name exactly.
3. Type the preset's name, then click **OK** to confirm.

:::danger
Deleting a deployment preset is **irreversible**. The preset itself is removed, but deployments that were already created from it continue to run unaffected. Future deployments can no longer reference this preset.
:::

## Using a Preset When Deploying a Model

End users apply a deployment preset through the **VFolder Deploy** modal, which opens when you deploy a model from a storage folder on the Data page.

1. From the Data page, locate the model folder you want to deploy and click **Deploy as Service**.
2. The VFolder Deploy modal opens, listing the deployment presets available for your project.
3. Click a preset row to open its **Deployment Preset Detail** view. The detail view shows every field that the preset will apply when used — image, runtime, resources, cluster mode, replica count, visibility, and so on.

   ![](images/vfolder_deploy_preset_detail.png)
   <!-- TODO: Capture screenshot of the deployment preset detail in the VFolderDeployModal -->

4. From the detail view, choose how to proceed:

   - **Auto-deploy**: Create the deployment immediately using the preset's values as-is. This is the fastest path; the deployment is created in one click with no further input required.
   - **Manual deploy** (*Create New Deployment with Preset*): Open the deployment launcher with all fields pre-populated from the preset, so you can review and adjust before confirming.

:::note
The active preset, tab key, and other navigation state are preserved in the URL via `URLSearchParams`. You can share a link to a specific preset's detail view, and the recipient lands on the same screen.
:::

## Pre-Populated Launcher Fields

When you choose the manual-deploy path, the deployment launcher opens with every field pre-filled from the selected preset:

- Image, runtime variant, and resource group.
- Resource slots, shared memory, and resource options.
- Cluster mode and cluster size.
- Startup command and environment variables.
- Replica count, revision history limit, and **Open to Public** visibility.
- Auto-selected resource preset, which is preserved across the launcher's initial-value resolution.

You can edit any pre-populated field before deploying. Editing a field does **not** modify the underlying preset — it only changes the values used for this one deployment. The preset's defaults remain unchanged for future deployments.

:::tip
If the auto-selected resource preset is the right one for your workload, leave it as-is. The launcher preserves the auto-selection across the initial-values pass, so you do not need to re-select it after switching presets.
:::

## Filtering by Tags

Both the user-facing preset list and the admin preset list support **clickable tag chips** that filter the list to presets sharing the clicked tag.

![](images/deployment_preset_tag_filter.png)
<!-- TODO: Capture screenshot of the deployment preset list filtered by a tag chip -->

1. Locate a preset row that has the tag you want to filter by.
2. Click the tag chip on that row.
3. The list refreshes to show only presets that include the selected tag. The active filter is reflected in the filter bar; clear it to return to the full list.

This is useful when you have many presets and want to quickly narrow down to, for example, all GPU-backed presets or all presets for a specific runtime family.
