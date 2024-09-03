/**
 @license
 Copyright (c) 2015-2024 Lablup Inc. All rights reserved.
 */
import '../plastics/lablup-shields/lablup-shields';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import './backend-ai-dialog';
import { BackendAiStyles } from './backend-ai-general-styles';
import BackendAIListStatus, { StatusCondition } from './backend-ai-list-status';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import './lablup-grid-sort-filter-column';
import './lablup-loading-spinner';
import { Button } from '@material/mwc-button/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-select';
import '@material/mwc-slider';
import '@material/mwc-textfield';
import '@vaadin/grid/vaadin-grid';
import '@vaadin/grid/vaadin-grid-filter-column';
import '@vaadin/grid/vaadin-grid-selection-column';
import '@vaadin/grid/vaadin-grid-sort-column';
import { css, CSSResultGroup, html, render } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type LablupLoadingSpinner = HTMLElementTagNameMap['lablup-loading-spinner'];
type BackendAIDialog = HTMLElementTagNameMap['backend-ai-dialog'];

/**
  Backend.AI Environment List
  @group Backend.AI Web UI
  @element backend-ai-environment-list
  */

@customElement('backend-ai-environment-list')
export default class BackendAIEnvironmentList extends BackendAIPage {
  @property({ type: Array }) images;
  @property({ type: Object }) resourceBroker;
  @property({ type: Array }) allowed_registries;
  @property({ type: Array }) servicePorts;
  @property({ type: Array }) selectedImages = [];
  @property({ type: Object }) modifiedImage = Object();
  @property({ type: Object }) alias = Object();
  @property({ type: Object }) indicator = Object();
  @property({ type: Array }) installImageNameList;
  @property({ type: Array }) deleteImageNameList;
  @property({ type: Object }) deleteAppInfo = Object();
  @property({ type: Object }) deleteAppRow = Object();
  @property({ type: Boolean }) openManageAppModal = false;
  @property({ type: Boolean }) openManageImageResourceModal = false;
  @property({ type: Object }) installImageResource = Object();
  @property({ type: Object }) selectedCheckbox = Object();
  @property({ type: Object }) _grid = Object();
  @property({ type: String }) servicePortsMsg = '';
  @property({ type: Number }) cpuValue = 0;
  @property({ type: String }) listCondition: StatusCondition = 'loading';
  @property({ type: Object }) _boundRequirementsRenderer =
    this.requirementsRenderer.bind(this);
  @property({ type: Object }) _boundControlsRenderer =
    this.controlsRenderer.bind(this);
  @property({ type: Object }) _boundInstallRenderer =
    this.installRenderer.bind(this);
  @property({ type: Object }) _boundBaseImageRenderer =
    this.baseImageRenderer.bind(this);
  @property({ type: Object }) _boundConstraintRenderer =
    this.constraintRenderer.bind(this);
  @property({ type: Object }) _boundDigestRenderer =
    this.digestRenderer.bind(this);
  @query('#loading-spinner') spinner!: LablupLoadingSpinner;
  @query('#modify-image-cpu') modifyImageCpu!: Button;
  @query('#modify-image-mem') modifyImageMemory!: Button;
  @query('#modify-image-cuda-gpu') modifyImageCudaGpu!: Button;
  @query('#modify-image-cuda-fgpu') modifyImageCudaFGpu!: Button;
  @query('#modify-image-rocm-gpu') modifyImageRocmGpu!: Button;
  @query('#modify-image-tpu') modifyImageTpu!: Button;
  @query('#modify-image-ipu') modifyImageIpu!: Button;
  @query('#modify-image-atom') modifyImageAtom!: Button;
  @query('#modify-image-atom-plus') modifyImageAtomPlus!: Button;
  @query('#modify-image-gaudi-2') modifyImageGaudi2!: Button;
  @query('#modify-image-warboy') modifyImageWarboy!: Button;
  @query('#modify-image-hyperaccel-lpu') modifyImageHyperaccelLPU!: Button;
  @query('#delete-app-info-dialog') deleteAppInfoDialog!: BackendAIDialog;
  @query('#delete-image-dialog') deleteImageDialog!: BackendAIDialog;
  @query('#install-image-dialog') installImageDialog!: BackendAIDialog;
  @query('#modify-app-container') modifyAppContainer!: HTMLDivElement;
  @query('#list-status') private _listStatus!: BackendAIListStatus;

  constructor() {
    super();
    this.installImageNameList = [];
    this.deleteImageNameList = [];
    this.images = [];
    this.allowed_registries = [];
    this.servicePorts = [];
    this.modifiedImage = {};
  }

