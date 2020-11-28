/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {customElement, html, property} from 'lit-element';
import {BackendAIPage} from './backend-ai-page';

import tus from '../lib/tus';

import {default as PainKiller} from './backend-ai-painkiller';

/**
 Backend AI Pipeline Common.

 `backend-ai-pipeline-common` is a custom element which contains common utilities for pipeline.

  Assumptions on the vFolder structure for storing pipeline configs and data.

  /home/work/<vfolder-name>/config.json  # pipeline configuration file which stores following fields
    - title
    - description
    - environment
    - version
    - scaling_group
    - folder_host
  /home/work/<vfolder-name>/components.json  # stores whole pipeline components
    - id
    - title
    - description
    - path  # eg) /home/work/<vfolder-name>/001-load-data/
            # code is assumed to be stored in `main.py` inside `path`
    - cpu
    - mem
    - gpu
    - executed
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
    super(); }

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
                console.error("upload failed:" + err);
                this.notification.text = err;
                this.notification.show(true);
                reject(new Error(err));
              },
              onSuccess: () => {
                console.log(`${vfpath} uploaded`)
                resolve();
              }
            });
            uploader.start();
          })
          .catch((err) => {
            console.error(err)
            this.notification.text = err;
            this.notification.show(true);
            reject(new Error(err));
          });
    });
  }
}
