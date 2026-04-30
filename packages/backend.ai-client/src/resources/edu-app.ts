// @ts-nocheck
export class EduApp {
  public client: any;
  public config: any;

  /**
   * Setting API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client: any) {
    this.client = client;
    this.config = null;
  }

  /**
   * Check if EduApp endpoint is available.
   */
  async ping(): Promise<any> {
    const rqst = this.client.newSignedRequest('GET', '/eduapp/ping');
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get mount folders for auto-mount.
   */
  async get_mount_folders(): Promise<any> {
    const rqst = this.client.newSignedRequest('GET', '/eduapp/mounts');
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get projects of user.
   */
  async get_user_projects() {
    const rqst = this.client.newSignedRequest('GET', '/eduapp/projects');
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get credential of user.
   */
  async get_user_credential(stoken: string) {
    const searchParams = new URLSearchParams({
      sToken: stoken,
    });
    const rqst = this.client.newSignedRequest(
      'GET',
      `/eduapp/credential?${searchParams.toString()}`,
    );
    return this.client._wrapWithPromise(rqst);
  }
}
