# FAQs & Troubleshooting

## User troubleshooting guide

### Session list is not displayed correctly

Due to intermittent network problems and/or other various reasons, session list
may not be displayed correctly. Most of the time, this problem will disappear just by
refreshing the browser.

- Web-based Web-UI: Refresh the browser page (use the shortcut provided by
  browsers such as Ctrl-R). Since the browser's cache may cause troubles
  sometimes, it is recommended to refresh the page bypassing the cache
  (such as Shift-Ctrl-R, but the keys may differ in each browser).
- Web-UI App: Press Ctrl-R shortcut to refresh the app.

### Suddenly, I cannot login with my account

If there are problems in recognizing authentication cookies, users may not be able to login temporarily. Try
to login with private browser window. If it succeeds, please clear your
browser's cache and/or application data.


### How to install apt packages?

Inside a compute session, users cannot access `root` account and perform
operations that require `sudo` privilege for security reasons. Therefore, it
is not allowed to install packages with `apt` or `yum` since they require
`sudo`. If it is really required, you can request to admins to allow `sudo`
permission.

Alternatively, users may use Homebrew to install OS packages. Please refer to
the [guide on using Homebrew with automount
folder<using-linuxbrew-with-automountfolder>](#guide on using Homebrew with automount
folder<using-linuxbrew-with-automountfolder>).


### How to install packages with pip?

By default, when you install a pip package, it will be installed under
`~/.local`. So, if you create a automount data folder named `.local`, you
can keep the installed packages after a compute session is destroyed, and then
reus them for the next compute session. Just install the packages with pip like:

``shell
$ pip install aiohttp
``
For more information, please refer to the [guide on installing Python
packages with automount folder<using-pip-with-automountfolder>](#guide on installing Python
packages with automount folder<using-pip-with-automountfolder>).

### I have created a compute session, but cannot launch Jupyter Notebook

If you installed a Jupyter package with pip by yourself, it may be conflict with
the Jupyter package that a compute session provides by default. Especially, if you
have created `~/.local` directory, the manually installed Jupyter packages
persists for every compute session. In this case, try to remove the `.local`
automount folder and then try to launch Jupyter Notebook again.

### Page layout is broken

Backend.AI Web-UI utilizes the latest modern JavaScript and/or browser features.
Please use the LATEST versions of moder browsers (such as Chrome).

### SFTP disconnection

When Web-UI App launches SFTP connection, it uses a local proxy server which is
embeded in the App. If you exit the Web-UI App during the file transfer with
SFTP protocol, the transfer will immediately fail because the connection
established through the local proxy server is disconnected.  Therefore, even if
you are not using a compute session, you should not quit the Web-UI App while
using SFTP. If you need to refresh the page, we recommend using the Ctrl-R
shortcut.

If the Web-UI App is closed and restarted, the SFTP service is not
automatically initiated for the existing compute session. You must explicitly
start the SSH/SFTP service in the desired container to establish the SFTP
connection.


## Admin troubleshooting guide

### Users cannot launch apps like Jupyter Notebook

There may be a problem on connecting WSProxy service. Try to stop and restart
the service by referencing the guide on start/stop/restart WSProxy service.

### Indicated resources do not match with actual allocation

Occasionally, due to unstable network connections or container management
problem of Docker daemon, there may be a case where the resource occupied by
Backend.AI does not match with the resource actually used by the container. In this
case, follow the steps below.

- Login as admin account.
- Visit Maintenance page.
- Click the RECALCULATE USAGE button to manually correct the resource occupancy.

### Image is not displayed after it is pushed to a docker registry


   This feature is only available for superadmins.

If a new image is pushed to one of the Backend.AI docker registries, the image
metadata must be updated in Backend.AI to be used in creating a compute session.
Metadata update can be performed by clicking the RESCAN IMAGES button on the
Maintenance page. This will update metadata for every docker registry, if
there are multiple registries.

If you want to update the metadata for a specific docker registry, you can go to
the Registries tab in Environments page.  Just click the refresh button in the
Controls panel of the desired registry. Be careful not to delete the registry
by clicking the trash icon.