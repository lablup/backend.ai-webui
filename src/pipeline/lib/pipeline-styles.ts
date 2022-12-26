import {css} from 'lit';
import {BackendAiStyles} from '../../components/backend-ai-general-styles';


export const BackendAIPipelineStyles = [
  // language=CSS
  BackendAiStyles,
  css`
    .tab-content {
      width: 100%;
    }

    a.pipeline-link:hover {
      color: var(--general-textfield-selected-color);
    }

    backend-ai-dialog {
      --component-min-width: 390px;
      --component-max-width: 390px;
    }

    backend-ai-dialog.yaml {
      --component-width: 100%;
    }

    h3.tab {
      background-color: var(--general-tabbar-background-color);
      border-radius: 5px 5px 0px 0px;
      margin: 0px auto;
    }

    mwc-icon-button {
      color: var(--general-button-background-color);
    }

    mwc-tab-bar {
      --mdc-theme-primary: var(--general-sidebar-selected-color);
      --mdc-text-transform: none;
      --mdc-tab-color-default: var(--general-tabbar-background-color);
      --mdc-tab-text-label-color-default: var(--general-tabbar-tab-disabled-color);
    }

    mwc-tab-bar.modal {
      --mdc-theme-primary: #37B276;
    }

    /* Set width according to screen width (on mobile, tablet, and desktop) */
    @media screen and (max-width: 400px) {
      backend-ai-dialog.yaml {
        --component-width: 100%;
      }
    }

    @media screen and (min-width: 1024px) {
      backend-ai-dialog.yaml {
        --component-width: 70vw;
      }
    }
  `
]