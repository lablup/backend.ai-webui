declare const useViewer: () => {
    viewer: {
        readonly encoded_user_role: string | null | undefined;
        readonly user: {
            readonly email: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    decodedUserRole: string | null;
};
export default useViewer;
