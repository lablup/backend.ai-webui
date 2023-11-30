import {t} from 'testcafe';
import { ShadowSelector } from './helper';


class UserDropdown {
  constructor() {
    this.userDropdown = ShadowSelector("backend-ai-webui").find("backend-ai-react-user-dropdown-menu");
  }

  async changeProfile(userName, originalPassword, newPassword) {
    const userProfileSettingMenu = this.userDropdown.shadowRoot().find("li")
    .withAttribute("data-menu-id", /.*userProfileSetting/);
    const userProfileModal = ShadowSelector("backend-ai-webui > backend-ai-react-user-profile-setting-dialog");
    const userNameInput = userProfileModal.find("#full_name");
    const originalPasswordInput = userProfileModal.find("#originalPassword");
    const newPasswordInput = userProfileModal.find("#newPassword");
    const newPasswordConfirmInput = userProfileModal.find("#newPasswordConfirm");
    const modalOkButton = userProfileModal.find("button").withText("변경");

    await t.click(this.userDropdown);
    await t.click(userProfileSettingMenu);
    await t
      .typeText(userNameInput, userName, {replace: true})
      .typeText(originalPasswordInput, originalPassword)
      .typeText(newPasswordInput, newPassword)
      .typeText(newPasswordConfirmInput, newPassword);
    await t.click(modalOkButton);
  }

  async logout() {
    const logoutMenu = this.userDropdown.shadowRoot().find("li")
    .withAttribute("data-menu-id", /.*logout/);

    await t.click(this.userDropdown);
    await t.click(logoutMenu);
  }
}

export default new UserDropdown();