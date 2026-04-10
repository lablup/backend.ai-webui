<a id="my-environments"></a>

# My Environments

From 24.03, a new \"My Environments\" page for users has been introduced.
This page displays contents such as a list of images created by the user's
[session commits](#save-session-commit).

On the Images tab of the My Environments page, users can manage customized
images used in creating compute sessions. This tab displays metadata information
of images converted from computational sessions to images. User can view details
such as the registry, architecture, namespace, language, version, base,
constraint, digest, and other information for each image.


<a id="delete-customized-image"></a>

To delete an image, click on the red trash button in the control column.
After deletion, you will not be able to create a new session using that image.

![](../images/my_environments.png)

You can also copy the image name and create a session with a manual image.
Click the copy icon next to the image name in the Full image path column to copy it to
your clipboard. Then go to the Sessions page and create a session.
Fill in the manual image input field by pasting the image name that you copied.

![](../images/copy_image_name_manual.png)

If you want to hide or show the certain columns, click the gear icon at the
bottom right of the table. Then you can see below dialog to select the columns
you want to see.

![](../images/table_setting.png)