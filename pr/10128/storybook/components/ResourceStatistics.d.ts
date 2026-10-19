import { BAIStatisticProps } from './BAIStatistic';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
