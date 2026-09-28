export interface PaginationInfoTextProps {
    start: number;
    end: number;
    total: number;
}
declare const BAIPaginationInfoText: ({ start, end, total, }: PaginationInfoTextProps) => string;
export default BAIPaginationInfoText;
