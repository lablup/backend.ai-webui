// @ts-nocheck
export class Registry {
  public client: any;

  constructor(client) {
    this.client = client;
  }

  async list(): Promise<any> {
    const rqst = this.client.newSignedRequest('POST', '/config/get', {
      key: 'config/docker/registry',
      prefix: true,
    });
    return this.client._wrapWithPromise(rqst);
  }

  async set(key: string, value): Promise<any> {
    key = encodeURIComponent(key);
    let regkey = `config/docker/registry/${key}`;
    const rqst = this.client.newSignedRequest('POST', '/config/set', {
      key: regkey,
      value,
    });
    return this.client._wrapWithPromise(rqst);
  }

  async delete(key): Promise<any> {
    key = encodeURIComponent(key);
    const rqst = this.client.newSignedRequest('POST', '/config/delete', {
      key: `config/docker/registry/${key}`,
      prefix: true,
    });
    return this.client._wrapWithPromise(rqst);
  }
}
