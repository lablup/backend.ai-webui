export class ComputeSession {
  public client: any;

  /**
   * The Computate session API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Get the number of compute sessions with specific conditions.
   *
   * @param {string or array} status - status to query. Default is 'RUNNING'.
   *        Available statuses are: `PREPARING`, `CREATING`, `BUILDING`, `PENDING`, `SCHEDULED`, `RUNNING`, `RESTARTING`, `RESIZING`, `SUSPENDED`, `TERMINATING`, `TERMINATED`, `ERROR`.
   * @param {string} accessKey - access key that is used to start compute sessions.
   * @param {number} limit - limit number of query items.
   * @param {number} offset - offset for item query. Useful for pagination.
   * @param {string} group - project group id to query. Default returns sessions from all groups.
   */
  async total_count(
    status = 'RUNNING',
    accessKey = '',
    limit = 1,
    offset = 0,
    group = '',
  ): Promise<any> {
    let q, v;
    q = `query($limit:Int!, $offset:Int!, $ak:String, $group_id:String, $status:String) {
      compute_session_list(limit:$limit, offset:$offset, access_key:$ak, group_id:$group_id, status:$status) {
        total_count
      }
    }`;
    v = {
      limit: limit,
      offset: offset,
      status: status,
    };
    if (accessKey != '') {
      v['ak'] = accessKey;
    }
    if (group != '') {
      v['group_id'] = group;
    }
    return this.client.query(q, v);
  }

  /**
   * list compute sessions with specific conditions.
   *
   * @param {array} fields - fields to query. Default fields are: ["id", "name", "image", "created_at", "terminated_at", "status", "status_info", "occupied_slots", "cpu_used", "io_read_bytes", "io_write_bytes"].
   * @param {string or array} status - status to query. Default is 'RUNNING'.
   *        Available statuses are:`PREPARING`, `PREPARED`, `CREATING`, `BUILDING`, `PENDING`, `SCHEDULED`, `RUNNING`, `RESTARTING`, `RESIZING`, `SUSPENDED`, `TERMINATING`, `TERMINATED`, `ERROR`.
   * @param {string} accessKey - access key that is used to start compute sessions.
   * @param {number} limit - limit number of query items.
   * @param {number} offset - offset for item query. Useful for pagination.
   * @param {string} group - project group id to query. Default returns sessions from all groups.
   * @param {number} timeout - timeout for the request. Default uses SDK default. (5 sec.)
   */
  async list(
    fields = [
      'id',
      'name',
      'image',
      'created_at',
      'terminated_at',
      'status',
      'status_info',
      'occupied_slots',
      'containers {live_stat last_stat}',
      'starts_at',
    ],
    status = 'RUNNING',
    accessKey = '',
    limit = 30,
    offset = 0,
    group = '',
    timeout: number = 0,
  ): Promise<any> {
    fields = this.client._updateFieldCompatibilityByAPIVersion(fields); // For V3/V4 API compatibility
    let q, v;
    q = `query($limit:Int!, $offset:Int!, $ak:String, $group_id:String, $status:String) {
      compute_session_list(limit:$limit, offset:$offset, access_key:$ak, group_id:$group_id, status:$status) {
        items { ${fields.join(' ')}}
        total_count
      }
    }`;
    v = {
      limit: limit,
      offset: offset,
      status: status,
    };
    if (accessKey != '') {
      v['ak'] = accessKey;
    }
    if (group != '') {
      v['group_id'] = group;
    }
    return this.client.query(q, v, null, timeout);
  }

  /**
   * list all status of compute sessions.
   *
   * @param {array} fields - fields to query. Default fields are: ["session_name", "lang", "created_at", "terminated_at", "status", "status_info", "occupied_slots", "cpu_used", "io_read_bytes", "io_write_bytes"].
   * @param {String} status - status to query. The default is string with all status combined.
   * @param {string} accessKey - access key that is used to start compute sessions.
   * @param {number} limit - limit number of query items.
   * @param {number} offset - offset for item query. Useful for pagination.
   * @param {string} group - project group id to query. Default returns sessions from all groups.
   * @param {number} timeout - timeout for the request. Default uses SDK default. (5 sec.)
   */
  async listAll(
    fields = [
      'id',
      'name',
      'image',
      'created_at',
      'terminated_at',
      'status',
      'status_info',
      'occupied_slots',
      'containers {live_stat last_stat}',
    ],
    status = 'RUNNING,RESTARTING,TERMINATING,PENDING,SCHEDULED,PREPARING,PREPARED,CREATING,PULLING,TERMINATED,CANCELLED,ERROR',
    accessKey = '',
    limit = 100,
    offset = 0,
    group = '',
    timeout: number = 0,
  ): Promise<any> {
    fields = this.client._updateFieldCompatibilityByAPIVersion(fields);
    let q, v;
    const sessions: any = [];

    q = `query($limit:Int!, $offset:Int!, $ak:String, $group_id:String, $status:String) {
      compute_session_list(limit:$limit, offset:$offset, access_key:$ak, group_id:$group_id, status:$status) {
        items { ${fields.join(' ')}}
        total_count
      }
    }`;

    // Prevent fetching more than 1000 sessions.
    for (let offset = 0; offset < 10 * limit; offset += limit) {
      v = { limit, offset, status };
      if (accessKey != '') {
        v.access_key = accessKey;
      }
      if (group != '') {
        v.group_id = group;
      }
      const session = await this.client.query(q, v, null, timeout);
      sessions.push(...session.compute_session_list.items);
      if (offset >= session.compute_session_list.total_count) {
        break;
      }
    }
    return Promise.resolve(sessions);
  }

  /**
   * get compute session with specific condition.
   *
   * @param {array} fields - fields to query. Default fields are: ["session_name", "lang", "created_at", "terminated_at", "status", "status_info", "occupied_slots", "cpu_used", "io_read_bytes", "io_write_bytes"].
   * @param {string} sessionUuid - session ID to query specific compute session.
   */
  async get(
    fields = [
      'id',
      'session_name',
      'lang',
      'created_at',
      'terminated_at',
      'status',
      'status_info',
      'occupied_slots',
      'cpu_used',
      'io_read_bytes',
      'io_write_bytes',
      'scaling_group',
    ],
    sessionUuid = '',
  ): Promise<any> {
    fields = this.client._updateFieldCompatibilityByAPIVersion(fields); // For V3/V4 API compatibility
    let q, v;
    q = `query($session_uuid: UUID!) {
      compute_session(id:$session_uuid) {
        ${fields.join(' ')}
      }
    }`;
    v = { session_uuid: sessionUuid };
    return this.client.query(q, v);
  }

  async startService(
    loginSessionToken: string,
    session: string,
    app: string,
    port: number | null = null,
    envs: Record<string, unknown> | null = null,
    args: Record<string, unknown> | null = null,
  ) {
    let rqst = this.client.newSignedRequest(
      'POST',
      `/session/${session}/start-service`,
      {
        login_session_token: loginSessionToken,
        app,
        port: port || undefined,
        envs: envs || undefined,
        arguments: JSON.stringify(args) || undefined,
      },
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Request container commit for corresponding session in agent node
   *
   * @param sessionName - name of the session
   */
  async commitSession(sessionName: string = ''): Promise<any> {
    const rqst = this.client.newSignedRequest(
      'POST',
      `/session/${sessionName}/commit`,
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Request container commit for corresponding session in agent node
   *
   * @param sessionName - name of the session
   */
  async convertSessionToImage(sessionName: string, newImageName: string): Promise<any> {
    const rqst = this.client.newSignedRequest(
      'POST',
      `/session/${sessionName}/imagify`,
      { image_name: newImageName },
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get status of requested container commit on agent node (ongoing / finished / failed)
   *
   * @param sessionName - name of the session
   */
  async getCommitSessionStatus(sessionName: string = ''): Promise<any> {
    const rqst = this.client.newSignedRequest(
      'GET',
      `/session/${sessionName}/commit`,
    );
    return this.client._wrapWithPromise(rqst);
  }
}
