describe('Initial cypress E2E test', () => {
  beforeEach(() => {
    cy.viewport(1280,800)
    cy.visit('http://localhost:9081'); //방문할 페이지
  })

  it('Admin-user-profile change', () => {
    cy.get("backend-ai-webui[id='webui-shell']").shadow().within(() => {
      cy.get("backend-ai-login[id='login-panel']").shadow().within(() => { //로그인
        cy.get("mwc-textfield[id='id_user_id']").shadow().within(() => { //email input
          cy.get("input[type='email']").type("admin@lablup.com");
        });
        cy.get("mwc-textfield[id='id_password']").shadow().within(() => { //password input
          cy.get("input[type='password']").type("wJalrXUt");
        });
        cy.get("mwc-textfield[id='id_api_endpoint']").shadow().within(() => { //endpoint input
          cy.get("input[type='text']").type("http://127.0.0.1:8090");
        });
        cy.get("mwc-button[id='login-button']").click(); //siginIn buttton
      });
      cy.get("mwc-list-item:contains('사용자')").click()
      cy.get("backend-ai-credential-view").shadow().within(() => {
        cy.get("backend-ai-user-list[id='active-user-list']").shadow().within(() => {
          cy.get("vaadin-grid-cell-content[slot='vaadin-grid-cell-content-15']").within(() => {
            cy.get("mwc-icon-button[icon='settings']").click();
          });
          cy.get("backend-ai-react-user-setting-dialog").shadow().within(() => {
            cy.get("input[id='password']").focus().type("test123@");
            cy.wait(500);
            cy.get("input[id='password_confirm']").focus().type("test123@");
            cy.get("button:contains('확인')").click();
          });
        });
      });
      cy.get("backend-ai-react-user-dropdown-menu").trigger("click").then((dropdownMenu) => {
        cy.get(dropdownMenu).shadow().within(() => {
          cy.get("li:contains('로그아웃')").click();
        });
      });
    });
  });

  it('test user login test', () => {
    cy.get("backend-ai-webui[id='webui-shell']").shadow().within(() => { //로그인
      cy.get("backend-ai-login[id='login-panel']").shadow().within(() => {
        cy.get("mwc-textfield[id='id_user_id']").shadow().within(() => {
          cy.get("input[type='email']").type("test@lablup.com");
        });
        cy.get("mwc-textfield[id='id_password']").shadow().within(() => {
          cy.get("input[type='password']").type("test123@");
        });
        cy.get("mwc-textfield[id='id_api_endpoint']").shadow().within(() => { //endpoint input
          cy.get("input[type='text']").type("http://127.0.0.1:8090");
        });
        cy.get("mwc-button[id='login-button']").click();
      });
      cy.get("mwc-drawer[style='visibility: visible; --mdc-drawer-width: 250px;']").should("exist");
    });
  });
});