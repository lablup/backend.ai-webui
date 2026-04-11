// @ts-nocheck
export class VFolder {
  public client: any;
  public name: any;
  public id: any;
  public urlPrefix: any;

  /**
   * The Virtual Folder API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   * @param {string} name - Virtual folder name.
   */
  constructor(client, name = null, id = null) {
    this.client = client;
    this.name = name;
    this.id = id;
    this.urlPrefix = '/folders';
  }

  /**
   * Get allowed types of folders
   *
   */
  async list_allowed_types(): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/_/allowed_types`,
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Create a Virtual folder on specific host.
   *
   * @param {string} name - Virtual folder name.
   * @param {string} host - Host name to create virtual folder in it.
   * @param {string} group - Virtual folder group name.
   * @param {string} usageMode - Virtual folder's purpose of use. Can be "general" (normal folders), "data" (data storage), and "model" (pre-trained model storage).
   * @param {string} permission - Virtual folder's innate permission.
   * @param {boolean} cloneable - Whether Virtual folder is cloneable or not.
   */
  async create(
    name,
    host = '',
    group = '',
    usageMode = 'general',
    permission = 'rw',
    cloneable = false,
  ): Promise<any> {
    let body;
    if (host !== '') {
      body = {
        name: name,
        host: host,
      };
    }
    if (group !== '') {
      body = {
        name: name,
        host: host,
        group: group,
      };
    }
    if (usageMode) {
      body['usage_mode'] = usageMode;
    }
    if (permission) {
      body['permission'] = permission;
    }
    body['cloneable'] = cloneable;
    let rqst = this.client.newSignedRequest('POST', `${this.urlPrefix}`, body);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Clone selected Virtual folder
   *
   * @param {json} input - parameters for cloning Vfolder
   * @param {boolean} input.cloneable - whether new cloned Vfolder is cloneable or not
   * @param {string} input.permission - permission for new cloned Vfolder. permission should one of the following: 'ro', 'rw'
   * @param {string} input.target_host - target_host for new cloned Vfolder
   * @param {string} input.target_name - name for new cloned Vfolder
   * @param {string} input.usage_mode - Cloned virtual folder's purpose of use. Can be "general" (normal folders), "data" (data storage), and "model" (pre-trained model storage).
   * @param name - source Vfolder name
   */

  async clone(input, name = null): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/clone`,
      input,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Update Information of virtual folder
   *
   * @param {json} input - parameters for updating folder options of Vfolder
   * @param {boolean} input.cloneable - whether Vfolder is cloneable or not
   * @param {string} input.permission - permission for Vfolder. permission should one of the following: 'ro', 'rw'
   * @param name - source Vfolder name
   */
  async update_folder(input, name = null): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/update-options`,
      input,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * List Virtual folders that requested accessKey has permission to.
   */
  async list(groupId = null, userEmail = null): Promise<any> {
    let reqUrl = this.urlPrefix;
    let params = {};
    if (groupId) {
      params['group_id'] = groupId;
    }
    if (userEmail) {
      params['owner_user_email'] = userEmail;
    }
    const q = new URLSearchParams(params).toString();
    reqUrl += `?${q}`;
    let rqst = this.client.newSignedRequest('GET', reqUrl, null);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * List Virtual folder hosts that requested accessKey has permission to.
   *
   * @param {string} groupId - project(group) id
   */
  async list_hosts(groupId = null): Promise<any> {
    let reqUrl = `${this.urlPrefix}/_/hosts`;
    let params = {};
    if (groupId) {
      params['group_id'] = groupId;
    }
    const q = new URLSearchParams(params).toString();
    reqUrl += `?${q}`;
    let rqst = this.client.newSignedRequest('GET', reqUrl, null);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * List all storage hosts connected to storage-proxy server
   */
  async list_all_hosts(): Promise<any> {
    if (this.client.is_superadmin === true) {
      let reqUrl = `${this.urlPrefix}/_/all-hosts`;
      let rqst = this.client.newSignedRequest('GET', reqUrl, null);
      return this.client._wrapWithPromise(rqst);
    }
  }

  /**
   * Information about specific virtual folder.
   */
  async info(name = null): Promise<any> {
    if (name == null) {
      name = this.name;
    }
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/${name}`,
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Rename a Virtual folder.
   *
   * @param {string} new_name - New virtual folder name.
   * @param {string} vfolder_id - Virtual folder id.
   */
  async rename(new_name = null, vfolder_id = null): Promise<any> {
    const body = { new_name };
    const vfolder = vfolder_id ? vfolder_id : this.client.supports('vfolder-id-based') ? this.id : this.name;
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${vfolder}/rename`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Delete a Virtual folder.
   *
   * @param {string} name - Virtual folder name. If no name is given, use name on this VFolder object.
   */
  async delete(name = null): Promise<any> {
    if (name == null) {
      name = this.name;
    }
    let rqst = this.client.newSignedRequest(
      'DELETE',
      `${this.urlPrefix}/${name}`,
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Delete a Virtual folder by id.
   *
   * @param {string} id - Virtual folder id.
   */
  async delete_by_id(id): Promise<any> {
    let body = {
      vfolder_id: id,
    };
    let rqst = this.client.newSignedRequest(
      'DELETE',
      `${this.urlPrefix}`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Leave an invited Virtual folder.
   *
   * @param {string} name - Virtual folder name. If no name is given, use name on this VFolder object.
   */
  async leave_invited(name = null): Promise<any> {
    if (name == null) {
      name = this.name;
    }
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/leave`,
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Upload files to specific Virtual folder.
   *
   * @param {string} path - Path to upload.
   * @param {string} fs - File content to upload.
   * @param {string} name - Virtual folder name.
   */
  async upload(path, fs, name = null): Promise<any> {
    if (name == null) {
      name = this.name;
    }
    let formData = new FormData();
    formData.append('src', fs, path);
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/upload`,
      formData,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Upload file from formData to specific Virtual folder.
   *
   * @param {string} fss - formData with file specification. formData should contain {src, content, {filePath:filePath}}.
   * @param {string} name - Virtual folder name.
   */
  async uploadFormData(fss, name = null): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/upload`,
      fss,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Create an upload session for a file to Virtual folder.
   *
   * @param {string} path - Path to upload.
   * @param {string} fs - File object to upload.
   * @param {string} name - Virtual folder name.
   */
  async create_upload_session(path, fs, name = null): Promise<any> {
    if (name == null) {
      name = this.name;
    }
    let body = {
      path: path,
      size: fs.size,
    };
    let rqstUrl;
    if (this.client._apiVersionMajor < 6) {
      rqstUrl = `${this.urlPrefix}/${name}/create_upload_session`;
    } else {
      rqstUrl = `${this.urlPrefix}/${name}/request-upload`;
    }
    const rqst = this.client.newSignedRequest('POST', rqstUrl, body);
    const res = await this.client._wrapWithPromise(rqst);
    const token = res['token'];
    let tusUrl;
    if (this.client._apiVersionMajor < 6) {
      tusUrl = this.client._config.endpoint;
      if (this.client._config.connectionMode === 'SESSION') {
        tusUrl = tusUrl + '/func';
      }
      tusUrl = tusUrl + `${this.urlPrefix}/_/tus/upload/${token}`;
    } else {
      tusUrl = `${res.url}?${new URLSearchParams({token}).toString()}`;
    }
    return Promise.resolve(tusUrl);
  }

  /**
   * Create directory in specific Virtual folder.
   *
   * @param {string} path - Directory path to create.
   * @param {string} name - Virtual folder name.
   * @param {string} parents - create parent folders when not exists (>=APIv6).
   * @param {string} exist_ok - Do not raise error when the folder already exists (>=APIv6).
   */
  async mkdir(
    path,
    name = null,
    parents = null,
    exist_ok = null,
  ): Promise<any> {
    if (name == null) {
      name = this.name;
    }
    const body = {
      path: path,
    };
    if (parents) {
      body['parents'] = parents;
    }
    if (exist_ok) {
      body['exist_ok'] = exist_ok;
    }
    const rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/mkdir`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Rename a file inside a virtual folder.
   *
   * @param {string} target_path - path to the target file or directory (with old name).
   * @param {string} new_name - new name of the target.
   * @param {string} name - Virtual folder name that target file exists.
   * @param {string} is_dir - True when the object is directory, false when the object is file.
   */
  async rename_file(
    target_path,
    new_name,
    name = null,
    is_dir = false,
  ): Promise<any> {
    if (name == null) {
      name = this.name;
    }
    const body = { target_path, new_name, is_dir };
    const rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/rename_file`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Delete multiple files in a Virtual folder.
   *
   * @param {string} files - Files to delete.
   * @param {boolean} recursive - delete files recursively.
   * @param {string} name - Virtual folder name that files are in.
   */
  async delete_files(files, recursive = false, name = null): Promise<any> {
    if (name == null) {
      name = this.name;
    }
    if (recursive == null) {
      recursive = false;
    }
    let body = {
      files: files,
      recursive: recursive,
    };

    let rqst = this.client.newSignedRequest(
      'POST',
      this.client.supports('background-file-delete')
        ? `${this.urlPrefix}/${name}/delete-files-async`
        : `${this.urlPrefix}/${name}/delete-files`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Download file from a Virtual folder.
   *
   * @param {string} file - File to download. Should contain full path.
   * @param {string} name - Virtual folder name that files are in.
   * @param {boolean} archive - Download target directory as an archive.
   * @param {boolean} noCache - If true, do not store the file response in any cache. New in API v6.
   */
  async download(
    file,
    name = false,
    archive = false,
    noCache = false,
  ): Promise<any> {
    const params = { file: file, archive: archive ? 'true' : 'false' };
    const q = new URLSearchParams(params).toString();
    if (this.client._apiVersionMajor < 6) {
      const rqst = this.client.newSignedRequest(
        'GET',
        `${this.urlPrefix}/${name}/download_single?${q}`,
        null,
      );
      return this.client._wrapWithPromise(rqst, true);
    } else {
      const res = await this.request_download_token(file, name);
      const downloadUrl = `${res.url}?${new URLSearchParams({
        token: res.token,
        archive: archive ? 'true' : 'false',
        no_cache: noCache ? 'true' : 'false',
      })}`;
      return fetch(downloadUrl);
    }
  }

  /**
   * Request a download archive token for multiple files/directories.
   *
   * @param {Array<string>} files - List of relative file paths from vfolder root to archive.
   * @param {string} name - Virtual folder name.
   * @param {string} [filename] - Custom filename for the downloaded ZIP archive.
   * @returns {Promise<{token: string, url: string}>} Token and URL for downloading the archive.
   */
  async request_download_archive(
    files: Array<string>,
    name: string,
    filename?: string,
  ): Promise<any> {
    const body: Record<string, any> = { files };
    if (filename) {
      body.filename = filename;
    }
    const rqstUrl = `${this.urlPrefix}/${name}/request-download-archive`;
    const rqst = this.client.newSignedRequest('POST', rqstUrl, body);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Request a download and get the token for direct download.
   *
   * @param {string} file - File to download. Should contain full path.
   * @param {string} name - Virtual folder name that files are in.
   * @param {boolean} archive - Download target directory as an archive.
   */
  async request_download_token(
    file,
    name = false,
    archive = false,
  ): Promise<any> {
    let body = {
      file,
      archive,
    };
    let rqstUrl;
    if (this.client._apiVersionMajor < 6) {
      rqstUrl = `${this.urlPrefix}/${name}/request_download`;
    } else {
      rqstUrl = `${this.urlPrefix}/${name}/request-download`;
    }
    const rqst = this.client.newSignedRequest('POST', rqstUrl, body);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Download file in a Virtual folder with token.
   *
   * @param {string} token - Temporary token to download specific file.
   */
  async download_with_token(token: string = ''): Promise<any> {
    let params = {
      token: token,
    };
    let q = new URLSearchParams(params).toString();
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/_/download_with_token?${q}`,
      null,
    );
    return this.client._wrapWithPromise(rqst, true);
  }

  /**
   * Get download URL in a Virtual folder with token.
   *
   * @param {string} token - Temporary token to download specific file.
   */
  get_download_url_with_token(token: string = ''): string {
    const params = { token };
    let q = new URLSearchParams(params).toString();
    if (this.client._config.connectionMode === 'SESSION') {
      return `${this.client._config.endpoint}/func${this.urlPrefix}/_/download_with_token?${q}`;
    } else {
      return `${this.client._config.endpoint}${this.urlPrefix}/_/download_with_token?${q}`;
    }
  }

  /**
   * List files in specific virtual folder / path.
   *
   * @param {string} path - Directory path to list.
   * @param {string} name - Virtual folder name to look up with.
   */
  async list_files(path, name = null): Promise<any> {
    if (name == null) {
      name = this.name;
    }
    let params = {
      path: path,
    };
    let q = new URLSearchParams(params).toString();
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/${name}/files?${q}`,
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Invite someone to specific virtual folder with permission.
   *
   * @param {string} perm - Permission to give to. `rw` or `ro`.
   * @param {array} emails - User E-mail to invite.
   * @param {string} name - Virtual folder name to invite.
   */
  async invite(perm, emails, name = null): Promise<any> {
    if (name == null) {
      name = this.name;
    }
    let body = {
      perm: perm,
      user_ids: emails,
    };
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/invite`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Show invitations to current API key.
   */
  async invitations(): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/invitations/list`,
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Accept specific invitation.
   *
   * @param {string} inv_id - Invitation ID.
   */
  async accept_invitation(inv_id): Promise<any> {
    let body = {
      inv_id: inv_id,
    };
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/invitations/accept`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Delete specific invitation.
   *
   * @param {string} inv_id - Invitation ID to delete.
   */
  async delete_invitation(inv_id): Promise<any> {
    let body = {
      inv_id: inv_id,
    };
    let rqst = this.client.newSignedRequest(
      'DELETE',
      `${this.urlPrefix}/invitations/delete`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * List invitees(users who accepted an invitation)
   *
   * @param {string} vfolder_id - vfolder id. If no id is given, all users who accepted the client's invitation will be returned
   */
  async list_invitees(vfolder_id = null): Promise<any> {
    let queryString = '/folders/_/shared';
    if (vfolder_id !== null)
      queryString = `${queryString}?${new URLSearchParams({vfolder_id: vfolder_id}).toString()}`;
    let rqst = this.client.newSignedRequest('GET', queryString, null);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Modify an invitee's permission to a shared vfolder
   *
   * @param {json} input - parameters for permission modification
   * @param {string} input.perm - invitee's new permission. permission should one of the following: 'ro', 'rw'
   * @param {string} input.user - invitee's uuid
   * @param {string} input.vfolder - id of the vfolder that has been shared to the invitee
   */
  async modify_invitee_permission(input): Promise<any> {
    let rqst = this.client.newSignedRequest('POST', '/folders/_/shared', input);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Share specific users a group-type virtual folder with overriding permission.
   *
   * @param {string} permission - Permission to give to. `rw` or `ro`.
   * @param {array} emails - User E-mail(s) to share.
   * @param {string} name - A group virtual folder name to share.
   */
  async share(permission, emails, name = null): Promise<any> {
    if (!name) {
      name = this.name;
    }
    const body = { permission, emails };
    const rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${name}/share`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Unshare a group-type virtual folder from given users.
   *
   * @param {array} emails - User E-mail(s) to unshare.
   * @param {string} name - A group virtual folder name to unshare.
   */
  async unshare(emails, name = null): Promise<any> {
    if (!name) {
      name = this.name;
    }
    const body = { emails };
    const rqst = this.client.newSignedRequest(
      'DELETE',
      `${this.urlPrefix}/${name}/unshare`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get the size quota of a vfolder.
   * Only available for some specific file system such as XFS.
   *
   * @param {string} host - Host name of a virtual folder.
   * @param {string} vfolder_id - id of the vfolder.
   */
  async get_quota(host, vfolder_id): Promise<any> {
    const params = { folder_host: host, id: vfolder_id };
    let q = new URLSearchParams(params).toString();
    const rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/_/quota?${q}`,
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Set the size quota of a vfolder.
   * Only available for some specific file system such as XFS.
   *
   * @param {string} host - Host name of a virtual folder.
   * @param {string} vfolder_id - id of the vfolder.
   * @param {number} quota - quota size of the vfolder.
   */
  async set_quota(host, vfolder_id, quota): Promise<any> {
    const body = {
      folder_host: host,
      id: vfolder_id,
      input: {
        size_bytes: quota,
      },
    };
    const rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/_/quota`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Restore vfolder from trash bin, by changing status.
   *
   * @param {string} vfolder_id - id of the vfolder.
   */
  async restore_from_trash_bin(vfolder_id): Promise<any> {
    const body = {vfolder_id};
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/restore-from-trash-bin`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }


  /**
   * Delete `delete-pending` vfolders in storage proxy
   *
   * @param {string} vfolder_id - id of the vfolder.
   */
  async delete_from_trash_bin(vfolder_id): Promise<any> {
    const body = {vfolder_id};
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/delete-from-trash-bin`,
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }
}
