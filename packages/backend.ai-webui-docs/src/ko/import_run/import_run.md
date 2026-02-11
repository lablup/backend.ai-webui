# Jupyter notebook과 웹 기반 Git 저장소 불러오기 및 실행


'가져오기 & 실행' 페이지 에서, 즉석으로 Jupyter notebook 파일을 실행하거나 GitHub, GitLab 과 같은 웹 기반 Git 저장소를 가져올 수 있습니다. 파일을 받거나 실행하기 위해 로컬 저장소에서 직접 생성하거나 다운로드 받고 다시 업로드하지 않아도 됩니다. 유효한 URL 을 입력하고 각 기능에 해당하는 패널의 우측에 있는 버튼을 클릭하기만 하면 됩니다.

## Jupyter notebook 파일 가져오기 및 실행

Jupyter notebook 파일을 가져와서 실행하기 위해서는 notebook 파일에 대한 유효한 URL이 필요합니다. GitHub에 있는 Jupyter notebook을 실행하고자 한다면, 입력 필드에 해당 파일의 URL을 복사해서 붙여넣은 뒤, '가져와서 실행' 버튼을 클릭하면 됩니다.


로컬 주소의 Jupyter notebook 파일을 불러와서 실행할 경우 실행이 되지 않습니다. localhost로 시작되는 주소 이외의 URL을 입력해주십시오.
``
![](images/import_run_notebook.png)

After clicking the button, the dialog appears. This is a session launcher dialog same as
when you starts the session at Sessions page or Summary page. Difference between import notebook
and starting a new session is that import notebook automatically imports Jupyter notebook in the
URL, but simple starting a new session doesn't do that. the rest is same. Click 'LAUNCH' button to
the notebook after setting the environments and resource allocation as needed.


   The pop-up blocker must be turned off before clicking 'LAUNCH' button to immediately
   see the running notebook window. Also, if there's not enough resources to execute the session,
   imported Jupyter notebook will not run.

![](images/session_launcher_in_importing_notebook.png)

You can see the importing operation is successfully completed in Sessions page.

![](images/sessions_page_with_imported_notebook.png)

## Create executable Jupyter notebook button

You can also create HTML or Markdown button about Jupyter notebook URL, too.
Input a valid Jupyter notebook URL and click 'CREATE' button. It will show code blocks that directly
links to creating a session with notebook. You can see the badge code working by inserting it in
the GitHub repositories or where it supports html or markdown.


your account must be logined before clicking the button. Otherwise, you have to login first.
``
![](images/create_notebook_button.png)


## Importing GitHub Repositories

Importing a GitHub repository is similar to import and running Jupyter notebook.
All you have to do is to fill out with github repository URL and click 'GET TO
FOLDER' button. If you can access to more than one storage host, you can select one from the list.

![](images/import_github_repository.png)


If there are not enough resources to start a session or folder count is at
the limit, then importing repository will fail. Please check resource
statistics panel and Data & Storage page before importing the repository.
``
You can see the repository is successfully imported as a data folder with its
name.

![](images/import_github_repository_result.png)


## Importing GitLab Repositories

From 22.03, Backend.AI supports importing from GitLab. It's almost the same as
[Importing GitHub Repositories<importing-github-repositories>](#Importing GitHub Repositories<importing-github-repositories>),
but you need to explicitly set the branch name to import.

![](images/import_gitlab_repository.png)


If there's data folder that has the same name already, the system will append
`_` (underscore) and number in the imported repository folder.
``