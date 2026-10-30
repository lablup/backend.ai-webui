import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface AreaGridShape {
    rows: number;
    cols: number;
}
export interface AreaGridBounds {
    columns: number;
    totalCells: number;
    availableCells: number;
}
/** Whether every cell of the top-left-anchored rectangle is available. */
export declare const isAreaShapeAvailable: ({ rows, cols }: AreaGridShape, bounds: AreaGridBounds) => boolean;
/** The largest available rectangle whose area does not exceed `count`. */
export declare const areaShapeAtMost: (count: number, bounds: AreaGridBounds) => AreaGridShape | undefined;
/** The smallest available rectangle whose area reaches `count`. */
export declare const areaShapeAtLeast: (count: number, bounds: AreaGridBounds) => AreaGridShape | undefined;
/**
 * Clamps a requested rectangle into the grid: the largest available
 * rectangle inside it, and never below `minCells`.
 */
export declare const clampAreaShape: (shape: AreaGridShape, bounds: AreaGridBounds, minCells: number) => AreaGridShape | undefined;
export interface BAIResourceAreaGridProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'children' | 'color'> {
    /** Cells per row. */
    columns: number;
    /** Cells drawn, available or not. */
    totalCells: number;
    /** Cells that can be selected, counted in reading order. Defaults to `totalCells`. */
    availableCells?: number;
    /** The selection never covers fewer cells than this. */
    minCells?: number;
    /** Selected cell count. A count no rectangle expresses shows the largest rectangle below it. */
    value?: number;
    onChange?: (count: number) => void;
    /** Fill of the selected cells, a CSS colour or `var()`. */
    color?: string;
    disabled?: boolean;
}
declare const BAIResourceAreaGrid: React.FC<BAIResourceAreaGridProps>;
export default BAIResourceAreaGrid;
