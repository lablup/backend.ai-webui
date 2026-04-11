// @ts-nocheck
export class Pipeline {
  public client: any;
  public tokenName: string;
  public urlPrefix: string;

  /**
   * Setting API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client: any) {
    this.client = client;
    this.tokenName = 'pipeline-token';
    this.urlPrefix = `/api/pipelines`;
  }

  /**
   *
   * @param {json} input - pipeline specification and data. Required fields are:
   * {
   *    'username': string,
   *    'password': string,
   *    'access_key': string,
   *    'secret_key': string,
   * }
   */
  async login(input): Promise<boolean> {
    const rqst = this.client.newSignedRequest(
      'POST',
      `/auth-token/`,
      input,
      'pipeline',
    );
    let result;
    try {
      result = await this.client._wrapWithPromise(rqst, false, null, 0, 0, {
        log: JSON.stringify({
          username: input.username,
          password: '********',
        }),
      });
      // if there's no token, then user account is invalid
      if (!result.hasOwnProperty('token')) {
        return Promise.resolve(false);
      } else {
        const token = result.token;
        document.cookie = `${this.tokenName}=${token}; path=/`;
        return Promise.resolve(false);
      }
    } catch (err) {
      throw {
        title: 'No Pipeline Server found at API Endpoint.',
        message:
          'Authentication failed. Check information and pipeline server status.',
      };
    }
  }

  async logout(): Promise<any> {
    const rqst = this.client.newSignedRequest(
      'DELETE',
      `/auth-token/`,
      null,
      'pipeline',
    );
    try {
      await this.client._wrapWithPromise(rqst);
    } catch (err) {
      throw {
        title: 'Pipeline Logout Failed.',
        message:
          'Pipeline Logout failed. Check information and pipeline server status.',
      };
    } finally {
      // remove cookie anyway
      this._removeCookieByName(this.tokenName);
    }
  }

  async check_login(): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'GET',
      `/api/users/me/`,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  getPipelineToken(): string {
    return this._getCookieByName(this.tokenName);
  }

  /**
   * List all pipelines
   */
  async list(): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/`,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get pipeline with given its id
   *
   * @param {string} id - pipeline id
   */
  async info(id): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/${id}/`,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Create a pipeline with input
   *
   * @param {json} input - pipeline specification and data. Required fields are:
   * {
   *    'name': string,
   *    'description' : string,
   *    'yaml': string,
   *    'dataflow': object,
   *    'is_active': boolean
   * }
   */
  async create(input): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/`,
      input,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Update the pipeline based on input value
   *
   * @param {string} id - pipeline id
   * @param {json} input - pipeline specification and data. Required fields are:
   * {
   *    'name': string,
   *    'description': string, // TODO
   *    'yaml': string,
   *    'dataflow': {},
   *    'is_active': boolean, // TODO
   * }
   */
  async update(id, input): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'PATCH',
      `${this.urlPrefix}/${id}/`,
      input,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Delete the pipeline
   *
   * @param {string} id - pipeline id
   */
  async delete(id): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'DELETE',
      `${this.urlPrefix}/${id}/`,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Instantiate(Run) pipeline to pipeline-job
   *
   * @param {string} id - pipeline id
   * @param {json} input - piepline specification and data. Required fields are:
   * {
   *    'name': string,
   *    'description': string,
   *    'yaml': string,
   *    'dataflow': {},
   *    'is_active': boolean,
   * }
   */
  async run(id, input): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/${id}/run/`,
      input,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get Cookie By its name if exists
   *
   * @param {string} name - cookie name
   * @returns {string} cookieValue
   */
  _getCookieByName(name = ''): string {
    let cookieValue: string = '';
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + '=') {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  /**
   * Remove Cookie By its name if exists
   *
   * @param {string} name - cookie name
   */
  _removeCookieByName(name = '') {
    if (name !== '') {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  }
}

export class PipelineJob {
  public client: any;
  public urlPrefix: string;

  /**
   * Setting API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client: any) {
    this.client = client;
    this.urlPrefix = `/api/pipeline-jobs`;
  }

  /**
   * List all pipeline jobs
   */
  async list(): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/`,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get pipeline job with given its id
   *
   * @param {string} id - pipeline id
   */
  async info(id): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/${id}/`,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Stop running pipeline job with given its id
   *
   * @param {string} id - pipeline id
   */
  async stop(id): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'DELETE',
      `${this.urlPrefix}/${id}/stop/`,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }
}

export class PipelineTaskInstance {
  public client: any;
  public urlPrefix: string;

  /**
   * Setting API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client: any) {
    this.client = client;
    this.urlPrefix = `/api/task-instances`;
  }

  /**
   * List all task instances of the pipeline job corresponding to pipelineJobId if its value is not null.
   * if not, then bring all task instances that pipeline server user created via every pipeline job
   *
   * @param {string} pipelineJobId - pipeline job id
   */
  async list(pipelineJobId: string = ''): Promise<any> {
    let queryString = `${this.urlPrefix}`;
    queryString += pipelineJobId ? `/?${new URLSearchParams({pipeline_job: pipelineJobId}).toString()}` : `/`;
    let rqst = this.client.newSignedRequest(
      'GET',
      queryString,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Get task instance with given its id
   *
   * @param {string} id - task instance id
   */
  async info(id): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'GET',
      `${this.urlPrefix}/${id}/`,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Create custom task instance with input
   *
   * @param {json} input
   */
  async create(input): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'POST',
      `${this.urlPrefix}/`,
      input,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Update the task instance based on input value
   *
   * @param {string} id - task instance id
   * @param {json} input - task-instance specification and data.
   */
  async update(id, input): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'PATCH',
      `${this.urlPrefix}/${id}/`,
      input,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Delete the task-instance
   *
   * @param {string} id - task instance id
   */
  async delete(id): Promise<any> {
    let rqst = this.client.newSignedRequest(
      'DELETE',
      `${this.urlPrefix}/${id}/`,
      null,
      'pipeline',
    );
    return this.client._wrapWithPromise(rqst);
  }
}
