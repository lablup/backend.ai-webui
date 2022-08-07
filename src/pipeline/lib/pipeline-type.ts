/**
 * Pipeline Information interface
 */
export interface PipelineInfoBase {
  name: string,
  description: string,
  storage: {
    host: string,
    name: string,
  },
  yaml: string,
  dataflow: object,
  is_active: boolean,
};

/**
 * Pipeline Information class
 */
export class PipelineInfo implements PipelineInfoBase {
  name: string;
  description: string;
  storage: {
    host: string,
    name: string,
  };
  yaml: string;
  dataflow: object;
  is_active: boolean;

  constructor() {
    this.name = '';
    this.description = '';
    this.storage = {
      host: '',
      name: '',
    };
    this.yaml = '';
    this.dataflow = Object();
    this.is_active = false;
  }
}

/**
 * Extended Pipeline Information class received from pipeline server 
 * 
 */
export class PipelineInfoExtended extends PipelineInfo {
  created_at: string;
  last_modified: string;
  id: string;
  owner: string;
  version: string;
  
  constructor() {
    super();
    this.created_at = '';
    this.last_modified = '';
    this.id = '';
    this.owner = '';
    this.version = '';
  }
}

/**
 * Pipeline Info (YAML) interface
 */
export interface PipelineYAMLBase {
  name: string,
  description: string,
  ownership: {
    domain_name: string,
    group_name: string,
  },
  environment: PipelineEnvironment,
  resources: PipelineResources,
  resource_opts: {
    shmem: string,
  },
  mounts: Array<string>,
}

export class PipelineYAML implements PipelineYAMLBase {
  name: string;
  description: string;
  ownership: {
    domain_name: string,
    group_name: string,
  };
  environment: PipelineEnvironment;
  resources: PipelineResources;
  resource_opts: {
    shmem: string,
  };
  mounts: Array<string>;

  constructor() {
    this.name = '';
    this.description = '';
    this.ownership = {
      domain_name: '',
      group_name: '',
    };
    this.environment = new PipelineEnvironment();
    this.resources = new PipelineResources();
    this.resource_opts = {shmem: ''};
    this.mounts = [];
  }
}

/**
 * Task interface
 */
export interface PipelineTaskNodeBase {
  name: string,
  inputs: number,
  outputs: number,
  class: string,
  pos_x: number,
  pos_y: number,
  data: PipelineTaskDetail,
  html: string,
}

export class PipelineTaskNode implements PipelineTaskNodeBase {
  name: string;
  inputs: number;
  outputs: number;
  class: string;
  pos_x: number;
  pos_y: number;
  data: PipelineTaskDetail;
  html: string;

  constructor() {
    this.name = '';
    this.inputs = 0;
    this.outputs = 0;
    this.class = '';
    this.pos_x = 0;
    this.pos_y = 0;
    this.data = new PipelineTaskDetail();
    this.html = '';
  }
}

export interface PipelineTaskBase extends Omit<PipelineYAMLBase, 'ownership'> {
  module_uri: string,
  type: string,
  dependencies? : Array<string>,
}

export class PipelineTask implements PipelineTaskBase {
  name: string;
  description: string;
  environment: PipelineEnvironment;
  resources: PipelineResources;
  resource_opts: {
    shmem: string,
  };
  mounts: Array<string>;
  module_uri: string;
  type: string;
  dependencies? : Array<string>;

  constructor() {
    this.name = '';
    this.description = '';
    this.environment = new PipelineEnvironment();
    this.resources = new PipelineResources();
    this.resource_opts = {shmem: ''};
    this.mounts = [];
    this.module_uri = '';
    this.type = '';
    // this.dependencies = [];
  }
}

/**
 * Task data interface partially used in PipelineTaskNode interface 
 */
export interface PipelineTaskDetailBase {
  type: string,
  environment: PipelineEnvironment,
  resources: PipelineResources,
  resource_opts: {
    shmem: string,
  },
  command: string,
  mounts: Array<string>,
}

export class PipelineTaskDetail implements PipelineTaskDetailBase {
  type: string;
  environment: PipelineEnvironment;
  resources: PipelineResources;
  resource_opts: {
    shmem: string
  };
  command: string;
  mounts: Array<string>;

  constructor() {
    this.type = '';
    this.environment = new PipelineEnvironment();
    this.resources = new PipelineResources();
    this.resource_opts = {shmem: ''};
    this.command = '';
    this.mounts = [];
  }
}

/**
 * Resources used in pipeline
 */
export interface PipelineResourcesBase {
  cpu: string,
  memory: string,
  cuda?: {
    shares: string,
    device: string,
  },
}

export class PipelineResources implements PipelineResourcesBase {
  cpu: string;
  memory: string;
  cuda?: {
    shares: string,
    device: string,
  };

  constructor() {
    this.cpu = '';
    this.memory = '';
  }
}

/**
 * Environment detail used in pipeline
 */
export interface PipelineEnvironmentBase {
  image: string,
  envs: object, 
  'scaling-group': string,
}

export class PipelineEnvironment implements PipelineEnvironmentBase {
  image: string;
  envs: object;
  'scaling-group': string;

  constructor() {
    this.image = ''
    this.envs = {};
    this["scaling-group"] = '';
  }
}

/**
 * The type of Pipeline Task
 */
export enum PipelineTaskType {
  github = 'Import from GitHub',
  gitlab = 'Import from GitLab',
  custom = 'Custom Task'
}