import { SizeUnit } from '../helper';
interface BAINumberWithUnitProps {
    numberUnit: string;
    targetUnit: SizeUnit;
    unitType: 'binary' | 'decimal';
    postfix?: string;
    /**
     * Optional reference value rendered after the number as `number / compared`,
     * sharing the single trailing unit. The `/ compared` part is rendered in the
     * muted (secondary) text color — same as the unit — so it reads as a
     * reference next to the primary number.
     */
    comparedValue?: string;
}
declare const BAINumberWithUnit: ({ numberUnit, targetUnit, unitType, postfix, comparedValue, }: BAINumberWithUnitProps) => import("react").JSX.Element;
export default BAINumberWithUnit;
