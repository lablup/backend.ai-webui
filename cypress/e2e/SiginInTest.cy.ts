describe('Initial cypress E2E test', () => {
  beforeEach(() => {// 테스트 실행하기 전 실행할 문구
    cy.visit('http://localhost:9081'); //방문할 페이지
  });

  it('logininPage Component test', () => {
    cy.get("backend-ai-webui[id='webui-shell']").shadow().within(() => {
      cy.get("backend-ai-login[id='login-panel']").shadow().within(() => {
        cy.get("backend-ai-dialog[id='login-panel']").should("exist").then((loginDialog) => { //loginDialog
          cy.get(loginDialog).find("div[slot='title']").should("exist").then((title) => { //title
            cy.get(title).find("div[class='horizontal center layout']").find("img[class='title-img']").should("exist"); //로고 image
          });
          cy.get(loginDialog).find("div[slot='content']").should("exist").then((content) => { //content
            cy.get(content).find("h3[class='horizontal center layout']").should("exist"); //E-mail로그인
            cy.get(content).find("div[class='horizontal flex layout login-input-without-trailing-icon']").should("exist"); //e-mail input
            cy.get(content).find("div[class='horizontal flex layout']").should("exist"); //password input
            cy.get(content).find("div[id='id_api_endpoint_container']").should("exist"); //endpoint
            cy.get(content).find("mwc-button[id='login-button']").should("exist"); //siginIn buttton
          });
        });
      });
    });
  });

  it('login test', () => {
    cy.get("backend-ai-webui[id='webui-shell']").shadow().within(() => {
      cy.get("backend-ai-login[id='login-panel']").shadow().within(() => {
        cy.get("backend-ai-dialog[id='login-panel']").should("exist").then((loginDialog) => { //loginDialog
          cy.get(loginDialog).find("mwc-textfield[id='id_user_id']").shadow().within(()=>{
            cy.get("input[type='email']").should("exist").type("admin@lablup.com");
          });
          cy.get(loginDialog).find("mwc-textfield[id='id_password']").shadow().within(()=>{
            cy.get("input[type='password']").should("exist").type("wJalrXUt");
          });
          cy.get(loginDialog).find("mwc-textfield[id='id_api_endpoint']").shadow().within(()=>{
            cy.get("input[type='text']").should("exist").type("http://10.100.64.15:8090");
          });
          cy.get(loginDialog).find("mwc-button[id='login-button']").should("exist").click(); //siginIn buttton
        });
      });
    });
  });
});