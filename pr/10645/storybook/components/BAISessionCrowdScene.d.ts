import { BAISessionSceneBaseProps } from './SessionSceneParts';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export { crowdFigureMoods, type BAICrowdFigure, type BAICrowdFigureMood, type BAICrowdFinder, type BAICrowdZone, } from './SessionSceneParts';
export interface BAISessionCrowdSceneProps extends BAISessionSceneBaseProps {
    /** Integer pixel-art scale. Never fractional: the sprites would blur. */
    pixelScale?: 1 | 2;
}
declare const BAISessionCrowdScene: React.FC<BAISessionCrowdSceneProps>;
export default BAISessionCrowdScene;
