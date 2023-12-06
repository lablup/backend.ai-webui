import {findShadowRoot} from '../helper/FindShadowRoot.cy';

Cypress.Commands.add('login', (email: string, password: string, endpoint: string) => {
  const emailInput = findShadowRoot('backend-ai-webui > backend-ai-login > #id_user_id').find('input');
  const passwordInput = findShadowRoot('backend-ai-webui > backend-ai-login > #id_password').find('input');
  const endpointInput = findShadowRoot('backend-ai-webui > backend-ai-login > #id_api_endpoint').find('input');
  const loginButton = findShadowRoot('backend-ai-webui > backend-ai-login > #login-button').find('button');
  emailInput.type(email);
  passwordInput.type(password);
  endpointInput.clear().type(endpoint);
  loginButton.click();
});