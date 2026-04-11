// @ts-nocheck
export class Resources {
  public client: any;
  public resources: any;
  public agents: any;

  constructor(client) {
    this.client = client;
    this.resources = {};
    this._init_resource_values();
  }

  _init_resource_values() {
    this.resources.cpu = {};
    this.resources.cpu.total = 0;
    this.resources.cpu.used = 0;
    this.resources.cpu.percent = 0;
    this.resources.mem = {};
    this.resources.mem.total = 0;
    this.resources.mem.allocated = 0;
    this.resources.mem.used = 0;
    this.resources.gpu = {};
    this.resources.gpu.total = 0;
    this.resources.gpu.used = 0;
    this.resources['cuda.device'] = {};
    this.resources['cuda.device'].total = 0;
    this.resources['cuda.device'].used = 0;
    this.resources.fgpu = {};
    this.resources.fgpu.total = 0;
    this.resources.fgpu.used = 0;
    this.resources['cuda.shares'] = {};
    this.resources['cuda.shares'].total = 0;
    this.resources['cuda.shares'].used = 0;
    this.resources['rocm.device'] = {};
    this.resources['rocm.device'].total = 0;
    this.resources['rocm.device'].used = 0;
    this.resources['tpu.device'] = {};
    this.resources['tpu.device'].total = 0;
    this.resources['tpu.device'].used = 0;
    this.resources['ipu.device'] = {};
    this.resources['ipu.device'].total = 0;
    this.resources['ipu.device'].used = 0;
    this.resources['atom.device'] = {};
    this.resources['atom.device'].total = 0;
    this.resources['atom.device'].used = 0;
    this.resources['atom-plus.device'] = {};
    this.resources['atom-plus.device'].total = 0;
    this.resources['atom-plus.device'].used = 0;
    this.resources['atom-max.device'] = {};
    this.resources['atom-max.device'].total = 0;
    this.resources['atom-max.device'].used = 0;
    this.resources['gaudi2.device'] = {};
    this.resources['gaudi2.device'].total = 0;
    this.resources['gaudi2.device'].used = 0;
    this.resources['warboy.device'] = {};
    this.resources['warboy.device'].total = 0;
    this.resources['warboy.device'].used = 0;
    this.resources['rngd.device'] = {};
    this.resources['rngd.device'].total = 0;
    this.resources['rngd.device'].used = 0;
    this.resources['hyperaccel-lpu.device'] = {};
    this.resources['hyperaccel-lpu.device'].total = 0;
    this.resources['hyperaccel-lpu.device'].used = 0;
    this.resources['tt-n300.device'] = {};
    this.resources['tt-n300.device'].total = 0;
    this.resources['tt-n300.device'].used = 0;

    this.resources.agents = {};
    this.resources.agents.total = 0;
    this.resources.agents.using = 0;
    this.agents = [];
  }

