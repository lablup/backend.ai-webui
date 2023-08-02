import {Selector} from 'testcafe';

import loginPage from './page_login';
import vfolderPage from './page_vfolder';
import {generateRandomString} from './helper';


// TODO: test server url is hard-coded.
fixture `Login Fixture`
    .page `http://localhost:9081/data`;

test('Create and delete user folder', async t => {
  const folderName = 'test-' + generateRandomString();
  await loginPage.login('user1-A-a@test.com', '0');
  await vfolderPage.createFolder(folderName);
  await vfolderPage.deleteFolder(folderName);
});

test('Create and delete group folder', async t => {
  const folderName = 'test-' + generateRandomString();
  await loginPage.login('admin1-A-a@test.com', '0');
  // TODO: host and type are not selected in the page object.
  await vfolderPage.createFolder(folderName, 'local', 'group');
  await vfolderPage.deleteFolder(folderName);
});
