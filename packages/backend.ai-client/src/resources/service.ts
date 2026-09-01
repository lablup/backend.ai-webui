// @ts-nocheck
export class Service {
  public client: any;
  public config: any;

  /**
   * Service-specific API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
    this.config = null;
  }

  /**
   * Get announcements
   *
   */
  async get_announcement(): Promise<any> {
    const rqst = this.client.newSignedRequest(
      'GET',
      '/manager/announcement',
      null,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Update announcement
   *
   * @param {boolean} enabled - Enable / disable announcement. Default is True.
   * @param {string} message - Announcement content. Usually in Markdown syntax.
   */
  async update_announcement(enabled = true, message): Promise<any> {
    const rqst = this.client.newSignedRequest('POST', '/manager/announcement', {
      enabled: enabled,
      message: message,
    });
    return this.client._wrapWithPromise(rqst);
  }
}
