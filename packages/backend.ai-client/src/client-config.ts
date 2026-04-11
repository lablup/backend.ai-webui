class ClientConfig {
  public _apiVersionMajor: string;
  public _apiVersion: string;
  public _hashType: string;
  public _endpoint: string;
  public _endpointHost: string;
  public _accessKey: string;
  public _secretKey: string;
  public _userId: string;
  public _password: string;
  public _proxyURL: any;
  public _proxyToken: any;
  public _connectionMode: string;

  /**
   * The client Configuration object.
   *
   * @param {string} accessKey - access key to connect Backend.AI manager
   * @param {string} secretKey - secret key to connect Backend.AI manager
   * @param {string} endpoint  - endpoint of Backend.AI manager
   * @param {string} connectionMode - connection mode. 'API', 'SESSION' is supported. `SESSION` mode requires webserver.
   */
  constructor(
    accessKey?: string,
    secretKey?: string,
    endpoint?: string,
    connectionMode: string = 'API',
  ) {
    // default configs.
    this._apiVersionMajor = '8';
    this._apiVersion = 'v8.20240915'; // For compatibility with 24.09.
    this._hashType = 'sha256';
    if (endpoint === undefined || endpoint === null) {
      endpoint = 'https://api.backend.ai';
    }
    endpoint = endpoint.replace(/\/+$/, '');
    this._endpoint = endpoint;
    this._endpointHost = endpoint.replace(/^[^:]+:\/\//, '');
    if (connectionMode === 'API') {
      // API mode
      // dynamic configs
      if (accessKey === undefined || accessKey === null) {
        throw new Error(
          'You must set accessKey! (either as argument or environment variable)',
        );
      }
      if (secretKey === undefined || secretKey === null) {
        throw new Error(
          'You must set secretKey! (either as argument or environment variable)',
        );
      }
      this._accessKey = accessKey;
      this._secretKey = secretKey;
      this._userId = '';
      this._password = '';
    } else {
      // Session mode
      // dynamic configs
      if (accessKey === undefined || accessKey === null) {
        throw new Error(
          'You must set user id! (either as argument or environment variable)',
        );
      }
      if (secretKey === undefined || secretKey === null) {
        throw new Error(
          'You must set password! (either as argument or environment variable)',
        );
      }
      this._accessKey = '';
      this._secretKey = '';
      this._userId = accessKey;
      this._password = secretKey;
    }
    this._proxyURL = null;
    this._proxyToken = null;
    this._connectionMode = connectionMode;
  }

  get accessKey() {
    return this._accessKey;
  }

  get secretKey() {
    return this._secretKey;
  }

  get userId() {
    return this._userId;
  }

  get password() {
    return this._password;
  }

  get endpoint() {
    return this._endpoint;
  }

  get proxyURL() {
    return this._proxyURL;
  }

  get proxyToken() {
    return this._proxyToken;
  }

  get endpointHost() {
    return this._endpointHost;
  }

  get apiVersion() {
    return this._apiVersion;
  }

  get apiVersionMajor() {
    return this._apiVersionMajor;
  }

  get hashType() {
    return this._hashType;
  }

  get connectionMode() {
    return this._connectionMode;
  }

  /**
   * Create a ClientConfig object from environment variables.
   */
  static createFromEnv() {
    return new this(
      process.env.BACKEND_ACCESS_KEY,
      process.env.BACKEND_SECRET_KEY,
      process.env.BACKEND_ENDPOINT,
    );
  }
}

export { ClientConfig };
