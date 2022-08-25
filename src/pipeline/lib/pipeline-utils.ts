/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {PipelineEnvironment, PipelineInfo, PipelineInfoExtended, PipelineResources, PipelineTask, PipelineTaskDetail, PipelineTaskType} from '../lib/pipeline-type';
import {default as YAML} from 'js-yaml';

 /**
  Pipeline Utils

  `pipeline-utils` is collection of common utility methods.

 @group Backend.AI pipeline
 @element pipeline-utils
 */
 @customElement('pipeline-utils')
export default class PipelineUtils extends LitElement {
  public shadowRoot: any; // ShadowRoot

  constructor() {
    super();
  }

  static _humanReadableDate(start) {
    const d = new Date(start);
    return d.toLocaleString();
  }

  static _humanReadableTimeDuration(d1, d2 = null) {
    const startTime = new Date(d1).getTime();
    let result = '';
    if (d2 !== null && d2 !== undefined) {
      const passedTime = new Date(d2).getTime();
      let distance = Math.abs(passedTime - startTime); // multiply to second
      const days = Math.floor(distance / 86400000);
      distance -= days * 86400000;
      const hours = Math.floor(distance / 3600000);
      distance -= hours * 3600000;
      const minutes = Math.floor(distance / 60000);
      distance -= minutes * 60000;
      const seconds = Math.floor(distance / 1000);
      result += days > 0 ? `${days}d` : '';
      result += hours > 0 ? `${hours}h ` : '';
      result += minutes > 0 ? `${minutes}m ` : '';
      result += seconds > 0 ? `${seconds}s` : '';
      // if updated time was too short to display then just return 1 second
      if (result === '') {
        result = `1s`;
      }
    } else {
      // if d2 is null, then it's on-going
      result = '-';
    }
    return result;
  }

  static _humanReadablePassedTime(d) {
    const startTime = new Date(d).getTime();
    const currentTime = new Date().getTime();
    const distance = currentTime - startTime;
    const days = Math.floor(distance / 86400000);
    if (days > 0) {
      return `${days}d ago`;
    }
    d -= days * 86400000;
    const hours = Math.floor(distance / 3600000);
    if (hours > 0) {
      return `${hours}h ago`;
    }
    d -= hours * 3600000;
    const minutes = Math.floor(distance / 60000);
    if (minutes > 0) {
      return `${minutes}m ago`;
    }
    d -= minutes * 60000;
    const seconds = Math.floor(distance / 1000);
    return `${seconds}s ago`;
  }

  static _getStatusColor(status) {
    let color = 'lightgrey';
    switch (status) {
    case 'RUNNING':
    case 'RESTARTING':
    case 'RESIZING':
    case 'TERMINATING':
      color = 'green';
      break;
    case 'ERROR':
    case 'CANCELLED':
      color = 'red';
      break;
    case 'WAITING':
    case 'PAUSED':
    case 'SUSPENDED':
    case 'BUILDING':
    case 'PULLING':
    case 'SCHEDULED':
    case 'PREPARING':
    case 'PENDING':
      color = 'yellow';
      break;
    case 'TERMINATED':
      color = 'lightgrey';
      break;
    default:
      color = 'lightgrey';
      break;
    }
    return color;
  }

  static _getResultColor(result) {
    let color = 'lightgrey';
    switch (result) {
    case 'SUCCESS':
      color = 'blue';
      break;
    case 'FAILURE':
      color = 'red';
      break;
    case 'UNDEFINED':
      color = 'lightgrey';
      break;
    default:
      color = 'lightgrey';
      break;
    }
    return color;
  }

  static _setCustomEvent(eventName: string, detail: any) {
    const moveToViewEvent = new CustomEvent(eventName, detail);
    document.dispatchEvent(moveToViewEvent);
  }

  /**
  * Combine kernel and version
  *
  * @param {string} kernel - kernel name
  * @param {string} version - version
  * @return {string} `${kernel}:${version}`
  */
  static _generateKernelIndex(kernel, version) {
   return kernel + ':' + version;
 }

