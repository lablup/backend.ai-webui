import { BAISessionSceneBaseProps } from './SessionSceneParts';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export { crowdFigureMoods, type BAICrowdFigure, type BAICrowdFigureMood, type BAICrowdFinder, type BAICrowdZone, } from './SessionSceneParts';
export interface BAISessionCrowdSceneProps extends BAISessionSceneBaseProps {
    /** Integer pixel-art scale. Never fractional: the sprites would blur. */
    pixelScale?: 1 | 2;
}
declare const BAISessionCrowdScene: React.FC<BAISessionCrowdSceneProps>;
export default BAISessionCrowdScene;
