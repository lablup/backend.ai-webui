// @ts-nocheck
export class SessionTemplate {
  public client: any;
  public urlPrefix: string;

  /**
   * The Computate session template API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
    this.urlPrefix = '/template/session';
  }

  /**
   * list session templates with specific conditions.
   *
   * @param {boolean} listall - returns all list
   * @param {string} groupId - ID of group where session templates are bound
   */
  async list(listall = false, groupId = null): Promise<any> {
    let reqUrl = this.urlPrefix;
    if (listall) {
      const params = { all: listall ? 'true' : 'false' };
      const q = new URLSearchParams(params).toString();
      reqUrl += `?${q}`;
    }
    if (groupId) {
      const params = { group_id: groupId };
      const q = new URLSearchParams(params).toString();
      reqUrl += `?${q}`;
    }
    let rqst = this.client.newSignedRequest('GET', reqUrl, null);
    return this.client._wrapWithPromise(rqst);
  }
}
