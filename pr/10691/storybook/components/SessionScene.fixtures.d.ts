import { BAICrowdFigure, BAICrowdFigureMood, BAICrowdFinder, BAICrowdZone } from './SessionSceneParts';
export declare const ZONES: BAICrowdZone[];
interface MockSession {
    id: string;
    name: string;
    owner: string;
    agent: string;
    status: 'RUNNING' | 'PENDING' | 'TERMINATING';
    util: number;
    idleMinutes: number;
    pendingMinutes: number;
    /** Share of its agent's capacity; null = not measured yet. */
    share: number | null;
}
export declare const moodFor: (s: MockSession) => BAICrowdFigureMood;
export declare const toFigure: (s: MockSession) => BAICrowdFigure;
export declare const SESSIONS: MockSession[];
export declare const FINDERS: BAICrowdFinder[];
export {};
