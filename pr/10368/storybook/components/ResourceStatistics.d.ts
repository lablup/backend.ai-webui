import { BAIStatisticProps } from './BAIStatistic';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
interface ResourceData {
    cpu: {
        used: {
            current: number;
            total?: number;
        };
        free: {
            current: number;
            total?: number;
        };
        metadata: {
            title: string;
            displayUnit: string;
        };
    } | null;
    memory: {
        used: {
            current: number;
            total?: number;
        };
        free: {
            current: number;
            total?: number;
        };
        metadata: {
            title: string;
            displayUnit: string;
        };
    } | null;
    accelerators: Array<{
        key: string;
        used: {
            current: number;
            total?: number;
        };
        free: {
            current: number;
            total?: number;
        };
        metadata: {
            title: string;
            displayUnit: string;
        };
    }>;
}
interface ResourceStatisticsProps {
    resourceData: ResourceData;
    displayType: 'used' | 'free';
    progressMode?: BAIStatisticProps['progressMode'];
    precision?: number;
    progressSteps?: number;
}
export declare const processMemoryValue: (value: any, displayUnit: string) => number;
export declare const convertToNumber: (value: any) => number;
declare const ResourceStatistics: React.FC<ResourceStatisticsProps>;
export default ResourceStatistics;
