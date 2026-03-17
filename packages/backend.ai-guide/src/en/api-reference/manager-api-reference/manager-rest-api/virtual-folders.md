---
title: Virtual Folders
order: 167
---
# Virtual Folders

Virtual folders (also known as storage folders or vfolders) provide persistent storage that survives session termination. You can use these APIs to create, list, manage, and transfer files within virtual folders.

## Listing Virtual Folders

- URI: `/folders`
- Method: `GET`

Returns a list of all virtual folders accessible to the requesting user, including both personal folders and shared project folders.

### Parameters

This endpoint does not require any request body parameters.

### Response

| HTTP Status Code | Description |
| --- | --- |
| 200 OK | The list of virtual folders is successfully returned. |
| 401 Unauthorized | Authentication failed or the authorization header is missing. |

The response body is a JSON array of folder objects:

| Field | Type | Description |
| --- | --- | --- |
| `name` | `str` | The name of the virtual folder. |
| `id` | `str` | The unique identifier (UUID) of the folder. |
| `host` | `str` | The storage host where the folder resides. |
| `usage_mode` | `str` | The usage mode: `"general"`, `"model"`, or `"data"`. |
| `permission` | `str` | The access permission level: `"rw"` (read-write), `"ro"` (read-only), `"wd"` (write-delete). |
| `is_owner` | `bool` | Whether the requesting user is the owner of this folder. |
| `created_at` | `str` | The creation timestamp in ISO 8601 format. |

**Example Response:**

```json
[
  {
    "name": "my-data",
    "id": "aef1b2c3-d4e5-6789-abcd-ef0123456789",
    "host": "local:volume1",
    "usage_mode": "general",
    "permission": "rw",
    "is_owner": true,
    "created_at": "2023-06-15T10:30:00+00:00"
  },
  {
    "name": "shared-models",
    "id": "bcd2e3f4-a5b6-7890-cdef-012345678901",
    "host": "local:volume1",
    "usage_mode": "model",
    "permission": "ro",
    "is_owner": false,
    "created_at": "2023-05-01T08:00:00+00:00"
  }
]
```

## Creating a Virtual Folder

- URI: `/folders`
- Method: `POST`

Creates a new virtual folder on the specified storage host.

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `name` | `str` | The name of the folder. Must be unique within the user's scope. Allowed characters: alphanumeric, hyphens, and underscores. |
| `host` | `str` | The storage host on which to create the folder (e.g., `"local:volume1"`). |
| `usage_mode` | `str` | (optional) The intended usage mode: `"general"` (default), `"model"`, or `"data"`. |
| `permission` | `str` | (optional) The default permission for the folder: `"rw"` (default), `"ro"`, or `"wd"`. |
| `group` | `str` | (optional) The project name. If specified, creates a project folder instead of a personal folder. |

**Example Request:**

```json
{
  "name": "my-experiment-data",
  "host": "local:volume1",
  "usage_mode": "general",
  "permission": "rw"
}
```

### Response

| HTTP Status Code | Description |
| --- | --- |
| 201 Created | The virtual folder is successfully created. |
| 400 Bad Request | Invalid folder name or parameters. |
| 409 Conflict | A folder with the same name already exists. |

| Field | Type | Description |
| --- | --- | --- |
| `id` | `str` | The unique identifier (UUID) of the newly created folder. |
| `name` | `str` | The name of the created folder. |
| `host` | `str` | The storage host where the folder was created. |

## Getting Folder Information

- URI: `/folders/:name`
- Method: `GET`

Retrieves detailed information about a specific virtual folder.

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `:name` | `str` | The name of the virtual folder. |

### Response

| HTTP Status Code | Description |
| --- | --- |
| 200 OK | The folder information is successfully returned. |
| 404 Not Found | No folder with the specified name exists. |

The response body contains the same fields as the folder objects returned by the list endpoint, plus additional details:

