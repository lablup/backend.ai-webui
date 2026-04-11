export class ContainerImage {
  public client: any;

  /**
   * The Container image API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * list container images registered on the manager.
   *
   * @param {array} fields - fields to query. Default fields are: ["name", "tag", "registry", "digest", "installed", "resource_limits { key min max }"]
   * @param {boolean} installed_only - filter images to installed / not installed. true to query installed images only.
   * @param {boolean} system_images - filter images to get system images such as web UI, SFTP server. true to query system images only.
   */
  async list(
    fields = [
      'name',
      'tag',
      'registry',
      'digest',
      'installed',
      'labels { key value }',
      'resource_limits { key min max }',
    ],
    installed_only = false,
    system_images = false,
  ): Promise<any> {
    let q, v;
    if (installed_only) {
      q =
        `query($installed:Boolean) {` +
        `  images(is_installed:$installed) { ${fields.join(' ')} }` +
        '}';
      v = { installed: installed_only, is_operation: system_images };
    } else {
      q = `query {` + `  images { ${fields.join(' ')} }` + '}';
      v = { is_operation: system_images };
    }
    return this.client.query(q, v);
  }

  /**
   * Modify resource of given image.
   *
   * @param {string} registry - Registry name
   * @param {string} image - image name.
   * @param {string} tag - image tag.
   * @param {object} input - value list to set.
   */
  async modifyResource(registry, image, tag, input): Promise<any[]> {
    let promiseArray: Array<Promise<any>> = [];
    registry = registry.replace(/:/g, '%3A');
    image = image.replace(/\//g, '%2F');
    Object.keys(input).forEach((slot_type) => {
      Object.keys(input[slot_type]).forEach((key) => {
        const rqst = this.client.newSignedRequest('POST', '/config/set', {
          key: `images/${registry}/${image}/${tag}/resource/${slot_type}/${key}`,
          value: input[slot_type][key],
        });
        promiseArray.push(this.client._wrapWithPromise(rqst));
      });
    });
    return Promise.all(promiseArray);
  }

  /**
   * Modify label of given image.
   *
   * @param {string} registry - Registry name
   * @param {string} image - image name.
   * @param {string} tag - image tag.
   * @param {string} key - key to change.
   * @param {string} value - value for the key.
   */
  async modifyLabel(registry, image, tag, key, value): Promise<any> {
    registry = registry.replace(/:/g, '%3A');
    image = image.replace(/\//g, '%2F');
    tag = tag.replace(/\//g, '%2F');
    const rqst = this.client.newSignedRequest('POST', '/config/set', {
      key: `images/${registry}/${image}/${tag}/labels/${key}`,
      value: value,
    });
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * install specific container images from registry
   *
   * @param {string} name - name to install. it should contain full path with tags. e.g. lablup/python:3.6-ubuntu18.04
   * @param {string} architecture - architecture to install.
   * @param {object} resource - resource to use for installation.
   * @param {string} registry - registry of image. default is 'index.docker.io', which is public Backend.AI docker registry.
   */
  async install(
    name,
    architecture,
    resource: object = {},
    registry: string = 'index.docker.io',
  ): Promise<any> {
    registry = (registry === 'index.docker.io' ? '' : registry + '/').replace(
      /:/g,
      '%3A',
    );
    const sessionId = this.client.generateSessionId();
    if (Object.keys(resource).length === 0) {
      resource = {
        cpu: '1',
        mem: '512m',
        enqueueOnly: true,
        type: 'batch',
        startupCommand: 'echo "Image is installed"',
      };
    }
    return this.client
      .createIfNotExists(
        registry + name,
        sessionId,
        resource,
        10000,
        architecture,
      )
      .catch((err) => {
        throw err;
      });
  }

  /**
   * uninstall specific container images from registry (TO BE IMPLEMENTED)
   *
   * @param {string} name - name to install. it should contain full path with tags. e.g. lablup/python:3.6-ubuntu18.04
   * @param {string} registry - registry of image. default is 'index.docker.io', which is public Backend.AI docker registry.
   */
  async uninstall(
    name,
    registry: string = 'index.docker.io',
  ): Promise<boolean> {
    return Promise.resolve(false); // Temporally disable the feature.
  }

  /**
   * Get image label information.
   *
   * @param {string} registry - Registry name
   * @param {string} image - image name.
   * @param {string} tag - tag to get.
   */
  async get(registry, image, tag): Promise<any> {
    registry = registry.replace(/:/g, '%3A');
    const rqst = this.client.newSignedRequest('POST', '/config/get', {
      key: `images/${registry}/${image}/${tag}/resource/`,
      prefix: true,
    });
    return this.client._wrapWithPromise(rqst);
  }
}
