// @ts-nocheck
export class Agent {
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
   * List computation agents.
   *
   * @param {string} status - Status to query. Should be one of 'ALIVE', 'PREPARING', 'TERMINATING' and 'TERMINATED'.
   * @param {array} fields - Fields to query. Queryable fields are:  'id', 'status', 'region', 'first_contact', 'cpu_cur_pct', 'mem_cur_bytes', 'available_slots', 'occupied_slots'.
   * @param {number} timeout - timeout for the request. Default uses SDK default. (5 sec.)
   */
  async list(
    status = 'ALIVE',
    fields = [
      'id',
      'status',
      'region',
      'first_contact',
      'cpu_cur_pct',
      'mem_cur_bytes',
      'available_slots',
      'occupied_slots',
    ],
    timeout: number = 0,
  ): Promise<any> {
    if (!['ALIVE', 'TERMINATED'].includes(status)) {
      return Promise.resolve(false);
    }
    let q =
      `query($status: String) {` +
      `  agents(status: $status) {` +
      `     ${fields.join(' ')}` +
      `  }` +
      `}`;
    let v = { status: status };
    return this.client.query(q, v, null, timeout);
  }

  /**
   * modify agent configuration with given name and fields.
   *
   * @param {string | null} id - resource preset name.
   * @param {json} input - resource preset specification and data. Required fields are:
   * {
   *   'schedulable': schedulable
   * };
   */
  async update(id = null, input): Promise<any> {
    if (this.client.is_superadmin === true && id !== null) {
      let q =
        `mutation($id: String!, $input: ModifyAgentInput!) {` +
        `  modify_agent(id: $id, props: $input) {` +
        `    ok msg ` +
        `  }` +
        `}`;
      let v = {
        id: id,
        input: input,
      };
      return this.client.query(q, v);
    } else {
      return Promise.resolve(false);
    }
  }
}

export class AgentSummary {
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
   * List of agent summary.
   *
   * @param {string} status - Status to query. Should be one of 'ALIVE', 'PREPARING', 'TERMINATING' and 'TERMINATED'.
   * @param {array} fields - Fields to query. Queryable fields are:  id, status, scaling_group, schedulable, schedulable, available_slots, occupied_slots.
   * @param {number} limit - limit number of query items.
   * @param {number} offset - offset for item query. Useful for pagination.
   * @param {number} timeout - timeout for the request. Default uses SDK default. (5 sec.)
   */
  async list(
    status = 'ALIVE',
    fields = [
      'id',
      'status',
      'scaling_group',
      'schedulable',
      'available_slots',
      'occupied_slots',
      'architecture',
    ],
    limit = 20,
    offset = 0,
    timeout: number = 0,
  ): Promise<any> {
    let f = fields.join(' ');
    if (!['ALIVE', 'TERMINATED'].includes(status)) {
      return Promise.resolve(false);
    }
    let q = `query($limit:Int!, $offset:Int!, $status:String) {
        agent_summary_list(limit:$limit, offset:$offset, status:$status) {
           items { ${f} }
           total_count
        }
      }`;
    let v = {
      limit: limit,
      offset: offset,
      status: status,
    };
    return this.client.query(q, v, null, timeout);
  }
}
