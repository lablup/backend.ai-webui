import {findShadowRoot} from '../helper/FindShadowRoot.cy';

Cypress.Commands.add('userProfileChange', (userName, originalPassword, newPassword) => {
  findShadowRoot("backend-ai-webui").find("backend-ai-react-user-dropdown-menu").trigger("click").then(() =>{
    findShadowRoot("backend-ai-webui > backend-ai-react-user-dropdown-menu").find("li:contains(사용자 정보 변경)").click();
  });
  findShadowRoot("backend-ai-webui > backend-ai-react-user-profile-setting-dialog")
    .find("#full_name").clear().focus().type(userName);
  findShadowRoot("backend-ai-webui > backend-ai-react-user-profile-setting-dialog")
    .find("#originalPassword").focus().type(originalPassword);
  findShadowRoot("backend-ai-webui > backend-ai-react-user-profile-setting-dialog")
    .find("#newPassword").focus().type(newPassword);
  findShadowRoot("backend-ai-webui > backend-ai-react-user-profile-setting-dialog")
    .find("#newPasswordConfirm").focus().type(newPassword);
  findShadowRoot("backend-ai-webui > backend-ai-react-user-profile-setting-dialog")
    .find("button:contains(변경)").click();
});

Cypress.Commands.add('logout', () => {
  findShadowRoot("backend-ai-webui").find("backend-ai-react-user-dropdown-menu").trigger("click").then(() =>{
    findShadowRoot("backend-ai-webui > backend-ai-react-user-dropdown-menu").find("li:contains(로그아웃)").click();
  });
})