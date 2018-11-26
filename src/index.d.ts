/**
 * Type Declaration for 'backend.ai-client'
 * ========================================
 * Project: https://github.com/lablup/backend.ai-client-js
 * Definitions by: Seunghwan Hong <https://github.com/harrydrippin>
 */ 

declare module 'backend.ai-client' {
  import * as crypto from 'crypto';

  export class ClientConfig {
    constructor(accessKey: string, secretKey: string, endpoint: string);
  
    accessKey(): string;
    secretKey(): string;
    endpoint(): string;
    endpointHost(): string;
    apiVersion(): string;
    apiVersionMajor(): string;
    hashType(): string;
  
    static createFromEnv(): ClientConfig;
  }

  interface ClientErrorType {
    value: number,
    writable: boolean,
    enumerable: boolean,
    configurable: boolean
  }

  export class Client {
    public static ERR_SERVER: ClientErrorType;
    public static ERR_RESPONSE: ClientErrorType;
    public static ERR_REQUEST: ClientErrorType;

    constructor(config: ClientConfig, agentSignature?: string);
  
    public _wrapWithPromise(rqst: any): any;
    public getServerVersion(): any;

    createIfNotExists(kernelType: string, sessionId: string): any;
    getInformation(sessionId: string): any;
    destroy(sessionId: string): any;
    restart(sessionId: string): any;
    execute(sessionId: string, runId: string, mode: string, code: string, opts: string): any;
    createKernel(kernelType: string): any;
    destroyKernel(kernelId: string): any;
    refreshKernel(kernelId: string): any;
    runCode(code: string, kernelId: string, runId: string, mode: string): any;
    mangleUserAgentSignature(): string;
    newSignedRequest(method: string, queryString: string, body: any): any;
    newUnsignedRequest(method: string, queryString: string, body: any): any;
    getAuthenticationString(method: string, queryString: string, dateValue: string, bodyValue: string): any;
    getCurrentDate(now: Date): any;
  
    sign(key: string, key_encoding: string, msg: string, digest_type: string): any;
    getSignKey(secret_key: string, now: Date): string;
    generateSessionId(): string;
  }
  
  export type backend = {
    Client: Client,
    ClientConfig: ClientConfig
  };

  export type BackendAIClient = Client;
  export type BackendAIClientConfig = ClientConfig;
}