  static _aliasName(value) {
    const alias = {
      'python': 'Python',
      'tensorflow': 'TensorFlow',
      'pytorch': 'PyTorch',
      'lua': 'Lua',
      'r': 'R',
      'r-base': 'R',
      'julia': 'Julia',
      'rust': 'Rust',
      'cpp': 'C++',
      'gcc': 'GCC',
      'go': 'Go',
      'tester': 'Tester',
      'haskell': 'Haskell',
      'matlab': 'MATLAB',
      'sagemath': 'Sage',
      'texlive': 'TeXLive',
      'java': 'Java',
      'php': 'PHP',
      'octave': 'Octave',
      'nodejs': 'Node',
      'caffe': 'Caffe',
      'scheme': 'Scheme',
      'scala': 'Scala',
      'base': 'Base',
      'cntk': 'CNTK',
      'h2o': 'H2O.AI',
      'triton-server': 'Triton Server',
      'digits': 'DIGITS',
      'ubuntu-linux': 'Ubuntu Linux',
      'tf1': 'TensorFlow 1',
      'tf2': 'TensorFlow 2',
      'py3': 'Python 3',
      'py2': 'Python 2',
      'py27': 'Python 2.7',
      'py35': 'Python 3.5',
      'py36': 'Python 3.6',
      'py37': 'Python 3.7',
      'py38': 'Python 3.8',
      'py39': 'Python 3.9',
      'py310': 'Python 3.10',
      'ji15': 'Julia 1.5',
      'ji16': 'Julia 1.6',
      'ji17': 'Julia 1.7',
      'lxde': 'LXDE',
      'lxqt': 'LXQt',
      'xfce': 'XFCE',
      'gnome': 'GNOME',
      'kde': 'KDE',
      'ubuntu16.04': 'Ubuntu 16.04',
      'ubuntu18.04': 'Ubuntu 18.04',
      'ubuntu20.04': 'Ubuntu 20.04',
      'intel': 'Intel MKL',
      '2018': '2018',
      '2019': '2019',
      '2020': '2020',
      '2021': '2021',
      '2022': '2022',
      'tpu': 'TPU:TPUv3',
      'rocm': 'GPU:ROCm',
      'cuda9': 'GPU:CUDA9',
      'cuda10': 'GPU:CUDA10',
      'cuda10.0': 'GPU:CUDA10',
      'cuda10.1': 'GPU:CUDA10.1',
      'cuda10.2': 'GPU:CUDA10.2',
      'cuda10.3': 'GPU:CUDA10.3',
      'cuda11': 'GPU:CUDA11',
      'cuda11.0': 'GPU:CUDA11',
      'cuda11.1': 'GPU:CUDA11.1',
      'cuda11.2': 'GPU:CUDA11.2',
      'cuda11.3': 'GPU:CUDA11.3',
      'miniconda': 'Miniconda',
      'anaconda2018.12': 'Anaconda 2018.12',
      'anaconda2019.12': 'Anaconda 2019.12',
      'alpine3.8': 'Alpine Linux 3.8',
      'alpine3.12': 'Alpine Linux 3.12',
      'ngc': 'Nvidia GPU Cloud',
      'ff': 'Research Env.',
    };
    if (value in alias) {
      return alias[value];
    } else {
      return value;
    }
  }

  /**
  * Parse custom data from dataflow element to array of formatted task (json)
  *
  * @param {json} rawData - raw object from dataflow
  * @param {string} scalingGroup - scaling group set by pipeline
  * @return {Array<PipelineTask>} taskList
  */
 static _parseTaskListInfo(rawData, scalingGroup='') {
   const rawTaskList = rawData?.drawflow?.Home?.data;
   const getTaskNameFromNodeId = (connectionList) => {
     return (connectionList.length > 0) ? connectionList.map((item) => {
       return rawTaskList[item.node].name;
     }) : [];
   };
   let taskList: Array<PipelineTask>;
   const taskNodes = Object.values(rawTaskList ?? {});
   if (taskNodes.length > 0) {
     taskList = taskNodes.map((task: any) => {
      // FIXME: parse stringified task data to pipeline task detail
      const taskData: PipelineTaskDetail = JSON.parse(task.data) as PipelineTaskDetail;
       return {
         name: task.name,
         description: task.description,
         // FIXME: let's set custom type as a fallback for now.
         type: taskData.type ?? PipelineTaskType.custom,
         module_uri: '',
         command: taskData.command,
         environment: {
           'scaling-group': scalingGroup,
           image: taskData.environment.image ?? '',
           envs: taskData.environment.envs ?? {},
         } as PipelineEnvironment,
         resources: {
           cpu: taskData.resources.cpu,
           mem: taskData.resources.mem,
           "cuda.device": taskData.resources["cuda.device"],
           "cuda.shares": taskData.resources["cuda.shares"],
         } as PipelineResources,
         resource_opts: {
           shmem: taskData.resource_opts.shmem
         },
         mounts: taskData.mounts,
         dependencies: getTaskNameFromNodeId(task.inputs?.input_1?.connections),
       } as PipelineTask;
     });
   } else {
     taskList = [];
   }
   return taskList;
 }

  /**
   * Return pipelineInfo to sendable data stream
   */
  static _stringifyPipelineInfo(pipelineInfo: PipelineInfo | PipelineInfoExtended) {
    if (Object.keys(pipelineInfo).length !== 0) {
      return {
        ...pipelineInfo,
        yaml: (typeof pipelineInfo.yaml !== 'string') ? YAML.dump(pipelineInfo.yaml ?? {}) : pipelineInfo.yaml,
        dataflow: (typeof pipelineInfo.dataflow !== 'string') ? JSON.stringify(pipelineInfo.dataflow ?? `{}`): pipelineInfo.dataflow,
      };
    } else {
      return pipelineInfo;
    }
  }

  /**
   * Return pipelineInfo to modificable data object
   */
  static _parsePipelineInfo(pipelineInfo: PipelineInfo | PipelineInfoExtended) {
    if (Object.keys(pipelineInfo).length !== 0) {
      return {
        ...pipelineInfo,
        yaml: (typeof pipelineInfo.yaml === 'string') ? YAML.load(pipelineInfo.yaml === '' ? `{}` : pipelineInfo.yaml) : pipelineInfo.yaml,
        dataflow: (typeof pipelineInfo.dataflow === 'string') ? JSON.parse(pipelineInfo.dataflow ?? `{}`): pipelineInfo.dataflow,
      };
    } else {
      return pipelineInfo;
    }
  }

  /**
   * Request and receive the list of pipeline task instances by pipeline job id
   * 
   * @param {string} pipelineJobId 
   * @returns {Array<PipelineTaskInstance>}
   */
   static async _loadTaskInstances(pipelineJobId = '') {
    return globalThis.backendaiclient.pipelineTaskInstance.list(pipelineJobId);
  }

  render() {
    // language=HTML
    return html`
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-utils': PipelineUtils;
  }
}
