// @ts-nocheck
export class ScalingGroup {
  public client: any;

  /**
   * The Scaling Group API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
  }

  async list_available(): Promise<any> {
    if (this.client.is_superadmin === true) {
      const fields = [
        'name',
        'description',
        'is_active',
        'created_at',
        'driver',
        'driver_opts',
        'scheduler',
        'scheduler_opts',
        'wsproxy_addr',
        'is_public',
      ];
      const q = `query {` + `  scaling_groups { ${fields.join(' ')} }` + `}`;
      const v = {};
      return this.client.query(q, v);
    } else {
      return Promise.resolve(false);
    }
  }

  async list(group = 'default'): Promise<any> {
    const queryString = `/scaling-groups?${new URLSearchParams({ group: group }).toString()}`;
    const rqst = this.client.newSignedRequest('GET', queryString, null, null);
    //const result = await this.client._wrapWithPromise(rqst);
    //console.log("test");
    //console.log(result);
    //return result;
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get the version of WSProxy for a specific scaling group.
   * (NEW) manager version 21.09.
   *
   * @param {string} scalingGroup - Scaling group name
   * @param {string} groupId - Project (group) ID
   */
  async getWsproxyVersion(scalingGroup, groupId): Promise<any> {
    const url = `/scaling-groups/${scalingGroup}/wsproxy-version?${new URLSearchParams({ group: groupId }).toString()}`;
    const rqst = this.client.newSignedRequest('GET', url, null, null);
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Create a scaling group
   *
   * @param {string} name - name of the new scaling group
   * @param {json} input - object containing desired modifications
   * {
   *   'description': String          // description of scaling group
   *   'is_active': Boolean           // active status of scaling group
   *   'driver': String
   *   'driver_opts': JSONString
   *   'scheduler': String
   *   'scheduler_opts': JSONString   // NEW in manager 22.03
   *   'wsproxy_addr': String         // NEW in manager 21.09
   *   'is_public': Boolean           // New in manager 23.03.1
   * }
   */
  async create(name, input): Promise<any> {
    let q =
      `mutation($name: String!, $input: CreateScalingGroupInput!) {` +
      `  create_scaling_group(name: $name, props: $input) {` +
      `    ok msg` +
      `  }` +
      `}`;
    let v = {
      name,
      input,
    };
    return this.client.query(q, v);
  }

  /**
   * Associate a scaling group with a domain
   *
   * @param {string} domain - domain name
   * @param {string} scaling_group - scaling group name
   */
  async associate_domain(domain, scaling_group): Promise<any> {
    let q =
      `mutation($domain: String!, $scaling_group: String!) {` +
      `  associate_scaling_group_with_domain(domain: $domain, scaling_group: $scaling_group) {` +
      `    ok msg` +
      `  }` +
      `}`;
    let v = {
      domain,
      scaling_group,
    };
    return this.client.query(q, v);
  }

  /**
   * Modify a scaling group
   *
   * @param {string} name - scaling group name
   * @param {json} input - object containing desired modifications
   * {
   *   'description': String          // description of scaling group
   *   'is_active': Boolean           // active status of scaling group
   *   'is_public': Boolean
   *   'driver': String
   *   'driver_opts': JSONString
   *   'scheduler': String
   *   'scheduler_opts': JSONString   // NEW in manager 22.03
   *   'wsproxy_addr': String         // NEW in manager 21.09
   * }
   */
  async update(name, input): Promise<any> {
    let q =
      `mutation($name: String!, $input: ModifyScalingGroupInput!) {` +
      `  modify_scaling_group(name: $name, props: $input) {` +
      `    ok msg` +
      `  }` +
      `}`;
    let v = {
      name,
      input,
    };

    return this.client.query(q, v);
  }

  /**
   * Delete a scaling group
   *
   * @param {string} name - name of scaling group to be deleted
   */
  async delete(name): Promise<any> {
    let q =
      `mutation($name: String!) {` +
      `  delete_scaling_group(name: $name) {` +
      `    ok msg` +
      `  }` +
      `}`;
    let v = {
      name,
    };

    return this.client.query(q, v);
  }
}
