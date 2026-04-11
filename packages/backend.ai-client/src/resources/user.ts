export class User {
  public client: any;

  /**
   * The user API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * List all registred users.
   *
   * TODO: we need new paginated list API after implementation of server-side dynamic filtering.
   *
   * @param {boolean} is_active - List whether active users or inactive users.
   * @param {json} fields - User specification to query. Fields are:
   * {
   *   'username': String,      // User name for given user id.
   *   'password': String,      // Password for user id.
   *   'need_password_change': Boolean, // Let user change password at the next login.
   *   'full_name': String,     // Full name of given user id.
   *   'description': String,   // Description for user.
   *   'is_active': Boolean, // Flag if user is active or not.
   *   'domain_name': String,   // Domain for user.
   *   'role': String,          // Role for user.
   *   'groups': {id name}  // Group Ids for user. Shoule be list of UUID strings.
   * };
   */
  async list(
    is_active = true,
    fields = [
      'username',
      'password',
      'need_password_change',
      'full_name',
      'description',
      'is_active',
      'domain_name',
      'role',
      'groups {id name}',
      'status',
      'main_access_key',
    ],
  ): Promise<any> {
    let q, v;
    if (this.client._apiVersionMajor < 5) {
      q = this.client.is_admin
        ? `
        query($is_active:Boolean) {
          users(is_active:$is_active) { ${fields.join(' ')} }
        }
      `
        : `
        query {
          users { ${fields.join(' ')} }
        }
      `;
      v = this.client.is_admin ? { is_active } : {};
      return this.client.query(q, v);
    } else {
      // From 20.03, there is no single query to fetch every user, so
      // we iterate pages to gather all users for client-side compability.
      const limit = 100;
      const users = [] as any;
      q = this.client.is_admin
        ? `
        query($offset:Int!, $limit:Int!, $is_active:Boolean) {
          user_list(offset:$offset, limit:$limit, is_active:$is_active) {
            items { ${fields.join(' ')} }
            total_count
          }
        }
      `
        : `
        query($offset:Int!, $limit:Int!) {
          user_list(offset:$offset, limit:$limit) {
            items { ${fields.join(' ')} }
            total_count
          }
        }
      `;
      // Prevent fetching more than 1000 users.
      for (let offset = 0; offset < 10 * limit; offset += limit) {
        v = this.client.is_admin
          ? { offset, limit, is_active }
          : { offset, limit };
        const page = await this.client.query(q, v);
        users.push(...page.user_list.items);
        if (offset >= page.user_list.total_count) {
          break;
        }
      }
      const resp = { users };
      return Promise.resolve(resp);
    }
  }

  /**
   * Get user information.
   *
   * @param {string} email - E-mail address as user id.
   * @param {json} fields - User specification to query. Fields are:
   * {
   *   'email': String,         // E-mail for given E-mail (same as user)
   *   'username': String,      // User name for given user id.
   *   'password': String,      // Password for user id.
   *   'need_password_change': Boolean, // Let user change password at the next login.
   *   'full_name': String,     // Full name of given user id.
   *   'description': String,   // Description for user.
   *   'is_active': Boolean,    // Flag if user is active or not.
   *   'domain_name': String,   // Domain for user.
   *   'role': String,          // Role for user.
   *   'groups': List(UUID)     // Group Ids for user. Should be list of UUID strings.
   *   'totp_activated': Boolean// Whether TOTP is enabled for the user.
   * };
   */
  async get(
    email,
    fields = [
      'email',
      'username',
      'password',
      'need_password_change',
      'full_name',
      'description',
      'is_active',
      'domain_name',
      'role',
      'groups {id name}',
    ],
  ) {
    let q, v;
    if (this.client.is_admin === true) {
      q =
        `query($email:String) {` +
        `  user (email:$email) { ${fields.join(' ')} }` +
        '}';
      v = { email: email };
    } else {
      q = `query {` + `  user { ${fields.join(' ')} }` + '}';
      v = {};
    }
    return this.client.query(q, v);
  }

  /**
   * add new user with given information.
   *
   * @param {string} email - E-mail address as user id.
   * @param {json} input - User specification to change. Required fields are:
   * {
   *   'username': String,      // User name for given user id.
   *   'password': String,      // Password for user id.
   *   'need_password_change': Boolean, // Let user change password at the next login.
   *   'full_name': String,     // Full name of given user id.
   *   'description': String,   // Description for user.
   *   'is_active': Boolean,    // Flag if user is active or not.
   *   'domain_name': String,   // Domain for user.
   *   'role': String,          // Role for user.
   *   'group_ids': List(UUID)  // Group Ids for user. Shoule be list of UUID strings.
   * };
   */
  async create(email = null, input): Promise<any> {
    // let fields = ['username', 'password', 'need_password_change', 'full_name', 'description', 'is_active', 'domain_name', 'role', 'groups{id, name}'];
    if (this.client.is_admin === true) {
      let q =
        `mutation($email: String!, $input: UserInput!) {` +
        `  create_user(email: $email, props: $input) {` +
        `    ok msg` +
        `  }` +
        `}`;
      let v = {
        email: email,
        input: input,
      };
      return this.client.query(q, v, null, 0, 0, true);
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   * modify user information with given user id with new values.
   *
   * @param {string} email - E-mail address as user id.
   * @param {json} input - User specification to change. Required fields are:
   * {
   *   'username': String,      // User name for given user id.
   *   'password': String,      // Password for user id.
   *   'need_password_change': Boolean, // Let user change password at the next login.
   *   'full_name': String,     // Full name of given user id.
   *   'description': String,   // Description for user.
   *   'is_active': Boolean,    // Flag if user is active or not.
   *   'domain_name': String,   // Domain for user.
   *   'role': String,          // Role for user.
   *   'group_ids': List(UUID)  // Group Ids for user. Shoule be list of UUID strings.
   * };
   */
  async update(email = null, input): Promise<any> {
    if (this.client.is_superadmin === true) {
      let q =
        `mutation($email: String!, $input: ModifyUserInput!) {` +
        `  modify_user(email: $email, props: $input) {` +
        `    ok msg` +
        `  }` +
        `}`;
      let v = {
        email: email,
        input: input,
      };
      return this.client.query(q, v, null, 0, 0, true);
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   * delete user information with given user id
   *
   * @param {string} email - E-mail address as user id to delete.
   */
  async delete(email): Promise<any> {
    if (this.client.is_superadmin === true) {
      let q =
        `mutation($email: String!) {` +
        `  delete_user(email: $email) {` +
        `    ok msg` +
        `  }` +
        `}`;
      let v = {
        email: email,
      };
      return this.client.query(q, v, null, 0, 0, true);
    } else {
      return Promise.resolve(false);
    }
  }
}
