export class Setting {
  public client: any;
  public config: any;

  /**
   * Setting API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
    this.config = null;
  }

  /**
   * List settings
   *
   * @param {string} prefix - prefix to get. This command will return every settings starting with the prefix.
   */
  async list(prefix = ''): Promise<any> {
    prefix = `config/${prefix}`;
    const rqst = this.client.newSignedRequest('POST', '/config/get', {
      key: prefix,
      prefix: true,
    });
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get settings
   *
   * @param {string} key - prefix to get. This command will return every settings starting with the prefix.
   */
  async get(key): Promise<any> {
    key = `config/${key}`;
    const rqst = this.client.newSignedRequest('POST', '/config/get', {
      key: key,
      prefix: false,
    });
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Set a setting
   *
   * @param {string} key - key to add.
   * @param {object} value - value to add.
   */
  async set(key, value): Promise<any> {
    key = `config/${key}`;
    const rqst = this.client.newSignedRequest('POST', '/config/set', {
      key,
      value,
    });
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Delete a setting
   *
   * @param {string} key - key to delete
   * @param {boolean} prefix - prefix to delete. if prefix is true, this command will delete every settings starting with the key.
   */
  async delete(key, prefix = false): Promise<any> {
    key = `config/${key}`;
    const rqst = this.client.newSignedRequest('POST', '/config/delete', {
      key: `${key}`,
      prefix: prefix,
    });
    return this.client._wrapWithPromise(rqst);
  }
}
