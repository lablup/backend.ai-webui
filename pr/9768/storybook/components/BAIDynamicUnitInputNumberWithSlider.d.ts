import { BAIDynamicUnitInputNumberProps } from './BAIDynamicUnitInputNumber';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/**
 * antd's `SliderMarks`, restated locally (the antd type import is what kept
 * this module in the antd import graph — P15).
 */
export type BAISliderMarks = Record<string | number, React.ReactNode | {
    style?: React.CSSProperties;
    label?: React.ReactNode;
}>;
export interface BAIDynamicUnitInputNumberWithSliderProps extends BAIDynamicUnitInputNumberProps {
    extraMarks?: BAISliderMarks;
    hideSlider?: boolean;
    warn?: string;
    step?: number;
    inputMinWidth?: number;
    addonPrefix?: React.ReactNode;
    addonSuffix?: React.ReactNode;
}
declare const BAIDynamicUnitInputNumberWithSlider: React.FC<BAIDynamicUnitInputNumberWithSliderProps>;
export default BAIDynamicUnitInputNumberWithSlider;
