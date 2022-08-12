import {css} from 'lit';

export const BackendAIPipelineStyles = [
  // language=CSS
  css`
    backend-ai-dialog.yaml {
      --component-width: 100%;
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