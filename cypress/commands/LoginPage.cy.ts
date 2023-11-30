import {findShadowRoot} from '../helper/FindShadowRoot.cy';

Cypress.Commands.add('login', (email, password) => {
  const emailInput = findShadowRoot("backend-ai-webui > backend-ai-login > #id_user_id").find("input");
  const passwordInput = findShadowRoot("backend-ai-webui > backend-ai-login > #id_password").find("input");
  const loginButton = findShadowRoot("backend-ai-webui > backend-ai-login > #login-button").find("button");
  emailInput.type(email);
  passwordInput.type(password);
  loginButton.click();
});