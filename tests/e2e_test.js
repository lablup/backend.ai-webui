import loginPage from './page_login';
import userDropdown from './userDropdown';

// TODO: test server url and user information are hard-coded.
fixture `Login Fixture`
    .page `http://localhost:9081/`;

test('changeUserName', async t => {
  await loginPage.login('test@lablup.com', 'test123!');
  await userDropdown.changeProfile('testww', "test123!", "test123@");
  await userDropdown.logout();
  await loginPage.login('test@lablup.com', "test123@");
});
