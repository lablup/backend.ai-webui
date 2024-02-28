import { BackendAiStyles } from '../../components/backend-ai-general-styles';
import { css } from 'lit';

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

    mwc-icon-button {
      color: var(--general-button-background-color);
    }

    mwc-tab-bar.modal {
      --mdc-theme-primary: #37b276;
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
  `,
];
