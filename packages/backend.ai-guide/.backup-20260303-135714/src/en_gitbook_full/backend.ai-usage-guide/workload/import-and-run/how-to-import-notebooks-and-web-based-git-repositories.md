---
title: How to import notebooks and web based Git repositories
order: 74
---
# How to import notebooks and web based Git repositories

Backend.AI supports on-the-fly execution of Jupyter notebook files and direct import of web-based Git repositories, such as GitHub and GitLab. Simply enter a valid URL for the notebook or repository to be executed or imported, and click the corresponding button on the right panel to proceed. There is no need to create, download, or upload files manually to local storage.

## Import and run Jupyter notebooks

:::info
**Note**

When attempting to use the **IMPORT & RUN** with a Jupyter notebook file that has a local address, the URL will be considered invalid. URLs that do not begin with `localhost` or other local addresses are accepted.
:::

<figure><img src="../../../images/image (4).png" alt=""><figcaption><p>Import Notebook card. [ /Import &#x26; Run/Import Notebook ]</p></figcaption></figure>

To import and execute Jupyter notebooks, a valid URL for the notebook file is required. For example, to run a Jupyter notebook hosted on GitHub, copy and paste the notebook’s URL and click the **Import & Run** button.

<figure><img src="../../../images/image (2) (1) (1) (1) (1) (1) (1).png" alt=""><figcaption><p>Invalid URL notice. [ /Import &#x26; Run/Import Notebook ]</p></figcaption></figure>

If the destination URL is not a valid notebook URL, a notification will appear below the input field. In this case, verify that the destination URL is correctly specified and points to a file with the `.ipynb` extension.

<figure><img src="../../../images/image (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1).png" alt=""><figcaption><p>Start a new session page [ /sessions/Start new session ]</p></figcaption></figure>

After clicking the **Import & Run** button, the session launcher page will appear. This page is identical to the one used when starting a session from the Sessions or Summary page. The primary difference is that importing a notebook automatically retrieves the Jupyter notebook from the specified URL, whereas starting a new session does not perform this import. All other steps remain the same. Configure the environment and resource allocation as needed, then click the **Launch** button at the bottom to start the notebook.

:::danger
**Warning**

Ensure that the pop-up blocker is disabled before clicking the **Launch** button to allow the running notebook window to open immediately. Additionally, if sufficient resources are not available to execute the session, the imported Jupyter notebook will not run.
:::

<figure><img src="../../../images/스크린샷 2025-04-15 151133.png" alt=""><figcaption><p>Session List [ /sessions ]</p></figcaption></figure>

The newly created session will appear in the session list, and Jupyter Notebopok will run.

## Create Executable Jupyter Notebook Button

<figure><img src="../../../images/스크린샷 2025-04-15 153630 (1).png" alt=""><figcaption><p>Create a Notebook Buttom [ /Import &#x26; Run ]</p></figcaption></figure>

It is also possible to generate an HTML or Markdown button for a Jupyter notebook URL. Enter a valid Jupyter notebook URL and click the **< > Create** button. Code blocks will be generated below, providing a direct link to create a session with the specified notebook. The badge code can be embedded in GitHub repositories or any platform that supports HTML or Markdown.

:::info
**Note**

An active login session is required before clicking the button.\
If not already logged in, authentication must be completed first.
:::

### Import GitHub Repositories

<figure><img src="../../../images/image (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1).png" alt=""><figcaption></figcaption></figure>

Importing a GitHub repository follows a process similar to importing and running a Jupyter notebook. Enter the GitHub repository URL and click the **GET TO FOLDER** button. If multiple storage hosts are available, select the desired host from the list.

:::danger
Warning

If sufficient resources are not available to start a session, or if the folder count has reached its limit, the repository import might fail. It is recommended to check the resource statistics panel and the Data page before importing a repository.
:::

<figure><img src="../../../images/스크린샷 2025-04-15 155247.png" alt=""><figcaption><p>Folders [ /Data ]</p></figcaption></figure>

The repository will be successfully imported as a data folder named after the repository.

## Importing GitLab Repositories

<figure><img src="../../../images/image (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1).png" alt=""><figcaption><p>Import GitLab Repository [ /Import &#x26; Run ]</p></figcaption></figure>

Starting from version 22.03, Backend.AI supports importing repositories from GitLab. The process is similar to [importing GitHub repositories](how-to-import-notebooks-and-web-based-git-repositories.md#import-github-repositories); however, the branch name must be explicitly specified when importing from GitLab.

:::info
**Note**

If a data folder with the same name already exists, the system will append an underscore and a number to the imported repository folder name.
:::