  /**
   * Total resource information of Backend.AI cluster.
   *
   * @param {string} status - Resource node status to get information.
   */
  async totalResourceInformation(status = 'ALIVE'): Promise<any> {
    if (this.client.is_admin) {
      let fields = [
        'id',
        'addr',
        'status',
        'first_contact',
        'cpu_cur_pct',
        'mem_cur_bytes',
        'occupied_slots',
        'available_slots',
      ];
      return this.client.agent
        .list(status, fields)
        .then((response) => {
          this._init_resource_values();
          this.agents = response.agents;
          Object.keys(this.agents).map((objectKey) => {
            let value = this.agents[objectKey];
            let occupied_slots = JSON.parse(value.occupied_slots);
            let available_slots = JSON.parse(value.available_slots);
            if ('cpu' in available_slots) {
              this.resources.cpu.total =
                this.resources.cpu.total +
                Math.floor(Number(available_slots.cpu));
            }
            if ('cpu' in occupied_slots) {
              this.resources.cpu.used =
                this.resources.cpu.used +
                Math.floor(Number(occupied_slots.cpu));
            }
            this.resources.cpu.percent =
              this.resources.cpu.percent + parseFloat(value.cpu_cur_pct);

            if (occupied_slots.mem === undefined) {
              occupied_slots.mem = 0;
            }
            this.resources.mem.total =
              parseFloat(this.resources.mem.total) +
              parseInt(
                this.client.utils.changeBinaryUnit(available_slots.mem, 'b'),
              );
            this.resources.mem.allocated =
              parseInt(this.resources.mem.allocated) +
              parseInt(
                this.client.utils.changeBinaryUnit(occupied_slots.mem, 'b'),
              );
            this.resources.mem.used =
              parseInt(this.resources.mem.used) +
              parseInt(
                this.client.utils.changeBinaryUnit(value.mem_cur_bytes, 'b'),
              );

            if ('cuda.device' in available_slots) {
              this.resources['cuda.device'].total =
                parseInt(this.resources['cuda.device'].total) +
                Math.floor(Number(available_slots['cuda.device']));
            }
            if ('cuda.device' in occupied_slots) {
              this.resources['cuda.device'].used =
                parseInt(this.resources['cuda.device'].used) +
                Math.floor(Number(occupied_slots['cuda.device']));
            }
            if ('cuda.shares' in available_slots) {
              this.resources['cuda.shares'].total =
                parseFloat(this.resources['cuda.shares'].total) +
                parseFloat(available_slots['cuda.shares']);
            }
            if ('cuda.shares' in occupied_slots) {
              this.resources['cuda.shares'].used =
                parseFloat(this.resources['cuda.shares'].used) +
                parseFloat(occupied_slots['cuda.shares']);
            }
            if ('rocm.device' in available_slots) {
              this.resources['rocm.device'].total =
                parseInt(this.resources['rocm.device'].total) +
                Math.floor(Number(available_slots['rocm.device']));
            }
            if ('rocm.device' in occupied_slots) {
              this.resources['rocm.device'].used =
                parseInt(this.resources['rocm.device'].used) +
                Math.floor(Number(occupied_slots['rocm.device']));
            }
            if ('tpu.device' in available_slots) {
              this.resources['tpu.device'].total =
                parseInt(this.resources['tpu.device'].total) +
                Math.floor(Number(available_slots['tpu.device']));
            }
            if ('tpu.device' in occupied_slots) {
              this.resources['tpu.device'].used =
                parseInt(this.resources['tpu.device'].used) +
                Math.floor(Number(occupied_slots['tpu.device']));
            }
            if ('ipu.device' in available_slots) {
              this.resources['ipu.device'].total =
                parseInt(this.resources['ipu.device'].total) +
                Math.floor(Number(available_slots['ipu.device']));
            }
            if ('ipu.device' in occupied_slots) {
              this.resources['ipu.device'].used =
                parseInt(this.resources['ipu.device'].used) +
                Math.floor(Number(occupied_slots['ipu.device']));
            }
            if ('atom.device' in available_slots) {
              this.resources['atom.device'].total =
                parseInt(this.resources['atom.device'].total) +
                Math.floor(Number(available_slots['atom.device']));
            }
            if ('atom.device' in occupied_slots) {
              this.resources['atom.device'].used =
                parseInt(this.resources['atom.device'].used) +
                Math.floor(Number(occupied_slots['atom.device']));
            }
            if ('atom-plus.device' in available_slots) {
              this.resources['atom-plus.device'].total =
                parseInt(this.resources['atom-plus.device'].total) +
                Math.floor(Number(available_slots['atom-plus.device']));
            }
            if ('atom-plus.device' in occupied_slots) {
              this.resources['atom-plus.device'].used =
                parseInt(this.resources['atom-plus.device'].used) +
                Math.floor(Number(occupied_slots['atom-plus.device']));
            }
            if ('atom-max.device' in available_slots) {
              this.resources['atom-max.device'].total =
                parseInt(this.resources['atom-max.device'].total) +
                Math.floor(Number(available_slots['atom-max.device']));
            }
            if ('atom-max.device' in occupied_slots) {
              this.resources['atom-max.device'].used =
                parseInt(this.resources['atom-max.device'].used) +
                Math.floor(Number(occupied_slots['atom-max.device']));
            }
            if ('gaudi2.device' in available_slots) {
              this.resources['gaudi2.device'].total =
                parseInt(this.resources['gaudi2.device'].total) +
                Math.floor(Number(available_slots['gaudi2.device']));
            }
            if ('gaudi2.device' in occupied_slots) {
              this.resources['gaudi2.device'].used =
                parseInt(this.resources['gaudi2.device'].used) +
                Math.floor(Number(occupied_slots['gaudi2.device']));
            }
            if ('warboy.device' in available_slots) {
              this.resources['warboy.device'].total =
                parseInt(this.resources['warboy.device'].total) +
                Math.floor(Number(available_slots['warboy.device']));
            }
            if ('warboy.device' in occupied_slots) {
              this.resources['warboy.device'].used =
                parseInt(this.resources['warboy.device'].used) +
                Math.floor(Number(occupied_slots['warboy.device']));
            }
            if ('rngd.device' in available_slots) {
              this.resources['rngd.device'].total =
                parseInt(this.resources['rngd.device'].total) +
                Math.floor(Number(available_slots['rngd.device']));
            }
            if ('rngd.device' in occupied_slots) {
              this.resources['rngd.device'].used =
                parseInt(this.resources['rngd.device'].used) +
                Math.floor(Number(occupied_slots['rngd.device']));
            }
            if ('hyperaccel-lpu.device' in available_slots) {
              this.resources['hyperaccel-lpu.device'].total =
                parseInt(this.resources['hyperaccel-lpu.device'].total) +
                Math.floor(Number(available_slots['hyperaccel-lpu.device']));
            }
            if ('hyperaccel-lpu.device' in occupied_slots) {
              this.resources['hyperaccel-lpu.device'].used =
                parseInt(this.resources['hyperaccel-lpu.device'].used) +
                Math.floor(Number(occupied_slots['hyperaccel-lpu.device']));
            }
            if ('tt-n300.device' in available_slots) {
              this.resources['tt-n300.device'].total =
                parseInt(this.resources['tt-n300.device'].total) +
                Math.floor(Number(available_slots['tt-n300.device']));
            }
            if ('tt-n300.device' in occupied_slots) {
              this.resources['tt-n300.device'].used =
                parseInt(this.resources['tt-n300.device'].used) +
                Math.floor(Number(occupied_slots['tt-n300.device']));
            }

            if (isNaN(this.resources.cpu.used)) {
              this.resources.cpu.used = 0;
            }
            if (isNaN(this.resources.mem.used)) {
              this.resources.mem.used = 0;
            }
            if (isNaN(this.resources.gpu.used)) {
              this.resources.gpu.used = 0;
            }
            if (isNaN(this.resources.fgpu.used)) {
              this.resources.fgpu.used = 0;
            }
          });
          // Legacy code
          this.resources.gpu.total = this.resources['cuda.device'].total;
          this.resources.gpu.used = this.resources['cuda.device'].used;
          this.resources.fgpu.used =
            this.resources['cuda.shares'].used.toFixed(2);
          this.resources.fgpu.total =
            this.resources['cuda.shares'].total.toFixed(2);
          this.resources.agents.total = Object.keys(this.agents).length; // TODO : remove terminated agents
          this.resources.agents.using = Object.keys(this.agents).length;
          return Promise.resolve(this.resources);
        })
        .catch((err) => {
          throw err;
        });
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   * user statistics about usage.
   *
   */
  async user_stats(): Promise<any> {
    const rqst = this.client.newSignedRequest(
      'GET',
      '/resource/stats/user/month',
      null,
    );
    // return this.client._wrapWithPromise(rqst);
    return this.client._wrapWithPromise(rqst, false, null);
  }
}