  static get styles(): CSSResultGroup {
    // noinspection CssInvalidPropertyValue
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        vaadin-grid {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 199px);
          /* height: calc(100vh - 229px); */
        }
        h4 {
          font-weight: 200;
          font-size: 14px;
          margin: 0px;
          padding: 5px 15px 5px 20px;
        }
        mwc-icon.indicator {
          --mdc-icon-size: 16px;
          padding: 0;
        }
        img.indicator-icon {
          width: 16px;
          height: 16px;
        }
        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }
        span.resource-limit-title {
          font-size: 14px;
          font-family: var(--token-fontFamily);
          text-align: left;
          width: 70px;
        }
        backend-ai-dialog {
          --component-min-width: 350px;
        }
        backend-ai-dialog vaadin-grid {
          margin: 0px 20px;
        }
        .gutterBottom {
          margin-bottom: 20px;
        }
        div.container {
          display: flex;
          flex-direction: column;
          padding: 0px 30px;
        }
        mwc-button.operation {
          margin: auto 10px;
          padding: auto 10px;
        }
        mwc-button[outlined] {
          width: 100%;
          margin: 10px auto;
          background-image: none;
          --mdc-button-outline-width: 2px;
        }
        mwc-button[disabled] {
          background-image: var(--general-sidebar-color);
        }
        mwc-button[disabled].range-value {
          --mdc-button-disabled-ink-color: var(
            --token-colorTextDisabled,
            --general-sidebar-color
          );
        }
        mwc-select {
          --mdc-menu-item-height: auto;
        }
        mwc-textfield {
          width: 100%;
          --mdc-text-field-fill-color: transparent;
          --mdc-theme-primary: var(--general-textfield-selected-color);
          --mdc-typography-font-family: var(--token-fontFamily);
        }
        mwc-slider {
          width: 150px;
          margin: auto 10px;
          --mdc-theme-primary: var(--general-slider-color);
          --mdc-theme-text-primary-on-dark: var(
            --token-colorSecondary,
            #ffffff
          );
        }
      `,
    ];
  }

  firstUpdated() {
    this.indicator = globalThis.lablupIndicator;
    this.notification = globalThis.lablupNotification;
    this.resourceBroker = globalThis.resourceBroker;

    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this._getImages();
        },
        true,
      );
    } else {
      // already connected
      this._getImages();
    }
    this._grid = this.shadowRoot?.querySelector('#testgrid');
    this._grid.addEventListener('sorter-changed', (e) => {
      this._refreshSorter(e);
    });

    document.addEventListener('image-rescanned', () => {
      this._getImages();
    });

    // uncheck every checked rows when dialog is closed
    this.installImageDialog.addEventListener('didHide', () => {
      this._uncheckSelectedRow();
    });
    this.deleteImageDialog.addEventListener('didHide', () => {
      this._uncheckSelectedRow();
    });
  }

  /**
   * Remove selected row in the environment list.
   *
   */
  _removeRow() {
    this.deleteAppRow.remove();
    this.deleteAppInfoDialog.hide();
    this.notification.text = _text('environment.AppInfoDeleted');
    this.notification.show();
  }

  /**
   * Check whether delete operation will proceed or not.
   *
   * @param {any} e - Dispatches from the native input event each time the input changes.
   */
  _checkDeleteAppInfo(e) {
    // htmlCollection should be converted to Array.
    this.deleteAppRow = e.target.parentNode;
    const childRow = this.deleteAppRow.children;
    const textfieldsArray = [...childRow];
    const appInfo = textfieldsArray
      .filter((item) => item.tagName === 'MWC-TEXTFIELD')
      .map((item) => item.value);
    // if every value of the row is empty
    if (appInfo.filter((item) => item === '')?.length === appInfo.length) {
      this._removeRow();
    } else {
      this.deleteAppInfo = appInfo;
      this.deleteAppInfoDialog.show();
    }
  }

  /**
   * Deselect the selected row from the environment list.
   */
  _uncheckSelectedRow() {
    // empty out selectedItem
    this._grid.selectedItems = [];
  }

  /**
   * Refresh the sorter.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _refreshSorter(e) {
    const sorter = e.target;
    const sorterPath = sorter.path.toString();
    if (sorter.direction) {
      if (sorter.direction === 'asc') {
        this._grid.items.sort((a, b) => {
          return a[sorterPath] < b[sorterPath]
            ? -1
            : a[sorterPath] > b[sorterPath]
              ? 1
              : 0;
        });
      } else {
        this._grid.items.sort((a, b) => {
          return a[sorterPath] > b[sorterPath]
            ? -1
            : a[sorterPath] < b[sorterPath]
              ? 1
              : 0;
        });
      }
    }
  }

  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
    }
  }

  /**
   * Get backend.ai client images.
   */
  _getImages() {
    this.listCondition = 'loading';
    this._listStatus?.show();
    globalThis.backendaiclient.domain
      .get(globalThis.backendaiclient._config.domainName, [
        'allowed_docker_registries',
      ])
      .then((response) => {
        this.allowed_registries = response.domain.allowed_docker_registries;
        return globalThis.backendaiclient.image.list(
          [
            'name',
            'tag',
            'registry',
            'architecture',
            'digest',
            'installed',
            'labels { key value }',
            'resource_limits { key min max }',
          ],
          false,
          true,
        );
      })
      .then((response) => {
        const images = response.images;
        const domainImages: Array<object> = [];
        images.forEach((image) => {
          if (
            'registry' in image &&
            this.allowed_registries.includes(image.registry)
          ) {
            const tags = image.tag.split('-');
            if (tags[1] !== undefined) {
              image.baseversion = tags[0];
              image.baseimage = tags[1];
              let additionalReq;
              let customizedNameLabel;
              if (tags[2] !== undefined) {
                additionalReq = this._humanizeName(
                  tags.slice(2, tags.indexOf('customized_')).join('-'),
                );
                customizedNameLabel = image.labels?.find(
                  (label) => label.key === 'ai.backend.customized-image.name',
                )?.value;
                image.constraint = [
                  additionalReq,
                  customizedNameLabel ?? undefined,
                ];
              }
            } else if (image.tag !== undefined) {
              image.baseversion = image.tag;
            } else {
              image.baseversion = '';
            }
            const names = image.name.split('/');
            if (names[1] !== undefined) {
              image.namespace = names[0];
              image.lang = names.slice(1).join('');
            } else {
              image.namespace = '';
              image.lang = names[0];
            }
            const langs = image.lang.split('-');
            let baseimage: Array<string>;
            if (image.baseimage !== undefined) {
              baseimage = [this._humanizeName(image.baseimage)];
            } else {
              baseimage = [];
            }
            if (langs[1] !== undefined) {
              if (langs[0] === 'r') {
                // Legacy handling for R images
                image.lang = langs[0];
                baseimage.push(this._humanizeName(langs[0]));
              } else {
                image.lang = langs[1];
                baseimage.push(this._humanizeName(langs[0]));
                // image.baseimage = this._humanizeName(image.baseimage) + ', ' + this._humanizeName(langs[0]);
              }
            }
            image.baseimage = baseimage; // this._humanizeName(image.baseimage);
            image.lang = this._humanizeName(image.lang);

            const resource_limit = image.resource_limits;
            resource_limit.forEach((resource) => {
              if (resource.max == 0) {
                resource.max = '∞';
              }
              if (resource.key == 'cuda.device') {
                resource.key = 'cuda_device';
              }
              if (resource.key == 'cuda.shares') {
                resource.key = 'cuda_shares';
              }
              if (resource.key == 'rocm.device') {
                resource.key = 'rocm_device';
              }
              if (resource.key == 'tpu.device') {
                resource.key = 'tpu_device';
              }
              if (resource.key == 'ipu.device') {
                resource.key = 'ipu_device';
              }
              if (resource.key == 'atom.device') {
                resource.key = 'atom_device';
              }
              if (resource.key == 'atom.device+') {
                resource.key = 'atom_device_plus';
              }
              if (resource.key == 'warboy.device') {
                resource.key = 'warboy_device';
              }
              if (resource.key == 'hyperaccel-lpu.device') {
                resource.key = 'hyperaccel_lpu_device';
              }
              if (resource.min !== null && resource.min !== undefined) {
                image[resource.key + '_limit_min'] = this._addUnit(
                  resource.min,
                );
              }
              if (resource.max !== null && resource.max !== undefined) {
                image[resource.key + '_limit_max'] = this._addUnit(
                  resource.max,
                );
              } else {
                image[resource.key + '_limit_max'] = Infinity;
              }
            });
            image.labels = image.labels.reduce(
              (acc, cur) => ({ ...acc, [cur.key]: cur.value }),
              {},
            );
            domainImages.push(image);
          }
        });
        // let image_keys = Object.keys(domainImages);
        // console.log(image_keys);
        // let sorted_images = {};
        // image_keys.sort();
        const sortedImages = domainImages.sort(
          (a, b) => b['installed'] - a['installed'],
        );

        this.images = sortedImages;
        if (this.images.length == 0) {
          this.listCondition = 'no-data';
        } else {
          this._listStatus?.hide();
        }
      })
      .catch((err) => {
        console.log(err);
        if (typeof err.message !== 'undefined') {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
        } else {
          this.notification.text = PainKiller.relieve(
            'Problem occurred during image metadata loading.',
          );
        }
        this.notification.show(true, err);
        this._listStatus?.hide();
      });
  }

  /**
   * Add unit to the value.
   *
   * @param {string} value
   * @return {string} value with proper unit
   */
  _addUnit(value) {
    const unit = value.substr(-1);
    if (unit == 'm') {
      return value.slice(0, -1) + 'MiB';
    }
    if (unit == 'g') {
      return value.slice(0, -1) + 'GiB';
    }
    if (unit == 't') {
      return value.slice(0, -1) + 'TiB';
    }
    return value;
  }

  /**
   * Change unit to symbol.
   *
   * @param {string} value
   * @return {string} value with proper unit
   */
  _symbolicUnit(value) {
    const unit = value.substr(-2);
    if (unit == 'MB') {
      return value.slice(0, -2) + 'm';
    }
    if (unit == 'GB') {
      return value.slice(0, -2) + 'g';
    }
    if (unit == 'TB') {
      return value.slice(0, -2) + 't';
    }
    return value;
  }

  /**
   * Humanize the value.
   *
   * @param {string} value - Language name, version, environment or identifier
   * @return {string} Humanized value for value
   */
  _humanizeName(value) {
    this.alias = this.resourceBroker.imageTagAlias;
    const tagReplace = this.resourceBroker.imageTagReplace;
    for (const [key, replaceString] of Object.entries(tagReplace)) {
      const pattern = new RegExp(key);
      if (pattern.test(value)) {
        return value.replace(pattern, replaceString);
      }
    }
    if (value in this.alias) {
      return this.alias[value];
    } else {
      return value;
    }
  }

  /**
   * If value includes unlimited contents, mark as unlimited.
   *
   * @param {string} value - string value
   * @return {string} ∞ when value contains -, 0, 'Unlimited', Infinity, 'Infinity'
   */
  _markIfUnlimited(value: string) {
    if (['-', 0, 'Unlimited', Infinity, 'Infinity'].includes(value)) {
      return '∞';
    } else {
      return value;
    }
  }

  /**
   * Hide a dialog by id.
   *
   * @param {string} id - Dialog component ID
   * @return {void}
   */
  _hideDialogById(id: string) {
    return (this.shadowRoot?.querySelector(id) as BackendAIDialog).hide();
  }

  /**
   * Display a dialog by id.
   *
   * @param {string} id - Dialog component ID
   * @return {void}
   */
  _launchDialogById(id: string) {
    return (this.shadowRoot?.querySelector(id) as BackendAIDialog).show();
  }

  /**
   * Open the selected image.
   *
   */
  openInstallImageDialog() {
    // select only uninstalled images
    this.selectedImages = this._grid.selectedItems.filter(
      (images: any): boolean => {
        return !images.installed;
      },
    );
    this.installImageNameList = this.selectedImages.map(
      (image: object): string => {
        // remove whitespace
        Object.keys(image).map((elem) => {
          if (['registry', 'name', 'tag'].includes(elem) && elem in image) {
            image[elem] = image[elem].replace(/\s/g, '');
          }
        });

        return image['registry'] + '/' + image['name'] + ':' + image['tag'];
      },
    );

    // show dialog only if selected image exists and uninstalled
    if (this.selectedImages.length > 0) {
      this.installImageDialog.show();
    } else {
      this.notification.text = _text(
        'environment.SelectedImagesAlreadyInstalled',
      );
      this.notification.show();
    }
  }

  _installImage() {
    this.installImageDialog.hide();
    this.selectedImages.forEach(async (image: object): Promise<void> => {
      // make image installing status visible
      const selectedImageLabel =
        '[id="' +
        image['registry'].replace(/\./gi, '-') +
        '-' +
        image['name'].replace('/', '-') +
        '-' +
        image['tag'].replace(/\./gi, '-') +
        '"]';
      this._grid
        .querySelector(selectedImageLabel)
        .setAttribute('style', 'display:block;');
      const imageName =
        image['registry'] + '/' + image['name'] + ':' + image['tag'];
      let isGPURequired = false;
      const imageResource = Object();
      if ('resource_limits' in image) {
        (image['resource_limits'] as Array<any>).forEach((el) => {
          imageResource[el['key'].replace('_', '.')] = el.min;
        });
      }

      if ('cuda.device' in imageResource && 'cuda.shares' in imageResource) {
        isGPURequired = true;
        imageResource['gpu'] = 0;
        imageResource['fgpu'] = imageResource['cuda.shares'];
      } else if ('cuda.device' in imageResource) {
        imageResource['gpu'] = imageResource['cuda.device'];
        isGPURequired = true;
      } else {
        isGPURequired = false;
      }

      // Add 256m to run the image.
      if (imageResource['mem'].endsWith('g')) {
        imageResource['mem'] = imageResource['mem'].replace('g', '.5g');
      } else if (imageResource['mem'].endsWith('m')) {
        imageResource['mem'] =
          Number(imageResource['mem'].slice(0, -1)) + 256 + 'm';
      }

      imageResource['domain'] = globalThis.backendaiclient._config.domainName;
      imageResource['group_name'] = globalThis.backendaiclient.current_group;

      const resourceSlots =
        await globalThis.backendaiclient.get_resource_slots();

      if (isGPURequired) {
        if (
          !('cuda.device' in resourceSlots) &&
          !('cuda.shares' in resourceSlots)
        ) {
          delete imageResource['gpu'];
          delete imageResource['fgpu'];
          delete imageResource['cuda.shares'];
          delete imageResource['cuda.device'];
        }
      }

      if ('cuda.device' in resourceSlots && 'cuda.shares' in resourceSlots) {
        // Can be possible after 20.03
        if ('fgpu' in imageResource && 'gpu' in imageResource) {
          // Keep fgpu only.
          delete imageResource['gpu'];
          delete imageResource['cuda.device'];
        }
      } else if ('cuda.device' in resourceSlots) {
        // GPU mode
        delete imageResource['fgpu'];
        delete imageResource['cuda.shares'];
      } else if ('cuda.shares' in resourceSlots) {
        // Fractional GPU mode
        delete imageResource['gpu'];
        delete imageResource['cuda.device'];
      }

      // Return immediately after enqueueing the session. Usually, image
      // pulling takes a long time so it is not appropriate to wait for
      // the job completion.
      imageResource.enqueueOnly = true;
      imageResource.type = 'batch';
      imageResource.startupCommand = 'echo "Image is installed"';

      this.notification.text =
        _text('environment.InstallingImage') +
        imageName +
        _text('environment.TakesTime');
      this.notification.show();
      const indicator = await this.indicator.start('indeterminate');
      indicator.set(10, _text('import.Downloading'));
      globalThis.backendaiclient.image
        .install(imageName, image['architecture'], imageResource)
        .then(() => {
          indicator.end(1000);
        })
        .catch((err) => {
          // if something goes wrong during installation
          this._grid.querySelector(selectedImageLabel).className = _text(
            'environment.Installing',
          );
          this._grid
            .querySelector(selectedImageLabel)
            .setAttribute('style', 'display:none;');

          this._uncheckSelectedRow();
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
          indicator.set(100, _t('environment.DescProblemOccurred'));
          indicator.end(1000);
        });
    });
  }

  /**
   * Open images to delete.
   *
   */
  openDeleteImageDialog() {
    // select only installed images
    this.selectedImages = this._grid.selectedItems.filter(
      (images: any): object => {
        return images.installed;
      },
    );
    this.deleteImageNameList = this.selectedImages.map(
      (image: object): string => {
        return image['registry'] + '/' + image['name'] + ':' + image['tag'];
      },
    );
    // show dialog only if selected image exists and installed
    if (this.selectedImages.length > 0) {
      this.deleteImageDialog.show();
    } else {
      this.notification.text = _text('environment.SelectedImagesNotInstalled');
      this.notification.show();
    }
  }

  _deleteImage() {
    /** TO DO: API function call to delete selected images */
  }

  /**
   * Decode backend.ai service ports.
   */
  _decodeServicePort() {
    if (
      this.modifiedImage?.labels?.['ai.backend.service-ports'] === '' ||
      this.modifiedImage?.labels?.['ai.backend.service-ports'] === undefined
    ) {
      this.servicePorts = [];
    } else {
      this.servicePorts = this.modifiedImage.labels['ai.backend.service-ports']
        .split(',')
        .map((e): { app: string; protocol: string; port: number } => {
          const sp = e.split(':');
          return {
            app: sp[0],
            protocol: sp[1],
            port: sp[2],
          };
        });
    }
  }

  /**
   * Render requirments such as cpu limit, memoty limit
   * cuda share limit, rocm device limit and tpu limit.
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  requirementsRenderer(root, column?, rowData?) {
    render(
      html`
        <div class="layout horizontal center flex">
          <div class="layout horizontal configuration">
            <mwc-icon class="fg green indicator">developer_board</mwc-icon>
            <span>${rowData.item.cpu_limit_min}</span>
            ~
            <span>${this._markIfUnlimited(rowData.item.cpu_limit_max)}</span>
            <span class="indicator">${_t('general.cores')}</span>
          </div>
        </div>
        <div class="layout horizontal center flex">
          <div class="layout horizontal configuration">
            <mwc-icon class="fg green indicator">memory</mwc-icon>
            <span>${rowData.item.mem_limit_min}</span>
            ~
            <span>${this._markIfUnlimited(rowData.item.mem_limit_max)}</span>
          </div>
        </div>
        ${rowData.item.cuda_device_limit_min
          ? html`
              <div class="layout horizontal center flex">
                <div class="layout horizontal configuration">
                  <img
                    class="indicator-icon fg green"
                    src="/resources/icons/file_type_cuda.svg"
                  />
                  <span>${rowData.item.cuda_device_limit_min}</span>
                  ~
                  <span>
                    ${this._markIfUnlimited(rowData.item.cuda_device_limit_max)}
                  </span>
                  <span class="indicator">CUDA GPU</span>
                </div>
              </div>
            `
          : html``}
        ${rowData.item.cuda_shares_limit_min
          ? html`
              <div class="layout horizontal center flex">
                <div class="layout horizontal configuration">
                  <mwc-icon class="fg green indicator">apps</mwc-icon>
                  <span>${rowData.item.cuda_shares_limit_min}</span>
                  ~
                  <span>
                    ${this._markIfUnlimited(rowData.item.cuda_shares_limit_max)}
                  </span>
                  <span class="indicator">CUDA FGPU</span>
                </div>
              </div>
            `
          : html``}
        ${rowData.item.rocm_device_limit_min
          ? html`
              <div class="layout horizontal center flex">
                <div class="layout horizontal configuration">
                  <img
                    class="indicator-icon fg green"
                    src="/resources/icons/rocm.svg"
                  />
                  <span>${rowData.item.rocm_device_limit_min}</span>
                  ~
                  <span>
                    ${this._markIfUnlimited(rowData.item.rocm_device_limit_max)}
                  </span>
                  <span class="indicator">ROCm GPU</span>
                </div>
              </div>
            `
          : html``}
        ${rowData.item.tpu_device_limit_min
          ? html`
              <div class="layout horizontal center flex">
                <div class="layout horizontal configuration">
                  <mwc-icon class="fg green indicator">view_module</mwc-icon>
                  <span>${rowData.item.tpu_device_limit_min}</span>
                  ~
                  <span>
                    ${this._markIfUnlimited(rowData.item.tpu_device_limit_max)}
                  </span>
                  <span class="indicator">TPU</span>
                </div>
              </div>
            `
          : html``}
        ${rowData.item.ipu_device_limit_min
          ? html`
              <div class="layout horizontal center flex">
                <div class="layout horizontal configuration">
                  <mwc-icon class="fg green indicator">view_module</mwc-icon>
                  <span>${rowData.item.ipu_device_limit_min}</span>
                  ~
                  <span>
                    ${this._markIfUnlimited(rowData.item.ipu_device_limit_max)}
                  </span>
                  <span class="indicator">IPU</span>
                </div>
              </div>
            `
          : html``}
        ${rowData.item.atom_device_limit_min
          ? html`
              <div class="layout horizontal center flex">
                <div class="layout horizontal configuration">
                  <img
                    class="indicator-icon fg green"
                    src="/resources/icons/rebel.svg"
                  />
                  <span>${rowData.item.atom_device_limit_min}</span>
                  ~
                  <span>
                    ${this._markIfUnlimited(rowData.item.atom_device_limit_max)}
                  </span>
                  <span class="indicator">ATOM</span>
                </div>
              </div>
            `
          : html``}
        ${rowData.item.gaudi2_device_limit_min
          ? html`
              <div class="layout horizontal center flex">
                <div class="layout horizontal configuration">
                  <img
                    class="indicator-icon fg green"
                    src="/resources/icons/gaudi.svg"
                  />
                  <span>${rowData.item.gaudi2_device_limit_min}</span>
                  ~
                  <span>
                    ${this._markIfUnlimited(
                      rowData.item.gaudi2_device_limit_max,
                    )}
                  </span>
                  <span class="indicator">Gaudi 2</span>
                </div>
              </div>
            `
          : html``}
        ${rowData.item.atom_plus_device_limit_min
          ? html`
              <div class="layout horizontal center flex">
                <div class="layout horizontal configuration">
                  <img
                    class="indicator-icon fg green"
                    src="/resources/icons/rebel.svg"
                  />
                  <span>${rowData.item.atom_plus_device_limit_min}</span>
                  ~
                  <span>
                    ${this._markIfUnlimited(
                      rowData.item.atom_plus_device_limit_max,
                    )}
                  </span>
                  <span class="indicator">ATOM+</span>
                </div>
              </div>
            `
          : html``}
        ${rowData.item.warboy_device_limit_min
          ? html`
              <div class="layout horizontal center flex">
                <div class="layout horizontal configuration">
                  <img
                    class="indicator-icon fg green"
                    src="/resources/icons/furiosa.svg"
                  />
                  <span>${rowData.item.warboy_device_limit_min}</span>
                  ~
                  <span>
                    ${this._markIfUnlimited(
                      rowData.item.warboy_device_limit_max,
                    )}
                  </span>
                  <span class="indicator">Warboy</span>
                </div>
              </div>
            `
          : html``}
        ${rowData.item.hyperaccel_lpu_device_limit_min
          ? html`
              <div class="layout horizontal center flex">
                <div class="layout horizontal configuration">
                  <img
                    class="indicator-icon fg green"
                    src="/resources/icons/npu_generic.svg"
                  />
                  <span>${rowData.item.hyperaccel_lpu_device_limit_min}</span>
                  ~
                  <span>
                    ${this._markIfUnlimited(
                      rowData.item.hyperaccel_lpu_device_limit_max,
                    )}
                  </span>
                  <span class="indicator">Hyperaccel LPU</span>
                </div>
              </div>
            `
          : html``}
      `,
      root,
    );
  }

  /**
   * Render controllers.
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  controlsRenderer(root, column?, rowData?) {
    render(
      html`
        <div id="controls" class="layout horizontal flex center">
          <mwc-icon-button
            class="fg controls-running blue"
            icon="settings"
            @click=${() => {
              this.modifiedImage = rowData.item;
              this.openManageImageResourceModal = true;
              this.requestUpdate();
            }}
          ></mwc-icon-button>
          <mwc-icon-button
            class="fg controls-running pink"
            icon="apps"
            @click=${() => {
              this.modifiedImage = rowData.item;
              this._decodeServicePort();
              this.openManageAppModal = true;
              this.requestUpdate();
            }}
          ></mwc-icon-button>
        </div>
      `,
      root,
    );
  }

  /**
   * Render an installed tag for each image.
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  installRenderer(root, column, rowData) {
    render(
      // language=HTML
      html`
        <div class="layout horizontal center center-justified">
          ${rowData.item.installed
            ? html`
                <lablup-shields
                  class="installed"
                  description="${_t('environment.Installed')}"
                  color="darkgreen"
                  id="${rowData.item.registry.replace(/\./gi, '-') +
                  '-' +
                  rowData.item.name.replace('/', '-') +
                  '-' +
                  rowData.item.tag.replace(/\./gi, '-')}"
                ></lablup-shields>
              `
            : html`
                <lablup-shields
                  class="installing"
                  description="${_t('environment.Installing')}"
                  color="green"
                  id="${rowData.item.registry.replace(/\./gi, '-') +
                  '-' +
                  rowData.item.name.replace('/', '-') +
                  '-' +
                  rowData.item.tag.replace(/\./gi, '-')}"
                  style="display:none"
                ></lablup-shields>
              `}
        </div>
      `,
      root,
    );
  }

  /**
   *
   * Render an base image label for each image
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  baseImageRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        ${rowData.item.baseimage.map(
          (image) => html`
            <lablup-shields
              app=""
              color="blue"
              ui="round"
              description="${image}"
            ></lablup-shields>
          `,
        )}
      `,
      root,
    );
  }

  /**
   *
   * Render an constraint for each image
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  constraintRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        ${rowData.item.constraint
          ? html`
              <lablup-shields
                app=""
                color="green"
                ui="round"
                description="${rowData.item.constraint[0]}"
              ></lablup-shields>
              ${rowData.item.constraint?.[1] !== undefined
                ? html`
                    <lablup-shields
                      app="Customized"
                      color="cyan"
                      ui="round"
                      description="${rowData.item.constraint[1]}"
                    ></lablup-shields>
                  `
                : html``}
            `
          : html``}
      `,
      root,
    );
  }

  /**
   *
   * Render digest information for each image
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  digestRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout vertical">
          <span class="indicator monospace">${rowData.item.digest}</span>
        </div>
      `,
      root,
    );
  }

  render() {
    // language=HTML
    return html`
      <h4 class="horizontal flex center center-justified layout">
        <span>${_t('environment.Images')}</span>
        <span class="flex"></span>
        <mwc-button
          raised
          label="${_t('environment.Install')}"
          class="operation"
          id="install-image"
          icon="get_app"
          @click="${this.openInstallImageDialog}"
        ></mwc-button>
        <mwc-button
          disabled
          label="${_t('environment.Delete')}"
          class="operation temporarily-hide"
          id="delete-image"
          icon="delete"
          @click="${this.openDeleteImageDialog}"
        ></mwc-button>
      </h4>
      <div class="list-wrapper">
        <vaadin-grid
          theme="row-stripes column-borders compact dark"
          aria-label="Environments"
          id="testgrid"
          .items="${this.images}"
        >
          <vaadin-grid-selection-column
            frozen
            flex-grow="0"
            text-align="center"
            auto-select
          ></vaadin-grid-selection-column>
          <vaadin-grid-sort-column
            path="installed"
            flex-grow="0"
            header="${_t('environment.Status')}"
            .renderer="${this._boundInstallRenderer}"
          ></vaadin-grid-sort-column>
          <lablup-grid-sort-filter-column
            path="registry"
            width="80px"
            resizable
            header="${_t('environment.Registry')}"
          ></lablup-grid-sort-filter-column>
          <lablup-grid-sort-filter-column
            path="architecture"
            width="80px"
            resizable
            header="${_t('environment.Architecture')}"
          ></lablup-grid-sort-filter-column>
          <lablup-grid-sort-filter-column
            path="namespace"
            width="60px"
            resizable
            header="${_t('environment.Namespace')}"
          ></lablup-grid-sort-filter-column>
          <lablup-grid-sort-filter-column
            path="lang"
            resizable
            header="${_t('environment.Language')}"
          ></lablup-grid-sort-filter-column>
          <lablup-grid-sort-filter-column
            path="baseversion"
            resizable
            header="${_t('environment.Version')}"
          ></lablup-grid-sort-filter-column>
          <lablup-grid-sort-filter-column
            path="baseimage"
            resizable
            width="110px"
            header="${_t('environment.Base')}"
            .renderer="${this._boundBaseImageRenderer}"
          ></lablup-grid-sort-filter-column>
          <lablup-grid-sort-filter-column
            path="constraint"
            width="50px"
            resizable
            header="${_t('environment.Constraint')}"
            .renderer="${this._boundConstraintRenderer}"
          ></lablup-grid-sort-filter-column>
          <lablup-grid-sort-filter-column
            path="digest"
            resizable
            header="${_t('environment.Digest')}"
            .renderer="${this._boundDigestRenderer}"
          ></lablup-grid-sort-filter-column>
          <vaadin-grid-column
            width="150px"
            flex-grow="0"
            resizable
            header="${_t('environment.ResourceLimit')}"
            .renderer="${this._boundRequirementsRenderer}"
          ></vaadin-grid-column>
          <vaadin-grid-column
            frozen-to-end
            width="110px"
            resizable
            header="${_t('general.Control')}"
            .renderer=${this._boundControlsRenderer}
          ></vaadin-grid-column>
        </vaadin-grid>
        <backend-ai-list-status
          id="list-status"
          statusCondition="${this.listCondition}"
          message="${_text('environment.NoImageToDisplay')}"
        ></backend-ai-list-status>
      </div>
      <backend-ai-dialog id="install-image-dialog" fixed backdrop persistent>
        <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
        <div slot="content">
          <p>${_t('environment.DescDownloadImage')}</p>
          <p style="margin:auto; ">
            <span style="color:blue;">
              ${this.installImageNameList.map((el) => {
                return html`
                  ${el}
                  <br />
                `;
              })}
            </span>
          </p>
          <p>
            ${_t('environment.DescSignificantDownloadTime')}
            ${_t('dialog.ask.DoYouWantToProceed')}
          </p>
        </div>
        <div slot="footer" class="horizontal flex layout">
          <div class="flex"></div>
          <mwc-button
            class="operation"
            label="${_t('button.Cancel')}"
            @click="${(e) => {
              this._hideDialog(e);
              this._uncheckSelectedRow();
            }}"
          ></mwc-button>
          <mwc-button
            unelevated
            class="operation"
            label="${_t('button.Okay')}"
            @click="${() => this._installImage()}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="delete-image-dialog" fixed backdrop persistent>
        <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
        <div slot="content">
          <p>${_t('environment.DescDeleteImage')}</p>
          <p style="margin:auto; ">
            <span style="color:blue;">
              ${this.deleteImageNameList.map((el) => {
                return html`
                  ${el}
                  <br />
                `;
              })}
            </span>
          </p>
          <p>${_t('dialog.ask.DoYouWantToProceed')}</p>
        </div>
        <div slot="footer" class="horizontal flex layout">
          <div class="flex"></div>
          <mwc-button
            class="operation"
            label="${_t('button.Cancel')}"
            @click="${(e) => {
              this._hideDialog(e);
              this._uncheckSelectedRow();
            }}"
          ></mwc-button>
          <mwc-button
            unelevated
            class="operation"
            label="${_t('button.Okay')}"
            @click="${() => this._deleteImage()}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="delete-app-info-dialog" fixed backdrop persistent>
        <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
        <div slot="content">
          <p>${_t('environment.DescDeleteAppInfo')}</p>
          <div class="horizontal layout">
            <p>${_t('environment.AppName')}</p>
            <p style="color:blue;">: ${this.deleteAppInfo[0]}</p>
          </div>
          <div class="horizontal layout">
            <p>${_t('environment.Protocol')}</p>
            <p style="color:blue;">: ${this.deleteAppInfo[1]}</p>
          </div>
          <div class="horizontal layout">
            <p>${_t('environment.Port')}</p>
            <p style="color:blue;">: ${this.deleteAppInfo[2]}</p>
          </div>
          <p>${_t('dialog.ask.DoYouWantToProceed')}</p>
        </div>
        <div slot="footer" class="horizontal flex layout">
          <div class="flex"></div>
          <mwc-button
            class="operation"
            label="${_t('button.Cancel')}"
            @click="${(e) => this._hideDialog(e)}"
          ></mwc-button>
          <mwc-button
            unelevated
            class="operation"
            label="${_t('button.Okay')}"
            @click="${() => this._removeRow()}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-react-manage-app-dialog
        value="${JSON.stringify({
          image: this.modifiedImage,
          servicePorts: this.servicePorts,
          open: this.openManageAppModal,
        })}"
        @cancel="${() => (this.openManageAppModal = false)}"
        @ok="${() => ((this.openManageAppModal = false), this._getImages())}"
      ></backend-ai-react-manage-app-dialog>
      <backend-ai-react-manage-resource-dialog
        value="${JSON.stringify({
          image: this.modifiedImage,
          open: this.openManageImageResourceModal,
        })}"
        @cancel="${() => (this.openManageImageResourceModal = false)}"
        @ok="${() => (
          (this.openManageImageResourceModal = false), this._getImages()
        )}"
      ></backend-ai-react-manage-resource-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-environment-list': BackendAIEnvironmentList;
  }
}
