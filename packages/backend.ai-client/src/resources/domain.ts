// @ts-nocheck
export class Domain {
  public client: any;

  /**
   * The domain API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Get domain information.
   * @param {string} domain_name - domain name of group
   * @param {array} fields - fields to query.  Default fields are: ['name', 'description', 'is_active', 'created_at', 'modified_at', 'total_resource_slots', 'allowed_vfolder_hosts',
   'allowed_docker_registries', 'integration_id', 'scaling_groups']
   * {
   *   'name': String,          // Group name.
   *   'description': String,   // Description for group.
   *   'is_active': Boolean,    // Whether the group is active or not.
   *   'created_at': String,    // Created date of group.
   *   'modified_at': String,   // Modified date of group.
   *   'total_resource_slots': JSONString,   // Total resource slots
   *   'allowed_vfolder_hosts': [String],   // Allowed virtual folder hosts
   *   'allowed_docker_registries': [String],   // Allowed docker registry lists
   *   'integration_id': [String],   // Integration ids
   *   'scaling_groups': [String],   // Scaling groups
   * };
   */
  async get(
    domain_name = false,
    fields = [
      'name',
      'description',
      'is_active',
      'created_at',
      'modified_at',
      'total_resource_slots',
      'allowed_vfolder_hosts',
      'allowed_docker_registries',
      'integration_id',
      'scaling_groups',
    ],
  ): Promise<any> {
    let q, v;
    if (domain_name) {
      q =
        `query($name: String) {` +
        `  domain(name: $name) { ${fields.join(' ')} }` +
        '}';
      v = { name: domain_name };
      return this.client.query(q, v);
    }
  }

  async list(
    fields = [
      'name',
      'description',
      'is_active',
      'created_at',
      'total_resource_slots',
      'allowed_vfolder_hosts',
      'allowed_docker_registries',
      'integration_id',
    ],
  ): Promise<any> {
    let q = `query {` + ` domains { ${fields.join(' ')} }` + `}`;
    let v = {};

    return this.client.query(q, v);
  }

  /**
   * Modify domain information.
   * @param {string} domain_name - domain name of group


   * @param {json} input - Domain specification to change. Required fields are:
   * {
   *   'name': String,          // Group name.
   *   'description': String,   // Description for group.
   *   'is_active': Boolean,    // Whether the group is active or not.
   *   'created_at': String,    // Created date of group.
   *   'modified_at': String,   // Modified date of group.
   *   'total_resource_slots': JSOONString,   // Total resource slots
   *   'allowed_vfolder_hosts': [String],   // Allowed virtual folder hosts
   *   'allowed_docker_registries': [String],   // Allowed docker registry lists
   *   'integration_id': [String],   // Integration ids
   *   'scaling_groups': [String],   // Scaling groups
   * };
   */
  async update(domain_name = false, input): Promise<any> {
    //let fields = ['name', 'description', 'is_active', 'created_at', 'modified_at', 'total_resource_slots', 'allowed_vfolder_hosts',
    //  'allowed_docker_registries', 'integration_id', 'scaling_groups'];
    if (this.client.is_superadmin === true) {
      let q =
        `mutation($name: String!, $input: ModifyDomainInput!) {` +
        `  modify_domain(name: $name, props: $input) {` +
        `    ok msg` +
        `  }` +
        `}`;
      let v = {
        name: domain_name,
        input: input,
      };
      return this.client.query(q, v);
    } else {
      return Promise.resolve(false);
    }
  }
}
