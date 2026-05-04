// @ts-nocheck
export class Group {
  public client: any;

  /**
   * The group API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * List registred groups.
   * @param {boolean} is_active - List whether active users or inactive users.
   * @param {string} domain_name - domain name of group
   * @param {array} fields - fields to get. Possible field names are:
   * {
   *   'name': String,          // Group name.
   *   'description': String,   // Description for group.
   *   'is_active': Boolean,    // Whether the group is active or not.
   *   'created_at': String,    // Created date of group.
   *   'modified_at': String,   // Modified date of group.
   *   'domain_name': String,   // Domain for group.
   * };
   */
  async list(
    is_active = true,
    domain_name = false,
    fields = [
      'id',
      'name',
      'description',
      'is_active',
      'created_at',
      'modified_at',
      'domain_name',
      'type',
    ],
    type = ['GENERAL'],
  ): Promise<any> {
    let q, v;
    q =
      `query($is_active:Boolean, $type:[String!]) {` +
      `  groups(is_active:$is_active, type:$type) { ${fields.join(' ')} }` +
      '}';
    v = { is_active: is_active, type: type };
    if (domain_name) {
      q =
        `query($domain_name: String, $is_active:Boolean, $type:[String!]) {` +
        `  groups(domain_name: $domain_name, is_active:$is_active, type:$type) { ${fields.join(
          ' ',
        )} }` +
        '}';
      v = {
        is_active: is_active,
        domain_name: domain_name,
        type: type,
      };
    }
    return this.client.query(q, v);
  }
}
