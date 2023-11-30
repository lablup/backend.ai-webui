import loginPage from './page_login';

// TODO: test server url and user information are hard-coded.
fixture `Login Fixture`
    .page `http://localhost:9081/`;

test('Login', async t => {
  await loginPage.login('admin@lablup.com', 'wJalrXUt');
});
