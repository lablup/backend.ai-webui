import loginPage from './page_login';
import userDropdown from './userDropdown';
import vfolderPage from './page_vfolder';
import {generateRandomString} from './helper';

// TODO: test server url and user information are hard-coded.
fixture `Login Fixture`
    .page `http://localhost:9081/`;

test('changeUserName', async t => {
  await loginPage.login('test@lablup.com', 'test123!');
  await userDropdown.changeProfile('testww', "test123!", "test123@");
  await userDropdown.logout();
  await loginPage.login('test@lablup.com', "test123@");
});

test('Create and delete user folder', async t => {
  const folderName = 'test-' + generateRandomString();
  await loginPage.login('test@lablup.com', 'test123@');
  await t.wait(5000);
  await t.navigateTo("http://localhost:9081/data")
  await t.wait(6000);
  await vfolderPage.createFolder(folderName);
  await vfolderPage.deleteFolder(folderName);
});