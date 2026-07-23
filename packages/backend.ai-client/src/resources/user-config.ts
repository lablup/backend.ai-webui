// @ts-nocheck
export class UserConfig {
  public client: any;
  public config: any;

  /**
   * Setting API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client: any) {
    this.client = client;
    this.config = null;
  }

  /**
   * Get content of bootstrap script of a keypair.
   */
  async get_bootstrap_script(): Promise<any> {
    if (!this.client._config.accessKey) {
      throw 'Your access key is not set';
    }
    const rqst = this.client.newSignedRequest(
      'GET',
      '/user-config/bootstrap-script',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Update bootstrap script of a keypair.
   *
   * @param {string} script - text content of bootstrap script.
   */
  async update_bootstrap_script(script: string): Promise<any> {
    const rqst = this.client.newSignedRequest(
      'POST',
      '/user-config/bootstrap-script',
      { script },
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Create content of script dotfile (.bashrc or .zshrc)
   * @param {string} data - text content of script dotfile
   * @param {string} path - path of script dotfile. (cwd: home directory)
   */
  async create(data: string = '', path: string): Promise<any> {
    if (!this.client._config.accessKey) {
      throw 'Your access key is not set';
    }
    let params = {
      path: path,
      data: data,
      permission: '644',
    };
    const rqst = this.client.newSignedRequest(
      'POST',
      '/user-config/dotfiles',
      params,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get content of script dotfile
   */
  async get(): Promise<any> {
    if (!this.client._config.accessKey) {
      throw 'Your access key is not set';
    }
    // let params = {
    //   "owner_access_key" : this.client._config.accessKey
    // }
    const rqst = this.client.newSignedRequest('GET', '/user-config/dotfiles');
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Update script dotfile of a keypair.
   *
   * @param {string} data - text content of script dotfile.
   * @param {string} path - path of script dotfile. (cwd: home directory)
   */
  async update(data: string, path: string): Promise<any> {
    let params = {
      data: data,
      path: path,
      permission: '644',
    };
    const rqst = this.client.newSignedRequest(
      'PATCH',
      '/user-config/dotfiles',
      params,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Delete script dotfile of a keypair.
   *
   * @param {string} path - path of script dotfile.
   */
  async delete(path: string): Promise<any> {
    const queryParams = new URLSearchParams({ path });
    const rqst = this.client.newSignedRequest(
      'DELETE',
      `/user-config/dotfiles?${queryParams.toString()}`,
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }
}
