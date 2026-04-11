export class StorageProxy {
  public client: any;

  /**
   * Agent API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * List storage proxies and its volumes.
   *
   * @param {array} fields - Fields to query. Queryable fields are:  'id', 'backend', 'capabilities'.
   * @param {number} limit - limit number of query items.
   * @param {number} offset - offset for item query. Useful for pagination.
   */
  async list(
    fields = ['id', 'backend', 'capabilities'],
    limit = 20,
    offset = 0,
  ): Promise<any> {
    let q =
      `query($offset:Int!, $limit:Int!) {` +
      `  storage_volume_list(limit:$limit, offset:$offset) {` +
      `     items { ${fields.join(' ')} }` +
      `     total_count` +
      `  }` +
      `}`;
    let v = {
      limit: limit,
      offset: offset,
    };
    return this.client.query(q, v);
  }

  /**
   * Detail of specific storage proxy / volume.
   *
   * @param {string} host - Virtual folder host.
   * @param {array} fields - Fields to query. Queryable fields are:  'id', 'backend', 'fsprefix', 'capabilities'.
   */
  async detail(
    host: string = '',
    fields = ['id', 'backend', 'path', 'fsprefix', 'capabilities'],
  ): Promise<any> {
    let q =
      `query($vfolder_host: String!) {` +
      `  storage_volume(id: $vfolder_host) {` +
      `     ${fields.join(' ')}` +
      `  }` +
      `}`;
    let v = { vfolder_host: host };
    return this.client.query(q, v);
  }

  async getAllPermissions(): Promise<any> {
      const rqst = this.client.newSignedRequest('GET', `/acl`, null);
      return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get all fields related to allowed_vfolder_hosts according to the current user information
   *
   * @param {string} domainName
   * @param {string} projectId
   * @param {string} resourcePolicyName
   * @returns {object} - get allowed_vfolder_hosts key-value on domain, group, resource policy of current user
   */
  async getAllowedVFolderHostsByCurrentUserInfo(
    domainName = '',
    projectId = '',
    resourcePolicyName = '',
  ): Promise<any> {
    const q = `
      query($domainName: String, $projectId: UUID!, $resourcePolicyName: String) {
        domain(name: $domainName) { allowed_vfolder_hosts }
        group(id: $projectId, domain_name: $domainName) { allowed_vfolder_hosts }
        keypair_resource_policy(name: $resourcePolicyName) { allowed_vfolder_hosts }
      }
    `;
    const v = { domainName, projectId, resourcePolicyName };
    return this.client.query(q, v);
  }
}
