// @ts-nocheck
export class Maintenance {
  public client: any;
  public urlPrefix: any;

  /**
   * The Maintenance API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
    this.urlPrefix = '/resource';
  }

  /**
   * Attach to the background task to listen to events
   * @param {string} task_id - background task id.
   */
  attach_background_task(task_id: string): EventSource {
    let urlStr = '/events/background-task?task_id=' + task_id;
    let req = this.client.newSignedRequest('GET', urlStr, null);
    return new EventSource(req.uri, { withCredentials: true });
  }

  /**
   * Rescan image from repository
   * @param {string} registry - registry. default is ''
   * @param {string | undefined} project - project.
   */
  async rescan_images(registry = '', project?: string): Promise<any> {
    if (this.client.is_admin === true) {
      let q, v;
      const params: Record<string, string> = {};

      if (registry !== '') {
        registry = decodeURIComponent(registry);
        params.registry = registry;

        if (project !== undefined) {
        // The 'project' parameter is only applicable when 'registry' is provided.
          params.project = project
        }
      }

      if (Object.keys(params).length > 0) {
        const paramList = Object.keys(params).map(p => `$${p}: String`).join(', ');
        const argList = Object.keys(params).map(p => `${p}: $${p}`).join(', ');

        q = `mutation(${paramList}) {
          rescan_images(${argList}) {
            ok msg task_id
          }
        }`;
        v = params;
      } else {
        q = `mutation {
          rescan_images {
            ok msg task_id
          }
        }`;
        v = {};
      }

      return this.client.query(q, v, null);
    } else {
      return Promise.resolve(false);
    }
  }

  async recalculate_usage(): Promise<any> {
    if (this.client.is_superadmin === true) {
      let rqst = this.client.newSignedRequest(
        'POST',
        `${this.urlPrefix}/recalculate-usage`,
        null,
      );
      // Set specific timeout due to time for recalculate
      return this.client._wrapWithPromise(rqst, false, null, 60 * 1000);
    }
  }
}