| Field | Type | Description |
| --- | --- | --- |
| `numFiles` | `int` | The number of files in the root directory of the folder. |
| `max_size` | `int` | The maximum allowed size of the folder in bytes (quota), if configured. |
| `cur_size` | `int` | The current total size of the folder in bytes. |

## Deleting a Virtual Folder

- URI: `/folders/:name`
- Method: `DELETE`

Permanently deletes a virtual folder and all of its contents.

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `:name` | `str` | The name of the virtual folder to delete. |

### Response

| HTTP Status Code | Description |
| --- | --- |
| 204 No Content | The folder is successfully deleted. |
| 404 Not Found | No folder with the specified name exists. |

:::danger
Deleting a virtual folder is **irreversible**. All files and directories within the folder will be permanently removed. Make sure to back up any important data before deleting a folder.
:::

## Uploading Files

- URI: `/folders/:name/upload`
- Method: `POST`

Uploads one or more files to the specified virtual folder. The request must use `multipart/form-data` encoding.

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `:name` | `str` | The name of the virtual folder. |
| `src` | `file` | The file(s) to upload, sent as multipart form data. Multiple files can be included. |
| `path` | `str` | (optional) The subdirectory path within the folder to upload to. Defaults to the root directory. |

### Response

| HTTP Status Code | Description |
| --- | --- |
| 201 Created | The file(s) are successfully uploaded. |
| 404 Not Found | No folder with the specified name exists. |
| 413 Payload Too Large | The uploaded file exceeds the server's size limit. |

:::note
For large file uploads, consider using the tus (resumable upload) protocol if your Backend.AI deployment supports it. This prevents failed uploads due to network interruptions.
:::

## Downloading Files

- URI: `/folders/:name/download`
- Method: `GET`

Downloads one or more files from the specified virtual folder.

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `:name` | `str` | The name of the virtual folder. |
| `files` | `list[str]` | A JSON-encoded list of file paths (relative to the folder root) to download. |

### Response

| HTTP Status Code | Description |
| --- | --- |
| 200 OK | The file content is returned in the response body. |
| 404 Not Found | The folder or the specified file does not exist. |

When downloading a single file, the response body contains the raw file content. When downloading multiple files, the server returns a zip archive.

## Creating a Directory

- URI: `/folders/:name/mkdir`
- Method: `POST`

Creates a new subdirectory inside the specified virtual folder.

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `:name` | `str` | The name of the virtual folder. |
| `path` | `str` | The path of the directory to create, relative to the folder root. Nested paths (e.g., `"subdir/nested"`) are supported. |

**Example Request:**

```json
{
  "path": "experiments/run-001"
}
```

### Response

| HTTP Status Code | Description |
| --- | --- |
| 201 Created | The directory is successfully created. |
| 404 Not Found | No folder with the specified name exists. |
| 409 Conflict | A directory with the same path already exists. |

## Listing Folder Contents

- URI: `/folders/:name/files`
- Method: `GET`

Lists the files and subdirectories within a virtual folder.

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `:name` | `str` | The name of the virtual folder. |
| `path` | `str` | (optional) The subdirectory path to list. Defaults to the root directory. |

### Response

| HTTP Status Code | Description |
| --- | --- |
| 200 OK | The directory listing is successfully returned. |
| 404 Not Found | The folder or the specified path does not exist. |

| Field | Type | Description |
| --- | --- | --- |
| `files` | `list[object]` | A list of file/directory entries. |
| `files[].filename` | `str` | The name of the file or directory. |
| `files[].type` | `str` | Either `"FILE"` or `"DIRECTORY"`. |
| `files[].size` | `int` | The size of the file in bytes (0 for directories). |
| `files[].created` | `str` | The creation timestamp. |
| `files[].modified` | `str` | The last modification timestamp. |

:::info
Virtual folders can be mounted into compute sessions at creation time. When a folder is mounted, its contents are accessible at `/home/work/<folder-name>/` inside the session container. See [Session Management](session-management.md) for details on mounting folders during session creation.
:::
