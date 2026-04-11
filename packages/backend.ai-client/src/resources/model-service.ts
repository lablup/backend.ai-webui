// @ts-nocheck
export class ModelService {
  public client: any;

  /**
   * The Container image API wrapper.
   *
   * @param {Client} client - the Client API wrapper object to bind
   */
  constructor(client) {
    this.client = client;
  }

  listService() {
    // TODO: request list service by project(group) id
  }

  createService() {
    // TODO: request service creation by params
  }

  getServiceInfo() {
    // TODO: request service info detail by its id
  }

  termiateService() {
    // TODO: request service termination by its id
  }

  scaleRoutes() {
    // TODO: request routing count by its id and desired count
  }

  syncRoutings() {
    // TODO: request checking routings whether are successfully added or not by service id
  }

  updateRoute() {
    // TODO: request to update routing details (for now traffic ratio) by service id and routing id
  }

  deleteRoute() {
    // TODO: request to update desired routing count to -1 to delete routing of the service by service id and route_id
  }

  generateServiceToken() {
    // TODO: request generate token for accessing to service app by service id
  }
}
