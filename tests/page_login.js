import {t} from 'testcafe';

import {ShadowSelector} from './helper';


class LoginPage {
  constructor() {
    // `typeText` does not work on <wl-textfield>.
    // `wl-textfield > input` should be the target of `typeText` for now.
    this.emailInput = ShadowSelector('backend-ai-webui > backend-ai-login > #id_user_id').child('input');
    this.passwordInput = ShadowSelector('backend-ai-webui > backend-ai-login > #id_password').child('input');
    this.loginButton = ShadowSelector('backend-ai-webui > backend-ai-login > #login-button');
  }

  async login(email, password) {
    await t
      .typeText(this.emailInput, email)
      .typeText(this.passwordInput, password)
      .click(this.loginButton);
  }
}

export default new LoginPage();
