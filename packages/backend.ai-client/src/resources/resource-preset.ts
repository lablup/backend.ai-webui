export class ResourcePreset {
  public client: any;
  public urlPrefix: any;

  /**
   * Resource Preset API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
    this.urlPrefix = '/resource';
  }

  /**
   * Return the GraphQL Promise object containing resource preset list.
   */
  async list(param = null): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/presets`,
      param,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Return the GraphQL Promise object containing resource preset checking result.
   */
  async check(param = null): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/check-presets`,
      param,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * add resource preset with given name and fields.
   *
   * @param {string} name - resource preset name.
   * @param {json} input - resource preset specification and data. Required fields are:
   * {
   *   'resource_slots': JSON.stringify(total_resource_slots), // Resource slot value. should be Stringified JSON.
   * };
   */
  async add(name = null, input): Promise<any> {
    if (this.client.is_admin === true && name !== null) {
      let q =
        `mutation($name: String!, $input: CreateResourcePresetInput!) {` +
        `  create_resource_preset(name: $name, props: $input) {` +
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
   * mutate specified resource preset with given name with new values.
   *
   * @param {string} name - resource preset name to mutate.
   * @param {json} input - resource preset specification and data. Required fields are:
   * {
   *   'resource_slots': JSON.stringify(total_resource_slots), // Resource slot value. should be Stringified JSON.
   * };
   */
  async mutate(name = null, input): Promise<any> {
    if (this.client.is_admin === true && name !== null) {
      let q =
        `mutation($name: String!, $input: ModifyResourcePresetInput!) {` +
        `  modify_resource_preset(name: $name, props: $input) {` +
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
   * delete specified resource preset with given name.
   *
   * @param {string} name - resource preset name to delete.
   */
  async delete(name = null): Promise<any> {
    if (this.client.is_admin === true && name !== null) {
      let q =
        `mutation($name: String!) {` +
        `  delete_resource_preset(name: $name) {` +
        `    ok msg ` +
        `  }` +
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
