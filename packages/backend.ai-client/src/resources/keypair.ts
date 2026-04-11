export class Keypair {
  public client: any;
  public name: any;

  /**
   * Keypair API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   * @param {string | null} name - the name of keypair class
   */
  constructor(client, name = null) {
    this.client = client;
    this.name = name;
  }

  /**
   * Information of specific Keypair.
   *
   * @param {string} accessKey - Access key to query information. If client is not authorized as admin, this will be ignored and current API key infomation will be returned.
   * @param {array} fields - Fields to query. Queryable fields are: 'access_key', 'secret_key', 'is_active', 'is_admin', 'user_id', 'created_at', 'last_used',
   'concurrency_limit', 'concurrency_used', 'rate_limit', 'num_queries', 'resource_policy'.
   */
  async info(
    accessKey,
    fields = [
      'access_key',
      'secret_key',
      'is_active',
      'is_admin',
      'user_id',
      'created_at',
      'last_used',
      'concurrency_limit',
      'concurrency_used',
      'rate_limit',
      'num_queries',
      'resource_policy',
    ],
  ): Promise<any> {
    let q, v;
    if (this.client.is_admin) {
      q =
        `query($access_key: String!) {` +
        `  keypair(access_key: $access_key) {` +
        `    ${fields.join(' ')}` +
        `  }` +
        `}`;
      v = {
        access_key: accessKey,
      };
    } else {
      q = `query {` + `  keypair {` + `    ${fields.join(' ')}` + `  }` + `}`;
      v = {};
    }
    return this.client.query(q, v);
  }

  /**
   * List all Keypairs of given user ID.
   *
   * @param {string} userId - User ID to query API keys. If user ID is not given and client is authorized as admin, this will return every keypairs of the manager.
   * @param {array} fields - Fields to query. Queryable fields are: "access_key", 'is_active', 'is_admin', 'user_id', 'created_at', 'last_used',
   'concurrency_used', 'rate_limit', 'num_queries', 'resource_policy'.
   * @param {string} isActive - filter keys with active state. If `true`, only active keypairs are returned.
   */
  async list(
    userId = null,
    fields = [
      'access_key',
      'is_active',
      'is_admin',
      'user_id',
      'created_at',
      'last_used',
      'concurrency_used',
      'rate_limit',
      'num_queries',
      'resource_policy',
    ],
    isActive = true,
  ): Promise<any> {
    let q, v;
    if (this.client._apiVersionMajor < 5) {
      q =
        this.client.is_admin && userId == null
          ? `
        query($is_active: Boolean) {
          keypairs(is_active: $is_active) {
            ${fields.join(' ')}
          }
        }
      `
          : `
        query($email: String!, $is_active: Boolean) {
          keypairs(email: $email, is_active: $is_active) {
            ${fields.join(' ')}
          }
        }
      `;
      v = {
        email: userId || this.client.email,
        is_active: isActive,
      };
      return this.client.query(q, v);
    } else {
      // From 20.03, there is no single query to fetch every keypairs, so
      // we iterate pages to gather all keypairs for client-side compability.
      const limit = 100;
      const keypairs = [] as any;
      q =
        this.client.is_admin && userId == null
          ? `
        query($offset:Int!, $limit:Int!, $is_active: Boolean) {
          keypair_list(offset:$offset, limit:$limit, is_active: $is_active) {
            items { ${fields.join(' ')} }
            total_count
          }
        }
      `
          : `
        query($offset:Int!, $limit:Int!, $email: String!, $is_active: Boolean) {
          keypair_list(offset:$offset, limit:$limit, email: $email, is_active: $is_active) {
            items { ${fields.join(' ')} }
            total_count
          }
        }
      `;
      // Prevent fetching more than 1000 keypairs.
      for (let offset = 0; offset < 10 * limit; offset += limit) {
        v = {
          offset,
          limit,
          email: userId || this.client.email,
          is_active: isActive,
        };
        const page = await this.client.query(q, v);
        keypairs.push(...page.keypair_list.items);
        if (offset >= page.keypair_list.total_count) {
          break;
        }
      }
      const resp = { keypairs };
      return Promise.resolve(resp);
    }
  }

  /**
   * Add Keypair with given information.
   *
   * @param {string} userId - User ID for new Keypair.
   * @param {boolean} isActive - is_active state. Default is True.
   * @param {boolean} isAdmin - is_admin state. Default is False.
   * @param {string} resourcePolicy - resource policy name to assign. Default is `default`.
   * @param {number} rateLimit - API rate limit for 900 seconds. Prevents from DDoS attack.
   */
  async add(
    userId = null,
    isActive = true,
    isAdmin = false,
    resourcePolicy = 'default',
    rateLimit = 1000,
  ): Promise<any> {
    let fields = [
      'is_active',
      'is_admin',
      'resource_policy',
      'concurrency_limit',
      'rate_limit',
    ];
    let q =
      `mutation($user_id: String!, $input: KeyPairInput!) {` +
      `  create_keypair(user_id: $user_id, props: $input) {` +
      `    ok msg keypair { ${fields.join(' ')} }` +
      `  }` +
      `}`;
    let v = {
      user_id: userId,
      input: {
        is_active: isActive,
        is_admin: isAdmin,
        resource_policy: resourcePolicy,
        rate_limit: rateLimit,
      },
    };
    return this.client.query(q, v);
    /** accessKey is no longer used */
    /*
    if (accessKey !== null && accessKey !== '') {
      fields = fields.concat(['access_key', 'secret_key']);
    } */
    /* if (accessKey !== null && accessKey !== '') {
     v = {
       'user_id': userId,
       'input': {
         'is_active': isActive,
         'is_admin': isAdmin,
         'resource_policy': resourcePolicy,
         'rate_limit': rateLimit,
       },
     };
   } else {
     v = {
       'user_id': userId,
       'input': {
         'is_active': isActive,
         'is_admin': isAdmin,
         'resource_policy': resourcePolicy,
         'rate_limit': rateLimit
       },
     };
   } */
  }

  /**
   * mutate Keypair for given accessKey.
   *
   * @param {string} accessKey - access key to mutate.
   * @param {json} input - new information for mutation. JSON format should follow:
   * {
   *   'is_active': is_active,
   *   'is_admin': is_admin,
   *   'resource_policy': resource_policy,
   *   'rate_limit': rate_limit
   * }
   */
  async mutate(accessKey, input): Promise<any> {
    let q =
      `mutation($access_key: String!, $input: ModifyKeyPairInput!) {` +
      `  modify_keypair(access_key: $access_key, props: $input) {` +
      `    ok msg` +
      `  }` +
      `}`;
    let v = {
      access_key: accessKey,
      input: input,
    };
    return this.client.query(q, v);
  }

  /**
   * Delete Keypair with given accessKey
   *
   * @param {string} accessKey - access key to delete.
   */
  async delete(accessKey): Promise<any> {
    let q =
      `mutation($access_key: String!) {` +
      `  delete_keypair(access_key: $access_key) {` +
      `    ok msg` +
      `  }` +
      `}`;
    let v = {
      access_key: accessKey,
    };
    return this.client.query(q, v);
  }
}
