---
title: Import & Run
order: 73
---
# Import & Run

:::info
The Import & Run page has been integrated into the **Start** page. Accessing the previous Import & Run URL automatically redirects to the Start page. The import functionality described below is available through the **Import from URL** card on the Start page.
:::

Backend.AI supports executing Jupyter notebook files and importing web-based Git repositories such as GitHub and GitLab on the fly. You do not need to download files to your local storage and re-upload them. Simply input a valid URL and click the corresponding button on the Start page.

## Import and Run Jupyter Notebooks

To import and run a Jupyter notebook, you need a valid URL pointing to the notebook file. For example, if you want to execute a Jupyter notebook hosted on GitHub, copy and paste the URL into the input field and click the **Import & Run** button.

:::note
Local addresses (starting with `localhost`) are not accepted. You must provide a publicly accessible URL.
:::

![](../../../images/import_run_notebook.png)

After clicking the button, the session launcher dialog appears. This is the same dialog used when starting a session from the Sessions page. The difference is that importing a notebook automatically loads the Jupyter notebook from the URL into the session. Configure the environment and resource allocation as needed, then click **Launch**.

:::note
The pop-up blocker must be turned off before clicking **Launch** to immediately see the running notebook window. If there are not enough resources to execute the session, the imported Jupyter notebook will not run.
:::

## Importing GitHub Repositories

You can import a GitHub repository by entering the repository URL and clicking the **Get to Folder** button. If you have access to more than one storage host, you can select one from the list.

![](../../../images/import_github_repository.png)

:::note
If there are not enough resources to start a session or the folder count has reached its limit, importing the repository will fail. Check the resource statistics panel and the Data page before importing.
:::

The repository is imported as a storage folder with its name.

## Importing GitLab Repositories

Backend.AI also supports importing from GitLab. The process is nearly the same as [importing GitHub repositories](#importing-github-repositories), but you need to explicitly set the branch name to import.

![](../../../images/import_gitlab_repository.png)

:::note
If a storage folder with the same name already exists, the system appends an underscore and number to the imported repository folder name.
:::
