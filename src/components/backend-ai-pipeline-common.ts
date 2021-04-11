/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {customElement, property} from 'lit-element';
import {BackendAIPage} from './backend-ai-page';

import tus from '../lib/tus';

import {default as PainKiller} from './backend-ai-painkiller';

/**
 Backend AI Pipeline Common.

 `backend-ai-pipeline-common` is a custom element which contains common utilities for pipeline.

  Assumptions on the vFolder structure for storing pipeline configs and data.

  /home/work/<vfolder-name>/config.json  # pipeline configuration file which stores following fields
  {
    "title": "Fashion MNIST!",
    "description": "Fashion MNIST in TensorFlow",
    "environment": "index.docker.io/lablup/python-tensorflow",
    "version": "1.13-py36-cuda10",
    "scaling_group": "default",
    "folder_host": "local:volume1"
  }

  /home/work/<vfolder-name>/components.json  # stores whole pipeline components
  {
    "nodes": [
      {
        "id": "component-WhZwnA1j",
        "title": "01 Data Load!",
        "label": "01 Data Load!",
        "description": "Data loader",
        "path": "01-data-load",  # eg) /home/work/<vfolder-name>/001-load-data/
                                 # code is assumed to be stored in `main.py` inside `path`
        "cpu": "1",
        "mem": "2",
        "gpu": "0.5",
        "executed": true
      },
      {
        "id": "component-sYw91hPE",
        "title": "02 Data Analysis",
        "label": "02 Data Analysis",
        "description": "Data analysis example",
        "path": "02-data-analysis",
        "cpu": "1",
        "mem": "2",
        "gpu": "0.1",
        "executed": false
      },
      ...
    ],
    "edges": [
      {
        {"from": "component-WhZwnA1j", "to": "component-sYw91hPE"},
        ...
      }
    ],
  }

  /home/work/<vfolder-name>/001-load-data/      # root path for each pipeline component
  /home/work/<vfolder-name>/002-validate-data/
  ...

 @group Backend.AI Console
 @element backend-ai-pipeline-common
 */
@customElement('backend-ai-pipeline-common')
export class BackendAIPipelineCommon extends BackendAIPage {
  // Configs
  @property({type: String}) pipelineConfigPath = 'config.json';
  @property({type: String}) pipelineComponentDetailPath = 'components.json';

  constructor() {
    super();
  }

  firstUpdated() {
  }

  /**
   * Download pipeline config file and return it.
   *
   * @param {String} folderName - virtual folder name to fetch pipeline config.
   * */
  async _downloadPipelineConfig(folderName) {
    try {
      const res = await window.backendaiclient.vfolder.download(
        this.pipelineConfigPath, folderName, false, true);
      return await res.json();
    } catch (err) {
      console.error(err);
      this.notification.text = PainKiller.relieve(err.title);
      this.notification.detail = err.message;
      this.notification.show(true);
    }
  }

  /**
   * Upload a blob to a virtual folder.
   *
   * @param {String} vfpath - target upload path inside a virtual folder.
   * @param {Objecjt} blob - upload content.
   * @param {String} folderName - target virtual folder name.
   * */
  async _uploadFile(vfpath, blob, folderName) {
    return new Promise((resolve, reject) => {
      globalThis.backendaiclient.vfolder.create_upload_session(vfpath, blob, folderName)
        .then((uploadUrl) => {
          const uploader = new tus.Upload(blob, {
            endpoint: uploadUrl,
            retryDelays: [0, 3000, 5000, 10000, 20000],
            uploadUrl: uploadUrl,
            chunksize: 15728640,
            metadata: {
              filename: vfpath,
              filetype: blob.type,
            },
            onError: (err) => {
              console.error('upload failed:' + err);
              this.notification.text = err;
              this.notification.show(true);
              reject(new Error(err));
            },
            onSuccess: () => {
              console.log(`${vfpath} uploaded`);
              resolve(true);
            }
          });
          uploader.start();
        })
        .catch((err) => {
          console.error(err);
          this.notification.text = err;
          this.notification.show(true);
          reject(new Error(err));
        });
    });
  }
}
