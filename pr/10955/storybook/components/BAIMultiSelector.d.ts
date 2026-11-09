import { MultiSelectorOptionType, MultiSelectorProps } from '@lablup/ui-common/MultiSelector';
export type BAIMultiSelectorProps<T extends MultiSelectorOptionType = MultiSelectorOptionType> = MultiSelectorProps<T>;
declare function BAIMultiSelector<T extends MultiSelectorOptionType = MultiSelectorOptionType>({ ref, value, defaultValue, onChange, onOpenChange, options, triggerDisplay, maxBadges, formatValue, renderTrigger, disabled, ...props }: BAIMultiSelectorProps<T>): import("react").JSX.Element;
export default BAIMultiSelector;
