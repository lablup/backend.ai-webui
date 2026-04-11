export class Cloud {
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
   * Check if cloud endpoint is available.
   */
  async ping(): Promise<any> {
    const rqst = this.client.newSignedRequest('GET', '/cloud/ping');
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Verify signup email by JWT token.
   *
   * @param {string} token - JWT token which is delivered to user's email.
   */
  async verify_email(token: string): Promise<any> {
    const body = { verification_code: token };
    const rqst = this.client.newSignedRequest(
      'POST',
      '/cloud/verify-email',
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Send verification email.
   *
   * @param {string} email - user's email.
   */
  async send_verification_email(email: string): Promise<any> {
    const body = { email };
    const rqst = this.client.newSignedRequest(
      'POST',
      '/cloud/send-verification-email',
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Send password change email to assist users who forgot their password.
   *
   * @param {string} email - user's email.
   */
  async send_password_change_email(email: string): Promise<any> {
    const body = { email };
    const rqst = this.client.newSignedRequest(
      'POST',
      '/cloud/send-password-change-email',
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }

  /**
   * Verify JWT token for changing password.
   *
   * @param {string} email - user's email (for verification).
   * @param {string} password - new password.
   * @param {string} token - JWT token which is delivered to user's email.
   */
  async change_password(
    email: string,
    password: string,
    token: string,
  ): Promise<any> {
    const body = { email, password, token };
    const rqst = this.client.newSignedRequest(
      'POST',
      '/cloud/change-password',
      body,
    );
    return this.client._wrapWithPromise(rqst);
  }
}
