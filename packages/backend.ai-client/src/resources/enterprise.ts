// @ts-nocheck
export class Enterprise {
  public client: any;
  public config: any;
  public certificate: any;

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
   * Get the current enterprise license.
   */
  async getLicense(): Promise<any> {
    if (this.client.is_superadmin === true) {
      if (typeof this.certificate === 'undefined') {
        const rqst = this.client.newSignedRequest('GET', '/license');
        let cert = await this.client._wrapWithPromise(rqst).catch((e: any) => {
          if (e.statusCode == 404) {
            // The open-source project version does not have a certificate.
            return Promise.resolve(null);
          }
          // Unknown error
          return Promise.resolve(undefined);
        });
        if (cert) {
          this.certificate = cert.certificate;
          this.certificate['valid'] = cert.status === 'valid';
        }
        return Promise.resolve(this.certificate);
      }
    } else {
      return Promise.resolve(undefined);
    }
  }
}
