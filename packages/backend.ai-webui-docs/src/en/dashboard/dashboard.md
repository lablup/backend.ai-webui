---
navTitle: Dashboard
---

# Dashboard

The **Dashboard** is the page you land on after signing in. It is made up of
cards, and the cards at the top are shortcuts to the tasks you usually start
with. Each one names a task, describes it in a sentence, and has a button that
starts it:

- **Start Interactive Session**:
    Click **Start Session** to open the session launcher, where you pick an
    environment and resources and work with your code interactively.

- **Start Batch Session**:
    Click **Start Session** to open the session launcher with the session type
    set to batch, for a command that runs to completion on its own.

- **Create New Storage Folder**:
    Click **Create Folder** to create a storage folder for the files and data
    your sessions use.

- **Start Deployment**:
    Click **Create Deployment** to serve a trained model so that others can use
    it. This card appears only when your administrator has enabled model
    serving.

- **Start From URL**:
    Click **Start Now** to start a session from a Jupyter notebook, a GitHub or
    GitLab repository, or a Hugging Face model, given its URL.

![](../images/dashboard.png)

The cards below them summarize your sessions, resource usage and recent
activity in the current project:

- **My Sessions**:
    Shows your sessions in the current project by status,
    and the active ones by session type such as *Interactive*, *Batch*,
    *Inference*, and *Upload*.

- **My Recent Sessions**:
    Lists the sessions you created most recently, newest first.

- **My Total Resource Usage**:
    Shows what your sessions use across all resource groups and projects.
    When multiple limits (domain, project, or keypair) apply,
    the **most restrictive** one takes effect.

- **My Resources in Resource Group**:
    Shows how much resource you have used and how much is still free
    in the card's resource group.

- **Total Resources in Resource Group**:
    Summarizes the used and free resources of the card's resource group.
    The data is aggregated from all agents that belong to the group.

- **Agent Statistics**:
    Shows the total resources of all agents in the system.

- **Quota per storage volume**:
    Shows the quota available on each storage volume.
    When no storage host supports quota, the card shows a notice instead.

- **My Deployments**:
    Lists your model deployments with the health of their replicas.

- **My Activity**:
    Lists your own audit log entries for the period the card is set to.

:::note
The **Total Resources in Resource Group** and **Agent Statistics** cards may not
be visible depending on your system configuration.
:::

Project admins and superadmins also have a **Dashboard** of their own in the
admin menu, with cards for the project or for the whole cluster.

## Customizing the Dashboard Layout

You can rearrange the board at any time — there is no mode to enter first:

- **Move cards**: Drag a card by its header to reposition it on the board.
- **Resize cards**: Drag the bottom-right corner of a card to adjust its
  size. Each card has a minimum size to ensure its content remains readable.

Click **Edit** to open the edit sidebar, and **Close** to hide it again. The
sidebar lists every card the page offers, grouped by topic: select a card to
put it on the board, and clear it to take it off.

![](../images/dashboard_edit_mode.png)

Your arrangement is saved to your account on the server, so it follows you to
every browser you sign in from. To discard it and restore the default cards
and arrangement, click the **Reset layout** button at the bottom of the edit
sidebar and confirm. Resetting the layout does not remove your custom panels.

:::tip
When the WebUI is updated with new dashboard cards, those cards will
automatically appear on your dashboard even if you have a saved layout.
:::

### Card Settings

A card that reads a resource group or a time range keeps a saved default.
Open **Default card settings** for that card in the edit sidebar to choose the
values the board opens with; the picker in the card's header changes them for
the current visit only.

### Custom Panels

The edit sidebar also lists your custom panels. A custom panel shows a data
source you select, narrowed by a condition you define. The panel itself shows
only a title and its data, so give the panel a title that describes its
condition.

To add a panel, click the **Add** button in the sidebar. The panel dialog
contains the following fields. **Panel type** and **Data source** are
required — the dialog will not submit until both are chosen.

- **Data source**: The data source the panel lists. Choose **Sessions**,
  **Deployments**, or **Data & Storage**.
- **Panel type**: How the panel displays the data source. Choose **Table** or
  **Count**. For the **Sessions** data source, **Grid** is also offered.
- **Title**: An optional panel title. When omitted, the data source name is
  used.
- **Condition**: A property filter that narrows the rows shown in the panel.

A live preview below the fields shows the rows matching the current condition.
Sorting a column in the preview sets the panel's sort order. Click **Add** to
place the panel on the board.

![](../images/dashboard_panel_modal.png)

**Deployments** panels list the project's model deployments, using the same
table as the Deployments page: name, status, replica summary, model, and
created at. Clicking a deployment's name opens its detail page.

**Grid** shows the session resource grid: each matching session's allocated
resources as unit cells, colored by utilization. Clicking a session opens its
detail drawer, the same as clicking a row in the table. The grid shows at most
the first 100 matching sessions; a notice appears when there are more.

The grid's display settings — resource or kernel mode, which resource or
metric to show, memory unit, and layout — are chosen in the Add/Edit panel
dialog's live preview and saved with the panel. The panel itself shows no
controls for these settings, so create a second panel if you want a different
view.

:::note
**Grid** is an experimental feature. It is offered in the **Panel type**
selector only when **Session resource grid view** is turned on under
[Experimental features](#experimental-features). If it is turned off later,
existing Grid panels keep their saved configuration but display as the
session table until the setting is turned back on.
:::

To change a panel's data source, panel type, condition, or title later, click
the pencil (**Edit**) icon next to the panel in the sidebar — or in the
panel's header on the board — and save your changes. To remove a panel, click
the trash (**Delete**) icon and confirm in the popup.

:::note
**Sessions** and **Deployments** panels list data for the current project and
are available to every project member. **Data & Storage** panels are
available to superadmins only. A panel whose data source your role cannot
query remains listed in the sidebar but is not shown on the board.
:::

## Automatic Refresh

The refresh control on the dashboard bar sets how often every card refreshes —
**Off**, or an interval from 5 seconds to 10 minutes — and refreshes every card
at once when you click it.
