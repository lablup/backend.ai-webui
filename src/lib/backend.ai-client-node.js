'use babel';
/*
Backend.AI API Library / SDK for Node.JS / Javascript ES6 (v20.04.0)
====================================================================

(C) Copyright 2016-2020 Lablup Inc.
Licensed under MIT
*/
/*jshint esnext: true */
//const fetch = require('node-fetch'); /* Exclude for ES6 */
//const Headers = fetch.Headers; /* Exclude for ES6 */
const crypto_node = require('crypto');
//const FormData = require('form-data');
const querystring = require('querystring');
class ClientConfig {
    /**
     * The client Configuration object.
     *
     * @param {string} accessKey - access key to connect Backend.AI manager
     * @param {string} secretKey - secret key to connect Backend.AI manager
     * @param {string} endpoint  - endpoint of Backend.AI manager
     * @param {string} connectionMode - connection mode. 'API', 'SESSION' is supported. `SESSION` mode requires console-server.
     */
    constructor(accessKey, secretKey, endpoint, connectionMode = 'API') {
        // default configs.
        this._apiVersionMajor = '4';
        this._apiVersion = 'v4.20190315'; // For compatibility with 19.03 / 1.4
        this._hashType = 'sha256';
        if (endpoint === undefined || endpoint === null)
            endpoint = 'https://api.backend.ai';
        this._endpoint = endpoint;
        this._endpointHost = endpoint.replace(/^[^:]+:\/\//, '');
        if (connectionMode === 'API') { // API mode
            // dynamic configs
            if (accessKey === undefined || accessKey === null)
                throw 'You must set accessKey! (either as argument or environment variable)';
            if (secretKey === undefined || secretKey === null)
                throw 'You must set secretKey! (either as argument or environment variable)';
            this._accessKey = accessKey;
            this._secretKey = secretKey;
            this._userId = '';
            this._password = '';
        }
        else { // Session mode
            // dynamic configs
            if (accessKey === undefined || accessKey === null)
                throw 'You must set user id! (either as argument or environment variable)';
            if (secretKey === undefined || secretKey === null)
                throw 'You must set password! (either as argument or environment variable)';
            this._accessKey = '';
            this._secretKey = '';
            this._userId = accessKey;
            this._password = secretKey;
        }
        this._proxyURL = null;
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
        return new this(process.env.BACKEND_ACCESS_KEY, process.env.BACKEND_SECRET_KEY, process.env.BACKEND_ENDPOINT);
    }
}
class Client {
    /**
     * The client API wrapper.
     *
     * @param {ClientConfig} config - the API client-side configuration
     * @param {string} agentSignature - an extra string that will be appended to User-Agent headers when making API requests
     */
    constructor(config, agentSignature) {
        this.ready = false;
        this.code = null;
        this.sessionId = null;
        this.kernelType = null;
        this.clientVersion = '19.09.0';
        this.agentSignature = agentSignature;
        if (config === undefined) {
            this._config = ClientConfig.createFromEnv();
        }
        else {
            this._config = config;
        }
        this._managerVersion = null;
        this._apiVersion = null;
        this._apiVersionMajor = null;
        this.is_admin = false;
        this.is_superadmin = false;
        this.kernelPrefix = '/kernel';
        this.resourcePreset = new ResourcePreset(this);
        this.vfolder = new VFolder(this);
        this.agent = new Agent(this);
        this.keypair = new Keypair(this);
        this.image = new ContainerImage(this);
        this.utils = new utils(this);
        this.computeSession = new ComputeSession(this);
        this.resourcePolicy = new ResourcePolicy(this);
        this.user = new User(this);
        this.group = new Group(this);
        this.domain = new Domain(this);
        this.resources = new Resources(this);
        this.maintenance = new Maintenance(this);
        this.scalingGroup = new ScalingGroup(this);
        this.registry = new Registry(this);
        this.setting = new Setting(this);
        this.userConfig = new UserConfig(this);
        this.domain = new Domain(this);
        this._features = {}; // feature support list
        this.abortController = new AbortController();
        this.abortSignal = this.abortController.signal;
        this.requestTimeout = 5000;
        //if (this._config.connectionMode === 'API') {
        //this.getManagerVersion();
        //}
    }
    /**
     * Return the server-side manager version.
     */
    get managerVersion() {
        return this._managerVersion;
    }
    /**
     * Return the server-side manager version.
     */
    get apiVersion() {
        return this._apiVersion;
    }
    /**
     * Promise wrapper for asynchronous request to Backend.AI manager.
     *
     * @param {Request} rqst - Request object to send
     * @param {Boolean} rawFile - True if it is raw request
     * @param {AbortController.signal} signal - Request signal to abort fetch
     * @param {number} timeout - Custom timeout (sec.) If no timeout is given, default timeout is used.
     */
    async _wrapWithPromise(rqst, rawFile = false, signal = null, timeout = 0) {
        let errorType = Client.ERR_REQUEST;
        let errorTitle = '';
        let errorMsg;
        let resp, body, requestTimer;
        try {
            if (rqst.method == 'GET') {
                rqst.body = undefined;
            }
            if (this._config.connectionMode === 'SESSION') { // Force request to use Public when session mode is enabled
                rqst.credentials = 'include';
                rqst.mode = 'cors';
            }
            if (signal !== null) {
                rqst.signal = signal;
            }
            else { // Use client-wide fetch timeout.
                let controller = new AbortController();
                rqst.signal = controller.signal;
                requestTimer = setTimeout(() => {
                    errorType = Client.ERR_TIMEOUT;
                    controller.abort();
                }, (timeout === 0 ? this.requestTimeout : timeout));
            }
            let resp;
            resp = await fetch(rqst.uri, rqst);
            if (typeof requestTimer !== "undefined") {
                clearTimeout(requestTimer);
            }
            errorType = Client.ERR_RESPONSE;
            let contentType = resp.headers.get('Content-Type');
            if (rawFile === false && contentType === null) {
                if (resp.blob === undefined)
                    body = await resp.buffer(); // for node-fetch
                else
                    body = await resp.blob();
            }
            else if (rawFile === false && (contentType.startsWith('application/json') ||
                contentType.startsWith('application/problem+json'))) {
                body = await resp.json(); // Formatted error message from manager
                errorType = body.type;
                errorTitle = body.title;
            }
            else if (rawFile === false && contentType.startsWith('text/')) {
                body = await resp.text();
            }
            else {
                if (resp.blob === undefined) {
                    body = await resp.buffer(); // for node-fetch
                }
                else {
                    body = await resp.blob();
                }
            }
            errorType = Client.ERR_SERVER;
            if (!resp.ok) {
                throw body;
            }
        }
        catch (err) {
            let error_message;
            if (typeof err == 'object' && err.constructor === Object && 'title' in err) {
                error_message = err.title; // formatted message
            }
            else {
                error_message = err;
            }
            if (typeof (resp) === 'undefined') {
                resp = {};
            }
            switch (errorType) {
                case Client.ERR_REQUEST:
                    errorType = 'https://api.backend.ai/probs/client-request-error';
                    if (navigator.onLine) {
                        errorTitle = error_message;
                        errorMsg = `sending request has failed: ${error_message}`;
                    }
                    else {
                        errorTitle = "Network disconnected.";
                        errorMsg = `sending request has failed: Network disconnected`;
                    }
                    break;
                case Client.ERR_RESPONSE:
                    errorType = 'https://api.backend.ai/probs/client-response-error';
                    errorTitle = error_message;
                    errorMsg = `reading response has failed: ${error_message}`;
                    break;
                case Client.ERR_SERVER:
                    errorType = 'https://api.backend.ai/probs/server-error';
                    errorTitle = `${resp.status} ${resp.statusText} - ${body.title}`;
                    errorMsg = 'server responded failure: ';
                    if (body.msg) {
                        errorMsg = errorMsg + `${resp.status} ${resp.statusText} - ${body.msg}`;
                    }
                    else {
                        errorMsg = errorMsg + `${resp.status} ${resp.statusText} - ${body.title}`;
                    }
                    break;
                case Client.ERR_ABORT:
                    errorType = 'https://api.backend.ai/probs/request-abort-error';
                    errorTitle = `Request aborted`;
                    errorMsg = 'Request aborted by user';
                    resp.status = 408;
                    resp.statusText = 'Request aborted by user';
                    break;
                case Client.ERR_TIMEOUT:
                    errorType = 'https://api.backend.ai/probs/request-timeout-error';
                    errorTitle = `Request timeout`;
                    errorMsg = 'No response returned during the timeout period';
                    resp.status = 408;
                    resp.statusText = 'Timeout exceeded';
                    break;
                default:
                    if (typeof resp.status === 'undefined') {
                        resp.status = 500;
                        resp.statusText = 'Server error';
                    }
                    if (errorType === '') {
                        errorType = Client.ERR_UNKNOWN;
                    }
                    if (errorTitle === '') {
                        errorTitle = body.title;
                    }
                    errorMsg = 'server responded failure: '
                        + `${resp.status} ${resp.statusText} - ${body.title}`;
            }
            throw {
                isError: true,
                timestamp: new Date().toUTCString(),
                type: errorType,
                requestUrl: rqst.uri,
                requestMethod: rqst.method,
                requestParameters: rqst.body,
                statusCode: resp.status,
                statusText: resp.statusText,
                title: errorTitle,
                message: errorMsg,
            };
        }
        let previous_log = JSON.parse(localStorage.getItem('backendaiconsole.logs'));
        if (previous_log) {
            if (previous_log.length > 5000) {
                previous_log = previous_log.slice(1, 5000);
            }
        }
        let log_stack = Array();
        if (typeof (resp) === 'undefined') {
            resp = {
                status: 'No status',
                statusText: 'No response given.'
            };
        }
        let current_log = {
            "isError": false,
            "timestamp": new Date().toUTCString(),
            "type": "",
            "requestUrl": rqst.uri,
            "requestMethod": rqst.method,
            "requestParameters": rqst.body,
            "statusCode": resp.status,
            "statusText": resp.statusText,
            "title": body.title,
            "message": ""
        };
        log_stack.push(current_log);
        if (previous_log) {
            log_stack = log_stack.concat(previous_log);
        }
        localStorage.setItem('backendaiconsole.logs', JSON.stringify(log_stack));
        return body;
    }
    /**
     * Return the server-side API version.
     *
     * @param {AbortController.signal} signal - Request signal to abort fetch
     *
     */
    getServerVersion(signal = null) {
        let rqst = this.newPublicRequest('GET', '/', null, '');
        return this._wrapWithPromise(rqst, false, signal);
    }
    /**
     * Get API major version
     */
    get APIMajorVersion() {
        return this._apiVersionMajor;
    }
    /**
     * Force API major version
     */
    set APIMajorVersion(value) {
        this._apiVersionMajor = value;
        this._config._apiVersionMajor = this._apiVersionMajor; // To upgrade API version with server version
    }
    /**
     * Get the server-side manager version.
     *
     * @param {AbortController.signal} signal - Request signal to abort fetch
     */
    async getManagerVersion(signal = null) {
        if (this._managerVersion === null) {
            let v = await this.getServerVersion(signal);
            this._managerVersion = v.manager;
            this._apiVersion = v.version;
            this._config._apiVersion = this._apiVersion; // To upgrade API version with server version
            this._apiVersionMajor = v.version.substr(1, 2);
            this._config._apiVersionMajor = this._apiVersionMajor; // To upgrade API version with server version
            if (this._apiVersionMajor > 4) {
                this.kernelPrefix = '/session';
            }
        }
        return this._managerVersion;
    }
    /**
     * Check compatibility of current manager
     */
    supports(feature) {
        if (Object.keys(this._features).length === 0) {
            this._updateSupportList();
        }
        if (feature in this._features) {
            return this._features[feature];
        }
        else {
            return false;
        }
    }
    _updateFieldCompatibilityByAPIVersion(fields) {
        const v4_replacements = {
            'session_name': 'sess_id'
        };
        if (this._apiVersionMajor < 5) { // For V3/V4 API compatibility
            Object.keys(v4_replacements).forEach(key => {
                let index = fields.indexOf(key);
                if (index !== -1) {
                    fields[index] = v4_replacements[key];
                }
            });
        }
        return fields;
    }
    _updateSupportList() {
        if (this.isAPIVersionCompatibleWith('v4.20190601')) {
            this._features['scaling-group'] = true;
            this._features['group'] = true;
            this._features['group-folder'] = true;
            this._features['system-images'] = true;
            this._features['detailed-session-states'] = true;
        }
    }
    /**
     * Return if manager is compatible with given version.
     */
    isManagerVersionCompatibleWith(version) {
        let managerVersion = this._managerVersion;
        managerVersion = managerVersion.split('.').map(s => s.padStart(10)).join('.');
        version = version.split('.').map(s => s.padStart(10)).join('.');
        return version <= managerVersion;
    }
    /**
     * Return if api is compatible with given version.
     */
    isAPIVersionCompatibleWith(version) {
        let apiVersion = this._apiVersion;
        if (apiVersion !== null && version !== null) {
            apiVersion = apiVersion.split('.').map(s => s.padStart(10)).join('.');
            version = version.split('.').map(s => s.padStart(10)).join('.');
        }
        return version <= apiVersion;
    }
    /**
     * Check if console-server is authenticated. This requires additional console-server package.
     *
     */
    async check_login() {
        let rqst = this.newSignedRequest('POST', `/server/login-check`, null);
        let result;
        try {
            result = await this._wrapWithPromise(rqst);
            if (result.authenticated === true) {
                this._config._accessKey = result.data.access_key;
                this._config._session_id = result.session_id;
            }
            console.log("login succeed");
        }
        catch (err) {
            console.log(err);
            return Promise.resolve(false);
        }
        return result.authenticated;
    }
    /**
     * Login into console-server with given ID/Password. This requires additional console-server package.
     *
     */
    async login() {
        let body = {
            'username': this._config.userId,
            'password': this._config.password
        };
        let rqst = this.newSignedRequest('POST', `/server/login`, body);
        let result;
        try {
            result = await this._wrapWithPromise(rqst);
            if (result.authenticated === true) {
                return this.check_login();
            }
            else {
                return Promise.resolve(false);
            }
        }
        catch (err) {
            return false;
        }
    }
    /**
     * Logout from console-server. This requires additional console-server package.
     *
     */
    logout() {
        let body = {};
        let rqst = this.newSignedRequest('POST', `/server/logout`, body);
        return this._wrapWithPromise(rqst);
    }
    /**
     * Leave from manager user. This requires additional console-server package.
     *
     */
    async signout(userid, password) {
        let body = {
            'username': userid,
            'password': password
        };
        let rqst = this.newSignedRequest('POST', `/auth/signout`, body);
        return this._wrapWithPromise(rqst);
    }
    /**
     * Update user's password.
     *
     */
    async updatePassword(oldPassword, newPassword, newPassword2) {
        let body = {
            'old_password': oldPassword,
            'new_password': newPassword,
            'new_password2': newPassword2
        };
        let rqst = this.newSignedRequest('POST', `/auth/update-password`, body);
        return this._wrapWithPromise(rqst);
    }
    /**
     * Return the resource slots.
     */
    async getResourceSlots() {
        let rqst;
        if (this.isAPIVersionCompatibleWith('v4.20190601')) {
            rqst = this.newPublicRequest('GET', '/config/resource-slots', null, '');
        }
        else {
            rqst = this.newPublicRequest('GET', '/etcd/resource-slots', null, '');
        }
        return this._wrapWithPromise(rqst);
    }
    /**
     * Create a compute session if the session for the given sessionId does not exists.
     * It returns the information for the existing session otherwise, without error.
     *
     * @param {string} kernelType - the kernel type (usually language runtimes)
     * @param {string} sessionId - user-defined session ID
     * @param {object} resources - Per-session resource
     */
    createIfNotExists(kernelType, sessionId, resources = {}) {
        if (typeof sessionId === 'undefined' || sessionId === null)
            sessionId = this.generateSessionId();
        let params = {
            "lang": kernelType,
            "clientSessionToken": sessionId,
        };
        if (resources != {}) {
            let config = {};
            if (resources['cpu']) {
                config['cpu'] = resources['cpu'];
            }
            if (resources['mem']) {
                config['mem'] = resources['mem'];
            }
            if (resources['gpu']) { // Legacy support (till 19.09)
                config['cuda.device'] = parseInt(resources['gpu']);
            }
            if (resources['cuda.device']) { // Generalized device information from 20.03
                config['cuda.device'] = parseInt(resources['cuda.device']);
            }
            if (resources['vgpu']) { // Legacy support (till 19.09)
                config['cuda.shares'] = parseFloat(resources['vgpu']).toFixed(2); // under 19.03
            }
            else if (resources['fgpu']) {
                config['cuda.shares'] = parseFloat(resources['fgpu']).toFixed(2); // 19.09 and above
            }
            if (resources['cuda.shares']) { // Generalized device information from 20.03
                config['cuda.shares'] = parseFloat(resources['cuda.shares']).toFixed(2);
            }
            if (resources['tpu']) {
                config['tpu.device'] = resources['tpu'];
            }
            if (resources['env']) {
                config['environ'] = resources['env'];
            }
            if (resources['clustersize']) {
                config['clusterSize'] = resources['clustersize'];
            }
            if (resources['group_name']) {
                params['group_name'] = resources['group_name'];
            }
            if (resources['domain']) {
                params['domain'] = resources['domain'];
            }
            if (resources['enqueueOnly']) {
                params['enqueueOnly'] = resources['enqueueOnly'];
            }
            if (resources['maxWaitSeconds']) {
                params['maxWaitSeconds'] = resources['maxWaitSeconds'];
            }
            if (resources['reuseIfExists']) {
                params['reuseIfExists'] = resources['reuseIfExists'];
            }
            if (resources['startupCommand']) {
                params['startupCommand'] = resources['startupCommand'];
            }
            if (resources['owner_access_key']) {
                params['owner_access_key'] = resources['owner_access_key'];
            }
            //params['config'] = {};
            params['config'] = { resources: config };
            if (resources['mounts']) {
                params['config'].mounts = resources['mounts'];
            }
            if (resources['scaling_group']) {
                params['config'].scaling_group = resources['scaling_group'];
            }
            if (resources['shmem']) {
                params['config'].resource_opts = {};
                params['config'].resource_opts.shmem = resources['shmem'];
            }
        }
        let rqst;
        if (this._apiVersionMajor < 5) { // For V3/V4 API compatibility
            rqst = this.newSignedRequest('POST', `${this.kernelPrefix}/create`, params);
        }
        else {
            rqst = this.newSignedRequest('POST', `${this.kernelPrefix}`, params);
        }
        return this._wrapWithPromise(rqst);
    }
    /**
     * Obtain the session information by given sessionId.
     *
     * @param {string} sessionId - the sessionId given when created
     */
    getInformation(sessionId, ownerKey = null) {
        let queryString = `${this.kernelPrefix}/${sessionId}`;
        if (ownerKey != null) {
            queryString = `${queryString}?owner_access_key=${ownerKey}`;
        }
        let rqst = this.newSignedRequest('GET', queryString, null);
        return this._wrapWithPromise(rqst);
    }
    /**
     * Obtain the session information by given sessionId.
     *
     * @param {string} sessionId - the sessionId given when created
     * @param {string | null} ownerKey - owner key to access
     */
    getLogs(sessionId, ownerKey = null) {
        let queryString = `${this.kernelPrefix}/${sessionId}/logs`;
        if (ownerKey != null) {
            queryString = `${queryString}?owner_access_key=${ownerKey}`;
        }
        let rqst = this.newSignedRequest('GET', queryString, null);
        return this._wrapWithPromise(rqst);
    }
    /**
     * Terminate and destroy the kernel session.
     *
     * @param {string} sessionId - the sessionId given when created
     */
    destroy(sessionId, ownerKey = null) {
        let queryString = `${this.kernelPrefix}/${sessionId}`;
        if (ownerKey != null) {
            queryString = `${queryString}?owner_access_key=${ownerKey}`;
        }
        let rqst = this.newSignedRequest('DELETE', queryString, null);
        return this._wrapWithPromise(rqst);
    }
    /**
     * Restart the kernel session keeping its work directory and volume mounts.
     *
     * @param {string} sessionId - the sessionId given when created
     */
    restart(sessionId, ownerKey = null) {
        let queryString = `${this.kernelPrefix}/${sessionId}`;
        if (ownerKey != null) {
            queryString = `${queryString}?owner_access_key=${ownerKey}`;
        }
        let rqst = this.newSignedRequest('PATCH', queryString, null);
        return this._wrapWithPromise(rqst);
    }
    // TODO: interrupt
    // TODO: auto-complete
    /**
     * Execute a code snippet or schedule batch-mode executions.
     *
     * @param {string} sessionId - the sessionId given when created
     * @param {string} runId - a random ID to distinguish each continuation until finish (the length must be between 8 to 64 bytes inclusively)
     * @param {string} mode - either "query", "batch", "input", or "continue"
     * @param {string} opts - an optional object specifying additional configs such as batch-mode build/exec commands
     */
    execute(sessionId, runId, mode, code, opts) {
        let params = {
            "mode": mode,
            "code": code,
            "runId": runId,
            "options": opts,
        };
        let rqst = this.newSignedRequest('POST', `${this.kernelPrefix}/${sessionId}`, params);
        return this._wrapWithPromise(rqst);
    }
    // legacy aliases
    createKernel(kernelType, sessionId = undefined, resources = {}) {
        return this.createIfNotExists(kernelType, sessionId, resources);
    }
    destroyKernel(sessionId, ownerKey = null) {
        return this.destroy(sessionId, ownerKey);
    }
    refreshKernel(sessionId, ownerKey = null) {
        return this.restart(sessionId, ownerKey);
    }
    runCode(code, sessionId, runId, mode) {
        return this.execute(sessionId, runId, mode, code, {});
    }
    upload(sessionId, path, fs) {
        const formData = new FormData();
        //formData.append('src', fs, {filepath: path});
        formData.append('src', fs, path);
        let rqst = this.newSignedRequest('POST', `${this.kernelPrefix}/${sessionId}/upload`, formData);
        return this._wrapWithPromise(rqst);
    }
    download(sessionId, files) {
        let params = {
            'files': files
        };
        const q = querystring.stringify(params);
        let rqst = this.newSignedRequest('GET', `${this.kernelPrefix}/${sessionId}/download?${q}`, null);
        return this._wrapWithPromise(rqst, true);
    }
    download_single(sessionId, file) {
        let params = {
            'file': file
        };
        const q = querystring.stringify(params);
        let rqst = this.newSignedRequest('GET', `${this.kernelPrefix}/${sessionId}/download_single?${q}`, null);
        return this._wrapWithPromise(rqst, true);
    }
    mangleUserAgentSignature() {
        let uaSig = this.clientVersion
            + (this.agentSignature ? ('; ' + this.agentSignature) : '');
        return uaSig;
    }
    /* GraphQL requests */
    gql(q, v, signal = null, timeout = 0) {
        let query = {
            'query': q,
            'variables': v
        };
        let rqst = this.newSignedRequest('POST', `/admin/graphql`, query);
        return this._wrapWithPromise(rqst, false, signal, timeout);
    }
    /**
     * Generate a RequestInfo object that can be passed to fetch() API,
     * which includes a properly signed header with the configured auth information.
     *
     * @param {string} method - the HTTP method
     * @param {string} queryString - the URI path and GET parameters
     * @param {string} body - an object that will be encoded as JSON in the request body
     */
    newSignedRequest(method, queryString, body) {
        let content_type = "application/json";
        let requestBody;
        let authBody;
        let d = new Date();
        if (body === null || body === undefined) {
            requestBody = '';
            authBody = requestBody;
        }
        else if (typeof body.getBoundary === 'function' || body instanceof FormData) {
            // detect form data input from form-data module
            requestBody = body;
            authBody = '';
            content_type = "multipart/form-data";
        }
        else {
            requestBody = JSON.stringify(body);
            authBody = requestBody;
        }
        //queryString = '/' + this._config.apiVersionMajor + queryString;
        let aStr;
        let hdrs;
        let uri;
        uri = '';
        if (this._config.connectionMode === 'SESSION') { // Force request to use Public when session mode is enabled
            hdrs = new Headers({
                "User-Agent": `Backend.AI Client for Javascript ${this.mangleUserAgentSignature()}`,
                "X-BackendAI-Version": this._config.apiVersion,
                "X-BackendAI-Date": d.toISOString(),
            });
            //console.log(queryString.startsWith('/server') ===true);
            if (queryString.startsWith('/server') === true) { // Force request to use Public when session mode is enabled
                uri = this._config.endpoint + queryString;
            }
            else { // Force request to use Public when session mode is enabled
                uri = this._config.endpoint + '/func' + queryString;
            }
        }
        else {
            if (this._config._apiVersion[1] < 4) {
                aStr = this.getAuthenticationString(method, queryString, d.toISOString(), authBody, content_type);
            }
            else {
                aStr = this.getAuthenticationString(method, queryString, d.toISOString(), '', content_type);
            }
            let signKey = this.getSignKey(this._config.secretKey, d);
            let rqstSig = this.sign(signKey, 'binary', aStr, 'hex');
            hdrs = new Headers({
                "User-Agent": `Backend.AI Client for Javascript ${this.mangleUserAgentSignature()}`,
                "X-BackendAI-Version": this._config.apiVersion,
                "X-BackendAI-Date": d.toISOString(),
                "Authorization": `BackendAI signMethod=HMAC-SHA256, credential=${this._config.accessKey}:${rqstSig}`,
            });
            uri = this._config.endpoint + queryString;
        }
        if (body != undefined) {
            if (typeof body.getBoundary === 'function') {
                hdrs.set('Content-Type', body.getHeaders()['content-type']);
            }
            if (body instanceof FormData) {
            }
            else {
                hdrs.set('Content-Type', content_type);
                hdrs.set('Content-Length', Buffer.byteLength(authBody));
            }
        }
        else {
            hdrs.set('Content-Type', content_type);
        }
        let requestInfo = {
            method: method,
            headers: hdrs,
            cache: 'default',
            body: requestBody,
            uri: uri
        };
        return requestInfo;
    }
    /**
     * Same to newRequest() method but it does not sign the request.
     * Use this for unauthorized public APIs.
     */
    newUnsignedRequest(method, queryString, body) {
        return this.newPublicRequest(method, queryString, body, this._config.apiVersionMajor);
    }
    newPublicRequest(method, queryString, body, urlPrefix) {
        let d = new Date();
        let hdrs = new Headers({
            "Content-Type": "application/json",
            "User-Agent": `Backend.AI Client for Javascript ${this.mangleUserAgentSignature()}`,
            "X-BackendAI-Version": this._config.apiVersion,
            "X-BackendAI-Date": d.toISOString(),
            "credentials": 'include',
            "mode": 'cors'
        });
        //queryString = '/' + urlPrefix + queryString;
        let requestInfo = {
            method: method,
            headers: hdrs,
            mode: 'cors',
            cache: 'default',
            uri: ''
        };
        if (this._config.connectionMode === 'SESSION' && queryString.startsWith('/server') === true) { // Force request to use Public when session mode is enabled
            requestInfo.uri = this._config.endpoint + queryString;
        }
        else if (this._config.connectionMode === 'SESSION' && queryString.startsWith('/server') === false) { // Force request to use Public when session mode is enabled
            requestInfo.uri = this._config.endpoint + '/func' + queryString;
        }
        else {
            requestInfo.uri = this._config.endpoint + queryString;
        }
        return requestInfo;
    }
    getAuthenticationString(method, queryString, dateValue, bodyValue, content_type = "application/json") {
        let bodyHash = crypto_node.createHash(this._config.hashType)
            .update(bodyValue).digest('hex');
        return (method + '\n' + queryString + '\n' + dateValue + '\n'
            + 'host:' + this._config.endpointHost + '\n'
            + 'content-type:' + content_type + '\n'
            + 'x-backendai-version:' + this._config.apiVersion + '\n'
            + bodyHash);
    }
    getCurrentDate(now) {
        let year = (`0000${now.getUTCFullYear()}`).slice(-4);
        let month = (`0${now.getUTCMonth() + 1}`).slice(-2);
        let day = (`0${now.getUTCDate()}`).slice(-2);
        let t = year + month + day;
        return t;
    }
    sign(key, key_encoding, msg, digest_type) {
        let kbuf = new Buffer(key, key_encoding);
        let hmac = crypto_node.createHmac(this._config.hashType, kbuf);
        hmac.update(msg, 'utf8');
        return hmac.digest(digest_type);
    }
    getSignKey(secret_key, now) {
        let k1 = this.sign(secret_key, 'utf8', this.getCurrentDate(now), 'binary');
        let k2 = this.sign(k1, 'binary', this._config.endpointHost, 'binary');
        return k2;
    }
    generateSessionId() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 8; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text + "-jsSDK";
    }
}
class ResourcePreset {
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
    list(param = null) {
        let rqst = this.client.newSignedRequest('GET', `${this.urlPrefix}/presets`, param);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Return the GraphQL Promise object containing resource preset checking result.
     */
    check(param = null) {
        let rqst = this.client.newSignedRequest('POST', `${this.urlPrefix}/check-presets`, param);
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
    add(name = null, input) {
        if (this.client.is_admin === true && name !== null) {
            let q = `mutation($name: String!, $input: CreateResourcePresetInput!) {` +
                `  create_resource_preset(name: $name, props: $input) {` +
                `    ok msg ` +
                `  }` +
                `}`;
            let v = {
                'name': name,
                'input': input
            };
            return this.client.gql(q, v);
        }
        else {
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
    mutate(name = null, input) {
        if (this.client.is_admin === true && name !== null) {
            let q = `mutation($name: String!, $input: ModifyResourcePresetInput!) {` +
                `  modify_resource_preset(name: $name, props: $input) {` +
                `    ok msg ` +
                `  }` +
                `}`;
            let v = {
                'name': name,
                'input': input
            };
            return this.client.gql(q, v);
        }
        else {
            return Promise.resolve(false);
        }
    }
    /**
     * delete specified resource preset with given name.
     *
     * @param {string} name - resource preset name to delete.
     */
    delete(name = null) {
        if (this.client.is_admin === true && name !== null) {
            let q = `mutation($name: String!) {` +
                `  delete_resource_preset(name: $name) {` +
                `    ok msg ` +
                `  }` +
                `}`;
            let v = {
                'name': name
            };
            return this.client.gql(q, v);
        }
        else {
            return Promise.resolve(false);
        }
    }
}
class VFolder {
    /**
     * The Virtual Folder API wrapper.
     *
     * @param {Client} client - the Client API wrapper object to bind
     * @param {string} name - Virtual folder name.
     */
    constructor(client, name = null) {
        this.client = client;
        this.name = name;
        this.urlPrefix = '/folders';
    }
    /**
     * Get allowed types of folders
     *
     */
    allowed_types() {
        let rqst = this.client.newSignedRequest('GET', `${this.urlPrefix}/_/allowed_types`, null);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Create a Virtual folder on specific host.
     *
     * @param {string} name - Virtual folder name.
     * @param {string} host - Host name to create virtual folder in it.
     * @param {string} group - Virtual folder group name.
     * @param {string} usageMode - Virtual folder's purpose of use. Can be "general" (normal folders), "data" (data storage), and "model" (pre-trained model storage).
     * @param {string} permission - Virtual folder's innate permission.
     */
    create(name, host = '', group = '', usageMode = 'general', permission = 'rw') {
        let body;
        if (host !== '') {
            body = {
                'name': name,
                'host': host
            };
        }
        if (this.client.supports('group-folder') && group !== '') {
            body = {
                'name': name,
                'host': host,
                'group': group
            };
        }
        if (this.client.isAPIVersionCompatibleWith('v4.20191215')) {
            if (usageMode) {
                body['usage_mode'] = usageMode;
            }
            if (permission) {
                body['permission'] = permission;
            }
        }
        let rqst = this.client.newSignedRequest('POST', `${this.urlPrefix}`, body);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * List Virtual folders that requested accessKey has permission to.
     */
    list(groupId = null) {
        let reqUrl = this.urlPrefix;
        if (groupId) {
            const params = { group_id: groupId };
            const q = querystring.stringify(params);
            reqUrl += `?${q}`;
        }
        let rqst = this.client.newSignedRequest('GET', reqUrl, null);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * List Virtual folder hosts that requested accessKey has permission to.
     */
    list_hosts() {
        let rqst = this.client.newSignedRequest('GET', `${this.urlPrefix}/_/hosts`, null);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Information about specific virtual folder.
     */
    info(name = null) {
        if (name == null) {
            name = this.name;
        }
        let rqst = this.client.newSignedRequest('GET', `${this.urlPrefix}/${name}`, null);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Rename a Virtual folder.
     *
     * @param {string} new_name - New virtual folder name.
     */
    rename(new_name = null) {
        const body = { new_name };
        let rqst = this.client.newSignedRequest('POST', `${this.urlPrefix}/${this.name}/rename`, body);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Delete a Virtual folder.
     *
     * @param {string} name - Virtual folder name. If no name is given, use name on this VFolder object.
     */
    delete(name = null) {
        if (name == null) {
            name = this.name;
        }
        let rqst = this.client.newSignedRequest('DELETE', `${this.urlPrefix}/${name}`, null);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Upload files to specific Virtual folder.
     *
     * @param {string} path - Path to upload.
     * @param {string} fs - File content to upload.
     * @param {string} name - Virtual folder name.
     */
    upload(path, fs, name = null) {
        if (name == null) {
            name = this.name;
        }
        let formData = new FormData();
        formData.append('src', fs, path);
        let rqst = this.client.newSignedRequest('POST', `${this.urlPrefix}/${name}/upload`, formData);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Upload file from formData to specific Virtual folder.
     *
     * @param {string} fss - formData with file specification. formData should contain {src, content, {filePath:filePath}}.
     * @param {string} name - Virtual folder name.
     */
    uploadFormData(fss, name = null) {
        let rqst = this.client.newSignedRequest('POST', `${this.urlPrefix}/${name}/upload`, fss);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Create a upload session for a file to Virtual folder.
     *
     * @param {string} path - Path to upload.
     * @param {string} fs - File object to upload.
     * @param {string} name - Virtual folder name.
     */
    async create_upload_session(path, fs, name = null) {
        if (name == null) {
            name = this.name;
        }
        let body = {
            'path': path,
            'size': fs.size
        };
        let rqst = this.client.newSignedRequest('POST', `${this.urlPrefix}/${name}/create_upload_session`, body);
        const res = await this.client._wrapWithPromise(rqst);
        const token = res['token'];
        let url = this.client._config.endpoint;
        if (this.client._config.connectionMode === 'SESSION') {
            url = url + '/func';
        }
        url = url + `${this.urlPrefix}/_/tus/upload/${token}`;
        return url;
    }
    /**
     * Create directory in specific Virtual folder.
     *
     * @param {string} path - Directory path to create.
     * @param {string} name - Virtual folder name.
     */
    mkdir(path, name = null) {
        if (name == null) {
            name = this.name;
        }
        let body = {
            'path': path
        };
        let rqst = this.client.newSignedRequest('POST', `${this.urlPrefix}/${name}/mkdir`, body);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Rename a file inside a virtual folder.
     *
     * @param {string} target_path - path to the target file or directory (with old name).
     * @param {string} new_name - new name of the target.
     * @param {string} name - Virtual folder name that target file exists.
     */
    rename_file(target_path, new_name, name = null) {
        if (name == null) {
            name = this.name;
        }
        const body = { target_path, new_name };
        let rqst = this.client.newSignedRequest('POST', `${this.urlPrefix}/${name}/rename_file`, body);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Delete multiple files in a Virtual folder.
     *
     * @param {string} files - Files to delete.
     * @param {boolean} recursive - delete files recursively.
     * @param {string} name - Virtual folder name that files are in.
     */
    delete_files(files, recursive = false, name = null) {
        if (name == null) {
            name = this.name;
        }
        if (recursive == null) {
            recursive = false;
        }
        let body = {
            'files': files,
            'recursive': recursive,
        };
        let rqst = this.client.newSignedRequest('DELETE', `${this.urlPrefix}/${name}/delete_files`, body);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Download file in a Virtual folder.
     *
     * @param {string} file - File to download. Should contain full path.
     * @param {string} name - Virtual folder name that files are in.
     */
    download(file, name = false) {
        let params = {
            'file': file
        };
        let q = querystring.stringify(params);
        let rqst = this.client.newSignedRequest('GET', `${this.urlPrefix}/${name}/download_single?${q}`, null);
        return this.client._wrapWithPromise(rqst, true);
    }
    /**
     * Request a download and get the token for direct download.
     *
     * @param {string} file - File to download. Should contain full path.
     * @param {string} name - Virtual folder name that files are in.
     */
    request_download_token(file, name = false) {
        let body = {
            'file': file
        };
        let rqst = this.client.newSignedRequest('POST', `${this.urlPrefix}/${name}/request_download`, body);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Download file in a Virtual folder with token.
     *
     * @param {string} token - Temporary token to download specific file.
     */
    download_with_token(token = '') {
        let params = {
            'token': token
        };
        let q = querystring.stringify(params);
        let rqst = this.client.newSignedRequest('GET', `${this.urlPrefix}/_/download_with_token?${q}`, null);
        return this.client._wrapWithPromise(rqst, true);
    }
    /**
     * Get download URL in a Virtual folder with token.
     *
     * @param {string} token - Temporary token to download specific file.
     */
    get_download_url_with_token(token = '') {
        let params = {
            'token': token
        };
        let q = querystring.stringify(params);
        if (this.client._config.connectionMode === 'SESSION') {
            return `${this.client._config.endpoint}/func${this.urlPrefix}/_/download_with_token?${q}`;
        }
        else {
            return `${this.client._config.endpoint}${this.urlPrefix}/_/download_with_token?${q}`;
        }
    }
    /**
     * List files in specific virtual folder / path.
     *
     * @param {string} path - Directory path to list.
     * @param {string} name - Virtual folder name to look up with.
     */
    list_files(path, name = null) {
        if (name == null) {
            name = this.name;
        }
        let params = {
            'path': path
        };
        let q = querystring.stringify(params);
        let rqst = this.client.newSignedRequest('GET', `${this.urlPrefix}/${name}/files?${q}`, null);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Invite someone to specific virtual folder with permission.
     *
     * @param {string} perm - Permission to give to. `rw` or `ro`.
     * @param {array} emails - User E-mail to invite.
     * @param {string} name - Virtual folder name to invite.
     */
    invite(perm, emails, name = null) {
        if (name == null) {
            name = this.name;
        }
        let body = {
            'perm': perm,
            'user_ids': emails
        };
        let rqst = this.client.newSignedRequest('POST', `${this.urlPrefix}/${name}/invite`, body);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Show invitations to current API key.
     */
    invitations() {
        let rqst = this.client.newSignedRequest('GET', `${this.urlPrefix}/invitations/list`, null);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Accept specific invitation.
     *
     * @param {string} inv_id - Invitation ID.
     */
    accept_invitation(inv_id) {
        let body = {
            'inv_id': inv_id
        };
        let rqst = this.client.newSignedRequest('POST', `${this.urlPrefix}/invitations/accept`, body);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Delete specific invitation.
     *
     * @param {string} inv_id - Invitation ID to delete.
     */
    delete_invitation(inv_id) {
        let body = {
            'inv_id': inv_id
        };
        let rqst = this.client.newSignedRequest('DELETE', `${this.urlPrefix}/invitations/delete`, body);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * List invitees(users who accepted an invitation)
     *
     * @param {string} vfolder_id - vfolder id. If no id is given, all users who accepted the client's invitation will be returned
     */
    list_invitees(vfolder_id = null) {
        let queryString = '/folders/_/shared';
        if (vfolder_id !== null)
            queryString = `${queryString}?vfolder_id=${vfolder_id}`;
        let rqst = this.client.newSignedRequest('GET', queryString, null);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Modify an invitee's permission to a shared vfolder
     *
     * @param {json} input - parameters for permission modification
     * @param {string} input.perm - invitee's new permission. permission should one of the following: 'ro', 'rw', 'wd'
     * @param {string} input.user - invitee's uuid
     * @param {string} input.vfolder - id of the vfolder that has been shared to the invitee
     */
    modify_invitee_permission(input) {
        let rqst = this.client.newSignedRequest('POST', '/folders/_/shared', input);
        return this.client._wrapWithPromise(rqst);
    }
}
class Agent {
    /**
     * Agent API wrapper.
     *
     * @param {Client} client - the Client API wrapper object to bind
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * List computation agents.
     *
     * @param {string} status - Status to query. Should be one of 'ALIVE', 'PREPARING', 'TERMINATING' and 'TERMINATED'.
     * @param {array} fields - Fields to query. Queryable fields are:  'id', 'status', 'region', 'first_contact', 'cpu_cur_pct', 'mem_cur_bytes', 'available_slots', 'occupied_slots'.
     */
    list(status = 'ALIVE', fields = ['id', 'status', 'region', 'first_contact', 'cpu_cur_pct', 'mem_cur_bytes', 'available_slots', 'occupied_slots']) {
        if (['ALIVE', 'TERMINATED'].includes(status) === false) {
            return Promise.resolve(false);
        }
        let q = `query($status: String) {` +
            `  agents(status: $status) {` +
            `     ${fields.join(" ")}` +
            `  }` +
            `}`;
        let v = { 'status': status };
        return this.client.gql(q, v);
    }
}
class Keypair {
    /**
     * Keypair API wrapper.
     *
     * @param {Client} client - the Client API wrapper object to bind
     */
    constructor(client, name = null) {
        this.client = client;
        this.name = name;
    }
    /**
     * Information of specific Keypair.
     *
     * @param {string} accessKey - Access key to query information. If client is not authorized as admin, this will be ignored and current API key infomation will be returned.
     * @param {array} fields - Fields to query. Queryable fields are: 'access_key', 'secret_key', 'is_active', 'is_admin', 'user_id', 'created_at', 'last_used',
     'concurrency_limit', 'concurrency_used', 'rate_limit', 'num_queries', 'resource_policy'.
     */
    info(accessKey, fields = ['access_key', 'secret_key', 'is_active', 'is_admin', 'user_id', 'created_at', 'last_used',
        'concurrency_limit', 'concurrency_used', 'rate_limit', 'num_queries', 'resource_policy']) {
        let q, v;
        if (this.client.is_admin) {
            q = `query($access_key: String!) {` +
                `  keypair(access_key: $access_key) {` +
                `    ${fields.join(" ")}` +
                `  }` +
                `}`;
            v = {
                'access_key': accessKey
            };
        }
        else {
            q = `query {` +
                `  keypair {` +
                `    ${fields.join(" ")}` +
                `  }` +
                `}`;
            v = {};
        }
        return this.client.gql(q, v);
    }
    /**
     * List Keypairs of given user ID.
     *
     * @param {string} userId - User ID to query API keys. If user ID is not given and client is authorized as admin, this will return every keypairs of the manager.
     * @param {array} fields - Fields to query. Queryable fields are: "access_key", 'is_active', 'is_admin', 'user_id', 'created_at', 'last_used',
     'concurrency_used', 'rate_limit', 'num_queries', 'resource_policy'.
     */
    list(userId = null, fields = ['access_key', 'is_active', 'is_admin', 'user_id', 'created_at', 'last_used',
        'concurrency_used', 'rate_limit', 'num_queries', 'resource_policy'], isActive = true) {
        let q;
        if (this.client.is_admin) {
            if (userId == null) {
                q = `query($is_active: Boolean) {` +
                    `  keypairs(is_active: $is_active) {` +
                    `    ${fields.join(" ")}` +
                    `  }` +
                    `}`;
            }
            else {
                q = `query($email: String!, $is_active: Boolean) {` +
                    `  keypairs(email: $email, is_active: $is_active) {` +
                    `    ${fields.join(" ")}` +
                    `  }` +
                    `}`;
            }
        }
        else {
            q = `query($email: String!, $is_active: Boolean) {` +
                `  keypairs(email: $email, is_active: $is_active) {` +
                `    ${fields.join(" ")}` +
                `  }` +
                `}`;
        }
        let v = {
            'email': userId || this.client.email,
            'is_active': isActive,
        };
        return this.client.gql(q, v);
    }
    /**
     * Add Keypair with given information.
     *
     * @param {string} userId - User ID for new Keypair.
     * @param {boolean} isActive - is_active state. Default is True.
     * @param {boolean} isAdmin - is_admin state. Default is False.
     * @param {string} resourcePolicy - resource policy name to assign. Default is `default`.
     * @param {integer} rateLimit - API rate limit for 900 seconds. Prevents from DDoS attack.
     * @param {string} accessKey - Manual access key (optional)
     * @param {string} secretKey - Manual secret key. Only works if accessKey is present (optional)
  
     */
    add(userId = null, isActive = true, isAdmin = false, resourcePolicy = 'default', rateLimit = 1000, accessKey = null, secretKey = null) {
        let fields = [
            'is_active',
            'is_admin',
            'resource_policy',
            'concurrency_limit',
            'rate_limit'
        ];
        if (accessKey !== null && accessKey !== '') {
            fields = fields.concat(['access_key', 'secret_key']);
        }
        let q = `mutation($user_id: String!, $input: KeyPairInput!) {` +
            `  create_keypair(user_id: $user_id, props: $input) {` +
            `    ok msg keypair { ${fields.join(" ")} }` +
            `  }` +
            `}`;
        let v;
        if (accessKey !== null && accessKey !== '') {
            v = {
                'user_id': userId,
                'input': {
                    'is_active': isActive,
                    'is_admin': isAdmin,
                    'resource_policy': resourcePolicy,
                    'rate_limit': rateLimit,
                    'access_key': accessKey,
                    'secret_key': secretKey
                },
            };
        }
        else {
            v = {
                'user_id': userId,
                'input': {
                    'is_active': isActive,
                    'is_admin': isAdmin,
                    'resource_policy': resourcePolicy,
                    'rate_limit': rateLimit
                },
            };
        }
        return this.client.gql(q, v);
    }
    /**
     * mutate Keypair for given accessKey.
     *
     * @param {string} accessKey - access key to mutate.
     * @param {json} input - new information for mutation. JSON format should follow:
     * {
     *   'is_active': is_active,
     *   'is_admin': is_admin,
     *   'resource_policy': resource_policy,
     *   'rate_limit': rate_limit
     * }
     */
    mutate(accessKey, input) {
        let q = `mutation($access_key: String!, $input: ModifyKeyPairInput!) {` +
            `  modify_keypair(access_key: $access_key, props: $input) {` +
            `    ok msg` +
            `  }` +
            `}`;
        let v = {
            'access_key': accessKey,
            'input': input,
        };
        return this.client.gql(q, v);
    }
    /**
     * Delete Keypair with given accessKey
     *
     * @param {string} accessKey - access key to delete.
     */
    delete(accessKey) {
        let q = `mutation($access_key: String!) {` +
            `  delete_keypair(access_key: $access_key) {` +
            `    ok msg` +
            `  }` +
            `}`;
        let v = {
            'access_key': accessKey,
        };
        return this.client.gql(q, v);
    }
}
class ResourcePolicy {
    /**
     * The Resource Policy  API wrapper.
     *
     * @param {Client} client - the Client API wrapper object to bind
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * get resource policy with given name and fields.
     *
     * @param {string} name - resource policy name.
     * @param {array} fields - fields to query.
     */
    get(name = null, fields = ['name',
        'created_at',
        'default_for_unspecified',
        'total_resource_slots',
        'max_concurrent_sessions',
        'max_containers_per_session',
        'max_vfolder_count',
        'max_vfolder_size',
        'allowed_vfolder_hosts',
        'idle_timeout']) {
        let q, v;
        if (name === null) {
            q = `query {` +
                `  keypair_resource_policies { ${fields.join(" ")} }` +
                '}';
            v = { 'n': name };
        }
        else {
            q = `query($n:String!) {` +
                `  keypair_resource_policy(name: $n) { ${fields.join(" ")} }` +
                '}';
            v = { 'n': name };
        }
        return this.client.gql(q, v);
    }
    /**
     * add resource policy with given name and fields.
     *
     * @param {string} name - resource policy name.
     * @param {json} input - resource policy specification and data. Required fields are:
     * {
     *   'default_for_unspecified': 'UNLIMITED', // default resource policy when resource slot is not given. 'UNLIMITED' or 'LIMITED'.
     *   'total_resource_slots': JSON.stringify(total_resource_slots), // Resource slot value. should be Stringified JSON.
     *   'max_concurrent_sessions': concurrency_limit,
     *   'max_containers_per_session': containers_per_session_limit,
     *   'idle_timeout': idle_timeout,
     *   'max_vfolder_count': vfolder_count_limit,
     *   'max_vfolder_size': vfolder_capacity_limit,
     *   'allowed_vfolder_hosts': vfolder_hosts
     * };
     */
    add(name = null, input) {
        let fields = ['name',
            'created_at',
            'default_for_unspecified',
            'total_resource_slots',
            'max_concurrent_sessions',
            'max_containers_per_session',
            'max_vfolder_count',
            'max_vfolder_size',
            'allowed_vfolder_hosts',
            'idle_timeout'];
        if (this.client.is_admin === true && name !== null) {
            let q = `mutation($name: String!, $input: CreateKeyPairResourcePolicyInput!) {` +
                `  create_keypair_resource_policy(name: $name, props: $input) {` +
                `    ok msg resource_policy { ${fields.join(" ")} }` +
                `  }` +
                `}`;
            let v = {
                'name': name,
                'input': input
            };
            return this.client.gql(q, v);
        }
        else {
            return Promise.resolve(false);
        }
    }
    /**
     * mutate specified resource policy with given name with new values.
     *
     * @param {string} name - resource policy name to mutate.
     * @param {json} input - resource policy specification and data. Required fields are:
     * {
     *   {string} 'default_for_unspecified': 'UNLIMITED', // default resource policy when resource slot is not given. 'UNLIMITED' or 'LIMITED'.
     *   {JSONString} 'total_resource_slots': JSON.stringify(total_resource_slots), // Resource slot value. should be Stringified JSON.
     *   {int} 'max_concurrent_sessions': concurrency_limit,
     *   {int} 'max_containers_per_session': containers_per_session_limit,
     *   {bigint} 'idle_timeout': idle_timeout,
     *   {int} 'max_vfolder_count': vfolder_count_limit,
     *   {bigint} 'max_vfolder_size': vfolder_capacity_limit,
     *   {[string]} 'allowed_vfolder_hosts': vfolder_hosts
     * };
     */
    mutate(name = null, input) {
        if (this.client.is_admin === true && name !== null) {
            let q = `mutation($name: String!, $input: ModifyKeyPairResourcePolicyInput!) {` +
                `  modify_keypair_resource_policy(name: $name, props: $input) {` +
                `    ok msg ` +
                `  }` +
                `}`;
            let v = {
                'name': name,
                'input': input
            };
            return this.client.gql(q, v);
        }
        else {
            return Promise.resolve(false);
        }
    }
}
class ContainerImage {
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
     * @param {boolean} system_images - filter images to get system images such as console, SFTP server. true to query system images only.
     */
    list(fields = ["name", "tag", "registry", "digest", "installed", "labels { key value }", "resource_limits { key min max }"], installed_only = false, system_images = false) {
        let q, v;
        if (this.client.supports('system-images')) {
            if (installed_only === true) {
                q = `query($installed:Boolean) {` +
                    `  images(is_installed:$installed) { ${fields.join(" ")} }` +
                    '}';
                v = { 'installed': installed_only, 'is_operation': system_images };
            }
            else {
                q = `query {` +
                    `  images { ${fields.join(" ")} }` +
                    '}';
                v = { 'is_operation': system_images };
            }
        }
        else {
            q = `query {` +
                `  images { ${fields.join(" ")} }` +
                '}';
            v = {};
        }
        return this.client.gql(q, v);
    }
    /**
     * Modify resource of given image.
     *
     * @param {string} registry - Registry name
     * @param {string} image - image name.
     * @param {string} tag - image tag.
     * @param {object} input - value list to set.
     */
    modifyResource(registry, image, tag, input) {
        let promiseArray = [];
        image = image.replace("/", "%2F");
        Object.keys(input).forEach(slot_type => {
            Object.keys(input[slot_type]).forEach(key => {
                const rqst = this.client.newSignedRequest("POST", "/config/set", {
                    "key": `images/${registry}/${image}/${tag}/resource/${slot_type}/${key}`,
                    "value": input[slot_type][key]
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
    modifyLabel(registry, image, tag, key, value) {
        image = image.replace("/", "%2F");
        tag = tag.replace("/", "%2F");
        const rqst = this.client.newSignedRequest("POST", "/config/set", {
            "key": `images/${registry}/${image}/${tag}/labels/${key}`,
            "value": value
        });
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * install specific container images from registry
     *
     * @param {string} name - name to install. it should contain full path with tags. e.g. lablup/python:3.6-ubuntu18.04
     * @param {object} resource - resource to use for installation.
     * @param {string} registry - registry of image. default is 'index.docker.io', which is public Backend.AI docker registry.
     */
    install(name, resource = {}, registry = 'index.docker.io') {
        if (registry != 'index.docker.io') {
            registry = registry + '/';
        }
        else {
            registry = '';
        }
        let sessionId = this.client.generateSessionId();
        if (Object.keys(resource).length === 0) {
            resource = { 'cpu': '1', 'mem': '512m' };
        }
        return this.client.createIfNotExists(registry + name, sessionId, resource).then((response) => {
            return this.client.destroyKernel(sessionId);
        }).catch(err => {
            throw err;
        });
    }
    /**
     * uninstall specific container images from registry (TO BE IMPLEMENTED)
     *
     * @param {string} name - name to install. it should contain full path with tags. e.g. lablup/python:3.6-ubuntu18.04
     * @param {string} registry - registry of image. default is 'index.docker.io', which is public Backend.AI docker registry.
     */
    uninstall(name, registry = 'index.docker.io') {
        return false;
    }
    /**
     * Get image label information.
     *
     * @param {string} registry - Registry name
     * @param {string} image - image name.
     * @param {string} tag - tag to get.
     */
    get(registry, image, tag) {
        const rqst = this.client.newSignedRequest("POST", "/config/get", {
            "key": `images/${registry}/${image}/${tag}/resource/`,
            "prefix": true
        });
        return this.client._wrapWithPromise(rqst);
    }
}
class ComputeSession {
    /**
     * The Computate session API wrapper.
     *
     * @param {Client} client - the Client API wrapper object to bind
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * list compute sessions with specific conditions.
     *
     * @param {array} fields - fields to query. Default fields are: ["session_name", "lang", "created_at", "terminated_at", "status", "status_info", "occupied_slots", "cpu_used", "io_read_bytes", "io_write_bytes"].
     * @param {string or array} status - status to query. Default is 'RUNNING'. Available statuses are: `PREPARING`, `BUILDING`, `RUNNING`, `RESTARTING`, `RESIZING`, `SUSPENDED`, `TERMINATING`, `TERMINATED`, `ERROR`.
     * @param {string} accessKey - access key that is used to start compute sessions.
     * @param {number} limit - limit number of query items.
     * @param {number} offset - offset for item query. Useful for pagination.
     * @param {string} group - project group id to query. Default returns sessions from all groups.
     */
    async list(fields = ["session_name", "lang", "created_at", "terminated_at", "status", "status_info", "occupied_slots", "cpu_used", "io_read_bytes", "io_write_bytes"], status = 'RUNNING', accessKey = '', limit = 30, offset = 0, group = '') {
        fields = this.client._updateFieldCompatibilityByAPIVersion(fields); // For V3/V4 API compatibility
        let q, v;
        q = `query($limit:Int!, $offset:Int!, $ak:String, $group_id:String, $status:String) {
      compute_session_list(limit:$limit, offset:$offset, access_key:$ak, group_id:$group_id, status:$status) {
        items { ${fields.join(" ")}}
        total_count
      }
    }`;
        v = {
            'limit': limit,
            'offset': offset,
            'status': status
        };
        if (accessKey != '') {
            v['ak'] = accessKey;
        }
        if (group != '') {
            v['group_id'] = group;
        }
        return this.client.gql(q, v);
    }
    /**
     * list all status of compute sessions.
     *
     * @param {array} fields - fields to query. Default fields are: ["session_name", "lang", "created_at", "terminated_at", "status", "status_info", "occupied_slots", "cpu_used", "io_read_bytes", "io_write_bytes"].
     * @param {string} accessKey - access key that is used to start compute sessions.
     * @param {number} limit - limit number of query items.
     * @param {number} offset - offset for item query. Useful for pagination.
     * @param {string} group - project group id to query. Default returns sessions from all groups.
     */
    async listAll(fields = ["session_name", "lang", "created_at", "terminated_at", "status", "status_info", "occupied_slots", "cpu_used", "io_read_bytes", "io_write_bytes"], accessKey = '', group = '') {
        fields = this.client._updateFieldCompatibilityByAPIVersion(fields);
        // For V3/V4 API compatibility
        let q, v;
        q = `query($domain_name:String, $group_id:String, $ak:String, $status:String) {
      compute_sessions(domain_name:$domain_name, group_id:$group_id, access_key:$ak, status:$status) {
        ${fields.join(" ")}
      }
    }`;
        v = {
        // domain_name: null,
        // group_id: null,
        // access_key: accessKey,
        // status: status
        };
        if (accessKey !== '') {
            v['access_key'] = accessKey;
        }
        if (group !== '') {
            v['group_id'] = group;
        }
        return this.client.gql(q, v);
    }
}
class Resources {
    constructor(client) {
        this.client = client;
        this.resources = {};
        this._init_resource_values();
    }
    _init_resource_values() {
        this.resources.cpu = {};
        this.resources.cpu.total = 0;
        this.resources.cpu.used = 0;
        this.resources.cpu.percent = 0;
        this.resources.mem = {};
        this.resources.mem.total = 0;
        this.resources.mem.allocated = 0;
        this.resources.mem.used = 0;
        this.resources.gpu = {};
        this.resources.gpu.total = 0;
        this.resources.gpu.used = 0;
        this.resources['cuda.device'] = {};
        this.resources['cuda.device'].total = 0;
        this.resources['cuda.device'].used = 0;
        this.resources.fgpu = {};
        this.resources.fgpu.total = 0;
        this.resources.fgpu.used = 0;
        this.resources['cuda.shares'] = {};
        this.resources['cuda.shares'].total = 0;
        this.resources['cuda.shares'].used = 0;
        this.resources['rocm.device'] = {};
        this.resources['rocm.device'].total = 0;
        this.resources['rocm.device'].used = 0;
        this.resources['tpu.device'] = {};
        this.resources['tpu.device'].total = 0;
        this.resources['tpu.device'].used = 0;
        this.resources.agents = {};
        this.resources.agents.total = 0;
        this.resources.agents.using = 0;
        this.agents = [];
    }
    totalResourceInformation(status = 'ALIVE') {
        if (this.client.is_admin) {
            let fields = ['id',
                'addr',
                'status',
                'first_contact',
                'cpu_cur_pct',
                'mem_cur_bytes',
                'occupied_slots',
                'available_slots'];
            return this.client.agent.list(status, fields).then((response) => {
                this._init_resource_values();
                this.agents = response.agents;
                Object.keys(this.agents).map((objectKey, index) => {
                    let value = this.agents[objectKey];
                    let occupied_slots = JSON.parse(value.occupied_slots);
                    let available_slots = JSON.parse(value.available_slots);
                    if ('cpu' in available_slots) {
                        this.resources.cpu.total = this.resources.cpu.total + Math.floor(Number(available_slots.cpu));
                    }
                    if ('cpu' in occupied_slots) {
                        this.resources.cpu.used = this.resources.cpu.used + Math.floor(Number(occupied_slots.cpu));
                    }
                    this.resources.cpu.percent = this.resources.cpu.percent + parseFloat(value.cpu_cur_pct);
                    if (occupied_slots.mem === undefined) {
                        occupied_slots.mem = 0;
                    }
                    this.resources.mem.total = parseFloat(this.resources.mem.total) + parseInt(this.client.utils.changeBinaryUnit(available_slots.mem, 'b'));
                    this.resources.mem.allocated = parseInt(this.resources.mem.allocated) + parseInt(this.client.utils.changeBinaryUnit(occupied_slots.mem, 'b'));
                    this.resources.mem.used = parseInt(this.resources.mem.used) + parseInt(this.client.utils.changeBinaryUnit(value.mem_cur_bytes, 'b'));
                    if ('cuda.device' in available_slots) {
                        this.resources['cuda.device'].total = parseInt(this.resources['cuda.device'].total) + Math.floor(Number(available_slots['cuda.device']));
                    }
                    if ('cuda.device' in occupied_slots) {
                        this.resources['cuda.device'].used = parseInt(this.resources['cuda.device'].used) + Math.floor(Number(occupied_slots['cuda.device']));
                    }
                    if ('cuda.shares' in available_slots) {
                        this.resources['cuda.shares'].total = parseFloat(this.resources['cuda.shares'].total) + parseFloat(available_slots['cuda.shares']);
                    }
                    if ('cuda.shares' in occupied_slots) {
                        this.resources['cuda.shares'].used = parseFloat(this.resources['cuda.shares'].used) + parseFloat(occupied_slots['cuda.shares']);
                    }
                    if ('rocm.device' in available_slots) {
                        this.resources['rocm.device'].total = parseInt(this.resources['rocm.device'].total) + Math.floor(Number(available_slots['rocm.device']));
                    }
                    if ('rocm.device' in occupied_slots) {
                        this.resources['rocm.device'].used = parseInt(this.resources['rocm.device'].used) + Math.floor(Number(occupied_slots['rocm.device']));
                    }
                    if ('tpu.device' in available_slots) {
                        this.resources['tpu.device'].total = parseInt(this.resources['tpu.device'].total) + Math.floor(Number(available_slots['tpu.device']));
                    }
                    if ('tpu.device' in occupied_slots) {
                        this.resources['tpu.device'].used = parseInt(this.resources['tpu.device'].used) + Math.floor(Number(occupied_slots['tpu.device']));
                    }
                    if (isNaN(this.resources.cpu.used)) {
                        this.resources.cpu.used = 0;
                    }
                    if (isNaN(this.resources.mem.used)) {
                        this.resources.mem.used = 0;
                    }
                    if (isNaN(this.resources.gpu.used)) {
                        this.resources.gpu.used = 0;
                    }
                    if (isNaN(this.resources.fgpu.used)) {
                        this.resources.fgpu.used = 0;
                    }
                });
                // Legacy code
                this.resources.gpu.total = this.resources['cuda.device'].total;
                this.resources.gpu.used = this.resources['cuda.device'].used;
                this.resources.fgpu.used = this.resources['cuda.shares'].used.toFixed(2);
                this.resources.fgpu.total = this.resources['cuda.shares'].total.toFixed(2);
                this.resources.agents.total = Object.keys(this.agents).length; // TODO : remove terminated agents
                this.resources.agents.using = Object.keys(this.agents).length;
                return this.resources;
            }).catch(err => {
                throw err;
            });
        }
        else {
            return Promise.resolve(false);
        }
    }
    user_stats() {
        const rqst = this.client.newSignedRequest("GET", "/resource/stats/user/month", null);
        return this.client._wrapWithPromise(rqst);
    }
}
class Group {
    /**
     * The group API wrapper.
     *
     * @param {Client} client - the Client API wrapper object to bind
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * List registred groups.
     * @param {boolean} is_active - List whether active users or inactive users.
     * @param {string} domain_name - domain name of group
     * {
     *   'name': String,          // Group name.
     *   'description': String,   // Description for group.
     *   'is_active': Boolean,    // Whether the group is active or not.
     *   'created_at': String,    // Created date of group.
     *   'modified_at': String,   // Modified date of group.
     *   'domain_name': String,   // Domain for group.
     * };
     */
    list(is_active = true, domain_name = false, fields = ['id', 'name', 'description', 'is_active', 'created_at', 'modified_at', 'domain_name']) {
        let q, v;
        if (this.client.is_admin === true) {
            q = `query($is_active:Boolean) {` +
                `  groups(is_active:$is_active) { ${fields.join(" ")} }` +
                '}';
            v = { 'is_active': is_active };
            if (domain_name !== false) {
                q = `query($domain_name: String, $is_active:Boolean) {` +
                    `  groups(domain_name: $domain_name, is_active:$is_active) { ${fields.join(" ")} }` +
                    '}';
                v = {
                    'is_active': is_active,
                    'domain_name': domain_name
                };
            }
        }
        else {
            q = `query($is_active:Boolean) {` +
                `  groups(is_active:$is_active) { ${fields.join(" ")} }` +
                '}';
            v = { 'is_active': is_active };
        }
        return this.client.gql(q, v);
    }
}
class Domain {
    /**
     * The domain API wrapper.
     *
     * @param {Client} client - the Client API wrapper object to bind
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * Get domain information.
     * @param {string} domain_name - domain name of group
     * @param {array} fields - fields to query.  Default fields are: ['name', 'description', 'is_active', 'created_at', 'modified_at', 'total_resource_slots', 'allowed_vfolder_hosts',
     'allowed_docker_registries', 'integration_id', 'scaling_groups']
     * {
     *   'name': String,          // Group name.
     *   'description': String,   // Description for group.
     *   'is_active': Boolean,    // Whether the group is active or not.
     *   'created_at': String,    // Created date of group.
     *   'modified_at': String,   // Modified date of group.
     *   'total_resource_slots': JSOONString,   // Total resource slots
     *   'allowed_vfolder_hosts': [String],   // Allowed virtual folder hosts
     *   'allowed_docker_registries': [String],   // Allowed docker registry lists
     *   'integration_id': [String],   // Integration ids
     *   'scaling_groups': [String],   // Scaling groups
     * };
     */
    get(domain_name = false, fields = ['name', 'description', 'is_active', 'created_at', 'modified_at', 'total_resource_slots', 'allowed_vfolder_hosts',
        'allowed_docker_registries', 'integration_id', 'scaling_groups']) {
        let q, v;
        if (domain_name !== false) {
            q = `query($name: String) {` +
                `  domain(name: $name) { ${fields.join(" ")} }` +
                '}';
            v = { 'name': domain_name };
            return this.client.gql(q, v);
        }
    }
    list(fields = ['name', 'description', 'is_active', 'created_at', 'total_resource_slots', 'allowed_vfolder_hosts', 'allowed_docker_registries', 'integration_id']) {
        let q = `query {` +
            ` domains { ${fields.join(" ")} }` +
            `}`;
        let v = {};
        return this.client.gql(q, v);
    }
    /**
     * Modify domain information.
     * @param {string} domain_name - domain name of group
  
  
     * @param {json} input - Domain specification to change. Required fields are:
     * {
     *   'name': String,          // Group name.
     *   'description': String,   // Description for group.
     *   'is_active': Boolean,    // Whether the group is active or not.
     *   'created_at': String,    // Created date of group.
     *   'modified_at': String,   // Modified date of group.
     *   'total_resource_slots': JSOONString,   // Total resource slots
     *   'allowed_vfolder_hosts': [String],   // Allowed virtual folder hosts
     *   'allowed_docker_registries': [String],   // Allowed docker registry lists
     *   'integration_id': [String],   // Integration ids
     *   'scaling_groups': [String],   // Scaling groups
     * };
     */
    modify(domain_name = false, input) {
        //let fields = ['name', 'description', 'is_active', 'created_at', 'modified_at', 'total_resource_slots', 'allowed_vfolder_hosts',
        //  'allowed_docker_registries', 'integration_id', 'scaling_groups'];
        if (this.client.is_superadmin === true) {
            let q = `mutation($name: String!, $input: ModifyDomainInput!) {` +
                `  modify_domain(name: $name, props: $input) {` +
                `    ok msg` +
                `  }` +
                `}`;
            let v = {
                'name': domain_name,
                'input': input
            };
            return this.client.gql(q, v);
        }
        else {
            return Promise.resolve(false);
        }
    }
}
class Maintenance {
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
     * Rescan image from repository
     * @param {string} registry - registry. default is ''
     */
    rescan_images(registry = '') {
        if (this.client.is_admin === true) {
            let q, v;
            if (registry !== '') {
                registry = decodeURIComponent(registry);
                q = `mutation($registry: String) {` +
                    `  rescan_images(registry: $registry) {` +
                    `    ok msg ` +
                    `  }` +
                    `}`;
                v = {
                    'registry': registry
                };
            }
            else {
                q = `mutation {` +
                    `  rescan_images {` +
                    `    ok msg ` +
                    `  }` +
                    `}`;
                v = {};
            }
            return this.client.gql(q, v, null, 600 * 1000);
        }
        else {
            return Promise.resolve(false);
        }
    }
    recalculate_usage() {
        if (this.client.is_superadmin === true) {
            let rqst = this.client.newSignedRequest('POST', `${this.urlPrefix}/recalculate-usage`, null);
            return this.client._wrapWithPromise(rqst, null, null, 60 * 1000);
        }
    }
}
class User {
    /**
     * The user API wrapper.
     *
     * @param {Client} client - the Client API wrapper object to bind
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * List registred users.
     *
     * @param {boolean} is_active - List whether active users or inactive users.
     * @param {json} input - User specification to query. Fields are:
     * {
     *   'username': String,      // User name for given user id.
     *   'password': String,      // Password for user id.
     *   'need_password_change': Boolean, // Let user change password at the next login.
     *   'full_name': String,     // Full name of given user id.
     *   'description': String,   // Description for user.
     *   'is_active': Boolean,    // Flag if user is active or not.
     *   'domain_name': String,   // Domain for user.
     *   'role': String,          // Role for user.
     *   'groups': {id name}  // Group Ids for user. Shoule be list of UUID strings.
     * };
     */
    list(is_active = true, fields = ['username', 'password', 'need_password_change', 'full_name', 'description', 'is_active', 'domain_name', 'role', 'groups {id name}']) {
        let q, v;
        if (this.client.is_admin === true) {
            q = `query($is_active:Boolean) {` +
                `  users(is_active:$is_active) { ${fields.join(" ")} }` +
                '}';
            v = { 'is_active': is_active };
        }
        else {
            q = `query {` +
                `  user { ${fields.join(" ")} }` +
                '}';
            v = {};
        }
        return this.client.gql(q, v);
    }
    /**
     * Get user information.
     *
     * @param {string} email - E-mail address as user id.
     * @param {json} input - User specification to query. Fields are:
     * {
     *   'email': String,         // E-mail for given E-mail (same as user)
     *   'username': String,      // User name for given user id.
     *   'password': String,      // Password for user id.
     *   'need_password_change': Boolean, // Let user change password at the next login.
     *   'full_name': String,     // Full name of given user id.
     *   'description': String,   // Description for user.
     *   'is_active': Boolean,    // Flag if user is active or not.
     *   'domain_name': String,   // Domain for user.
     *   'role': String,          // Role for user.
     *   'groups': List(UUID)  // Group Ids for user. Shoule be list of UUID strings.
     * };
     */
    get(email, fields = ['email', 'username', 'password', 'need_password_change', 'full_name', 'description', 'is_active', 'domain_name', 'role', 'groups {id name}']) {
        let q, v;
        if (this.client.is_admin === true) {
            q = `query($email:String) {` +
                `  user (email:$email) { ${fields.join(" ")} }` +
                '}';
            v = { 'email': email };
        }
        else {
            q = `query {` +
                `  user { ${fields.join(" ")} }` +
                '}';
            v = {};
        }
        return this.client.gql(q, v);
    }
    /**
     * add new user with given information.
     *
     * @param {string} email - E-mail address as user id.
     * @param {json} input - User specification to change. Required fields are:
     * {
     *   'username': String,      // User name for given user id.
     *   'password': String,      // Password for user id.
     *   'need_password_change': Boolean, // Let user change password at the next login.
     *   'full_name': String,     // Full name of given user id.
     *   'description': String,   // Description for user.
     *   'is_active': Boolean,    // Flag if user is active or not.
     *   'domain_name': String,   // Domain for user.
     *   'role': String,          // Role for user.
     *   'group_ids': List(UUID)  // Group Ids for user. Shoule be list of UUID strings.
     * };
     */
    add(email = null, input) {
        let fields = ['username', 'password', 'need_password_change', 'full_name', 'description', 'is_active', 'domain_name', 'role', 'groups{id, name}'];
        if (this.client.is_admin === true) {
            let q = `mutation($email: String!, $input: UserInput!) {` +
                `  create_user(email: $email, props: $input) {` +
                `    ok msg user { ${fields.join(" ")} }` +
                `  }` +
                `}`;
            let v = {
                'email': email,
                'input': input
            };
            return this.client.gql(q, v);
        }
        else {
            return Promise.resolve(false);
        }
    }
    /**
     * modify user information with given user id with new values.
     *
     * @param {string} email - E-mail address as user id.
     * @param {json} input - User specification to change. Required fields are:
     * {
     *   'username': String,      // User name for given user id.
     *   'password': String,      // Password for user id.
     *   'need_password_change': Boolean, // Let user change password at the next login.
     *   'full_name': String,     // Full name of given user id.
     *   'description': String,   // Description for user.
     *   'is_active': Boolean,    // Flag if user is active or not.
     *   'domain_name': String,   // Domain for user.
     *   'role': String,          // Role for user.
     *   'group_ids': List(UUID)  // Group Ids for user. Shoule be list of UUID strings.
     * };
     */
    modify(email = null, input) {
        if (this.client.is_superadmin === true) {
            let q = `mutation($email: String!, $input: ModifyUserInput!) {` +
                `  modify_user(email: $email, props: $input) {` +
                `    ok msg` +
                `  }` +
                `}`;
            let v = {
                'email': email,
                'input': input
            };
            return this.client.gql(q, v);
        }
        else {
            return Promise.resolve(false);
        }
    }
    /**
     * delete user information with given user id
     *
     * @param {string} email - E-mail address as user id to delete.
     */
    delete(email) {
        if (this.client.is_superadmin === true) {
            let q = `mutation($email: String!) {` +
                `  delete_user(email: $email) {` +
                `    ok msg` +
                `  }` +
                `}`;
            let v = {
                'email': email
            };
            return this.client.gql(q, v);
        }
        else {
            return Promise.resolve(false);
        }
    }
}
class ScalingGroup {
    /**
     * The Scaling Group API wrapper.
     *
     * @param {Client} client - the Client API wrapper object to bind
     */
    constructor(client) {
        this.client = client;
    }
    list_all() {
        if (this.client.is_superadmin === true) {
            const fields = ["name", "description", "is_active", "created_at", "driver", "driver_opts", "scheduler", "scheduler_opts"];
            const q = `query {` +
                `  scaling_groups { ${fields.join(" ")} }` +
                `}`;
            const v = {};
            return this.client.gql(q, v);
        }
        else {
            return Promise.resolve(false);
        }
    }
    list(group = 'default') {
        const queryString = `/scaling-groups?group=${group}`;
        const rqst = this.client.newSignedRequest("GET", queryString, null);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Create a scaling group
     *
     * @param {string} name - Scaling group name
     * @param {string} description - Scaling group description
     */
    create(name, description = "") {
        const input = {
            description,
            is_active: true,
            driver: "static",
            scheduler: "fifo",
            driver_opts: "{}",
            scheduler_opts: "{}"
        };
        // if (this.client.is_admin === true) {
        let q = `mutation($name: String!, $input: ScalingGroupInput!) {` +
            `  create_scaling_group(name: $name, props: $input) {` +
            `    ok msg` +
            `  }` +
            `}`;
        let v = {
            name,
            input
        };
        return this.client.gql(q, v);
        // } else {
        //   return Promise.resolve(false);
        // }
    }
    /**
     * Associate a scaling group with a domain
     *
     * @param {string} domain - domain name
     * @param {string} scaling_group - scaling group name
     */
    associateWithDomain(domain, scaling_group) {
        let q = `mutation($domain: String!, $scaling_group: String!) {` +
            `  associate_scaling_group_with_domain(domain: $domain, scaling_group: $scaling_group) {` +
            `    ok msg` +
            `  }` +
            `}`;
        let v = {
            domain,
            scaling_group
        };
        return this.client.gql(q, v);
    }
    /**
     * Modify a scaling group
     *
     * @param {string} name - scaling group name
     * @param {json} input - object containing desired modifications
     * {
     *   'description': String          // description of scaling group
     *   'is_active': Boolean           // active status of scaling group
     *   'driver': String
     *   'driver_opts': JSONString
     *   'scheduler': String
     *   'scheduler_opts': JSONString
     * }
     */
    modify(name, input) {
        let q = `mutation($name: String!, $input: ModifyScalingGroupInput!) {` +
            `  modify_scaling_group(name: $name, props: $input) {` +
            `    ok msg` +
            `  }` +
            `}`;
        let v = {
            name,
            input
        };
        return this.client.gql(q, v);
    }
    /**
     * Delete a scaling group
     *
     * @param {string} name - name of scaling group to be deleted
     */
    delete(name) {
        let q = `mutation($name: String!) {` +
            `  delete_scaling_group(name: $name) {` +
            `    ok msg` +
            `  }` +
            `}`;
        let v = {
            name
        };
        return this.client.gql(q, v);
    }
}
class Registry {
    constructor(client) {
        this.client = client;
    }
    list() {
        const rqst = this.client.newSignedRequest("POST", "/config/get", { "key": "config/docker/registry", "prefix": true });
        return this.client._wrapWithPromise(rqst);
    }
    add(key, value) {
        key = encodeURIComponent(key);
        let regkey = `config/docker/registry/${key}`;
        const rqst = this.client.newSignedRequest("POST", "/config/set", {
            key: regkey,
            value
        });
        return this.client._wrapWithPromise(rqst);
    }
    delete(key) {
        key = encodeURIComponent(key);
        const rqst = this.client.newSignedRequest("POST", "/config/delete", {
            "key": `config/docker/registry/${key}`,
            "prefix": true
        });
        return this.client._wrapWithPromise(rqst);
    }
}
class Setting {
    /**
     * Setting API wrapper.
     *
     * @param {Client} client - the Client API wrapper object to bind
     */
    constructor(client) {
        this.client = client;
        this.config = null;
    }
    /**
     * List settings
     *
     * @param {string} prefix - prefix to get. This command will return every settings starting with the prefix.
     */
    list(prefix = "") {
        prefix = `config/${prefix}`;
        const rqst = this.client.newSignedRequest("POST", "/config/get", { "key": prefix, "prefix": true });
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Get settings
     *
     * @param {string} prefix - prefix to get. This command will return every settings starting with the prefix.
     */
    get(key) {
        key = `config/${key}`;
        const rqst = this.client.newSignedRequest("POST", "/config/get", { "key": key, "prefix": false });
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Set a setting
     *
     * @param {string} key - key to add.
     * @param {string} value - value to add.
     */
    set(key, value) {
        key = `config/${key}`;
        const rqst = this.client.newSignedRequest("POST", "/config/set", { key, value });
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Delete a setting
     *
     * @param {string} key - key to delete
     * @param {boolean} prefix - prefix to delete. if prefix is true, this command will delete every settings starting with the key.
     */
    delete(key, prefix = false) {
        key = `config/${key}`;
        const rqst = this.client.newSignedRequest("POST", "/config/delete", {
            "key": `${key}`,
            "prefix": prefix
        });
        return this.client._wrapWithPromise(rqst);
    }
}
class UserConfig {
    /**
     * Setting API wrapper.
     *
     * @param {Client} client - the Client API wrapper object to bind
     */
    constructor(client) {
        this.client = client;
        this.config = null;
    }
    /**
     * Get content of bootstrap script of a keypair.
     */
    get_bootstrap_script() {
        if (!this.client._config.accessKey) {
            throw 'Your access key is not set';
        }
        const rqst = this.client.newSignedRequest('GET', '/user-config/bootstrap-script');
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Update bootstrap script of a keypair.
     *
     * @param {string} data - text content of bootstrap script.
     */
    update_bootstrap_script(script) {
        const rqst = this.client.newSignedRequest("POST", "/user-config/bootstrap-script", { script });
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Create content of script dotfile (.bashrc or .zshrc)
     * @param {string} data - text content of script dotfile
     * @param {string} path - path of script dotfile. (cwd: home directory)
     */
    create_dotfile_script(data = '', path) {
        if (!this.client._config.accessKey) {
            throw 'Your access key is not set';
        }
        let params = {
            "path": path,
            "data": data,
            "permission": '644'
        };
        const rqst = this.client.newSignedRequest("POST", "/user-config/dotfiles", params);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Get content of script dotfile
     */
    get_dotfile_script() {
        if (!this.client._config.accessKey) {
            throw 'Your access key is not set';
        }
        // let params = {
        //   "owner_access_key" : this.client._config.accessKey
        // }
        const rqst = this.client.newSignedRequest("GET", "/user-config/dotfiles");
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Update script dotfile of a keypair.
     *
     * @param {string} data - text content of script dotfile.
     * @param {string} path - path of script dotfile. (cwd: home directory)
     */
    update_dotfile_script(data, path) {
        let params = {
            "data": data,
            "path": path,
            "permission": '644'
        };
        const rqst = this.client.newSignedRequest("PATCH", "/user-config/dotfiles", params);
        return this.client._wrapWithPromise(rqst);
    }
    /**
     * Delete script dotfile of a keypair.
     *
     * @param {string} path - path of script dotfile.
     */
    delete_dotfile_script(path) {
        let params = {
            "path": path
        };
        const rqst = this.client.newSignedRequest("DELETE", "/user-config/dotfiles", params);
        return this.client._wrapWithPromise(rqst);
    }
}
class utils {
    constructor(client) {
        this.client = client;
    }
    changeBinaryUnit(value, targetUnit = 'g', defaultUnit = 'b') {
        if (value === undefined) {
            return value;
        }
        let sourceUnit;
        const binaryUnits = ['b', 'k', 'm', 'g', 't', 'p', 'auto'];
        const bBinaryUnits = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
        if (!(binaryUnits.includes(targetUnit)))
            return false;
        value = value.toString();
        if (value.indexOf(' ') >= 0) { // Has string
            let v = value.split(/(\s+)/);
            if (bBinaryUnits.includes(v[2])) {
                value = v[0] + binaryUnits[bBinaryUnits.indexOf(v[2])];
            }
            else {
                value = v[0];
            }
        }
        if (binaryUnits.includes(value.substr(-1))) {
            sourceUnit = value.substr(-1);
            value = value.slice(0, -1);
        }
        else {
            sourceUnit = defaultUnit; // Fallback
        }
        if (targetUnit == 'auto') {
        }
        return value * Math.pow(1024, Math.floor(binaryUnits.indexOf(sourceUnit) - binaryUnits.indexOf(targetUnit)));
    }
    elapsedTime(start, end) {
        var startDate = new Date(start);
        if (end === null) {
            var endDate = new Date();
        }
        else {
            var endDate = new Date(end);
        }
        var seconds_total = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
        var seconds_cumulative = seconds_total;
        var days = Math.floor(seconds_cumulative / 86400);
        seconds_cumulative = seconds_cumulative - days * 86400;
        var hours = Math.floor(seconds_cumulative / 3600);
        seconds_cumulative = seconds_cumulative - hours * 3600;
        var minutes = Math.floor(seconds_cumulative / 60);
        seconds_cumulative = seconds_cumulative - minutes * 60;
        var seconds = seconds_cumulative;
        var result = '';
        if (days !== undefined && days > 0) {
            result = result + String(days) + ' Day ';
        }
        if (hours !== undefined) {
            result = result + this._padding_zeros(hours, 2) + ':';
        }
        if (minutes !== undefined) {
            result = result + this._padding_zeros(minutes, 2) + ':';
        }
        return result + this._padding_zeros(seconds, 2) + '';
    }
    _padding_zeros(n, width) {
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
    }
    gqlToObject(array, key) {
        let result = {};
        array.forEach(function (element) {
            result[element[key]] = element;
        });
        return result;
    }
    gqlToList(array, key) {
        let result = [];
        array.forEach(function (element) {
            result.push(element[key]);
        });
        return result;
    }
}
// below will become "static const" properties in ES7
Object.defineProperty(Client, 'ERR_SERVER', {
    value: 0,
    writable: false,
    enumerable: true,
    configurable: false
});
Object.defineProperty(Client, 'ERR_RESPONSE', {
    value: 1,
    writable: false,
    enumerable: true,
    configurable: false
});
Object.defineProperty(Client, 'ERR_REQUEST', {
    value: 2,
    writable: false,
    enumerable: true,
    configurable: false
});
Object.defineProperty(Client, 'ERR_ABORT', {
    value: 3,
    writable: false,
    enumerable: true,
    configurable: false
});
Object.defineProperty(Client, 'ERR_TIMEOUT', {
    value: 4,
    writable: false,
    enumerable: true,
    configurable: false
});
Object.defineProperty(Client, 'ERR_UNKNOWN', {
    value: 99,
    writable: false,
    enumerable: true,
    configurable: false
});
const backend = {
    Client: Client,
    ClientConfig: ClientConfig,
};
// for use like "ai.backend.Client"
module.exports.backend = backend;
// for classical uses
module.exports.Client = Client;
module.exports.ClientConfig = ClientConfig;
// legacy aliases
module.exports.BackendAIClient = Client;
module.exports.BackendAIClientConfig = ClientConfig;
