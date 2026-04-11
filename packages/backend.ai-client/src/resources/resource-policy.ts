// @ts-nocheck
export class ResourcePolicy {
  public client: any;

  /**
   * The Resource Policy  API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * get resource policy with given name and fields.
   *
   * @param {string} name - resource policy name.
   * @param {array} fields - fields to query.
   */
  async get(
    name = null,
    fields = [
      'name',
      'created_at',
      'default_for_unspecified',
      'total_resource_slots',
      'max_concurrent_sessions',
      'max_containers_per_session',
      'max_vfolder_count',
      'allowed_vfolder_hosts',
      'idle_timeout',
      'max_session_lifetime',
    ],
  ): Promise<any> {
    let q, v;
    if (name === null) {
      q =
        `query {` + `  keypair_resource_policies { ${fields.join(' ')} }` + '}';
      v = { n: name };
    } else {
      q =
        `query($n:String!) {` +
        `  keypair_resource_policy(name: $n) { ${fields.join(' ')} }` +
        '}';
      v = { n: name };
    }
    return this.client.query(q, v);
  }

  /**
   * add resource policy with given name and fields.
   *
   * @param {string} name - resource policy name.
   * @param {json} input - resource policy specification and data. Required fields are:
   * {
   *   'default_for_unspecified': 'UNLIMITED', // default resource policy when resource slot is not given. 'UNLIMITED' or 'LIMITED'.
   *   'total_resource_slots': JSON.stringify(total_resource_slots), // Resource slot value. should be Stringified JSON.
   *   'max_concurrent_sessions': concurrency_limit,
   *   'max_containers_per_session': containers_per_session_limit,
   *   'idle_timeout': idle_timeout,
   *   'allowed_vfolder_hosts': vfolder_hosts,
   *   'max_session_lifetime': max_session_lifetime
   * };
   */
  async add(name = null, input): Promise<any> {
    let fields = [
      'name',
      'created_at',
      'default_for_unspecified',
      'total_resource_slots',
      'max_concurrent_sessions',
      'max_containers_per_session',
      'max_vfolder_count',
      'allowed_vfolder_hosts',
      'idle_timeout',
      'max_session_lifetime',
    ];
    if (this.client.is_admin === true && name !== null) {
      let q =
        `mutation($name: String!, $input: CreateKeyPairResourcePolicyInput!) {` +
        `  create_keypair_resource_policy(name: $name, props: $input) {` +
        `    ok msg resource_policy { ${fields.join(' ')} }` +
        `  }` +
        `}`;
      let v = {
        name: name,
        input: input,
      };
      return this.client.query(q, v);
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   * mutate specified resource policy with given name with new values.
   *
   * @param {string} name - resource policy name to mutate. (READ-ONLY)
   * @param {json} input - resource policy specification and data. Required fields are:
   * {
   *   {string} 'default_for_unspecified': 'UNLIMITED', // default resource policy when resource slot is not given. 'UNLIMITED' or 'LIMITED'.
   *   {JSONString} 'total_resource_slots': JSON.stringify(total_resource_slots), // Resource slot value. should be Stringified JSON.
   *   {int} 'max_concurrent_sessions': concurrency_limit,
   *   {int} 'max_containers_per_session': containers_per_session_limit,
   *   {bigint} 'idle_timeout': idle_timeout,
  *     {int} 'max_vfolder_count': vfolder_count_limit,
   *   {[string]} 'allowed_vfolder_hosts': vfolder_hosts,
   *   {int} 'max_session_lifetime': max_session_lifetime
   * };
   */
  async mutate(name = null, input): Promise<any> {
    if (this.client.is_admin === true && name !== null) {
      let q =
        `mutation($name: String!, $input: ModifyKeyPairResourcePolicyInput!) {` +
        `  modify_keypair_resource_policy(name: $name, props: $input) {` +
        `    ok msg ` +
        `  }` +
        `}`;
      let v = {
        name: name,
        input: input,
      };
      return this.client.query(q, v);
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   * delete specified resource policy that exists in policy list.
   *
   * @param {string} name - resource policy name to delete. (READ-ONLY)
   */
  async delete(name = null): Promise<any> {
    if (this.client.is_superadmin === true && name !== null) {
      let q =
        `mutation($name: String!) {` +
        ` delete_keypair_resource_policy(name: $name) {` +
        `   ok msg ` +
        ` }` +
        `}`;
      let v = {
        name: name,
      };
      return this.client.query(q, v);
    } else {
      return Promise.resolve(false);
    }
  }
}
