export type ViewerRole = 'superadmin' | 'admin' | 'user' | 'monitor';
export declare const resolveViewerRole: (v2Role: string | null | undefined) => ViewerRole | null;
declare const useViewer: () => {
    userRole: ViewerRole | null;
};
export default useViewer;
