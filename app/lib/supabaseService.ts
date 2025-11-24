// Stub file - Supabase service is no longer used
export const fetchNewsArticles = async () => [];
export const fetchAds = async () => [];
export const fetchAllComments = async () => [];
export const fetchDashboardStats = async () => ({
    totalArticles: 0,
    totalAds: 0,
    activeAds: 0,
    totalComments: 0,
    pendingComments: 0,
    totalLikes: 0
});
export const approveComment = async () => false;
export const deleteComment = async () => false;
export const subscribeToChanges = (..._args: any[]) => ({ unsubscribe: () => { } });
export const getNewsArticleById = async () => null;
export const getArticleStats = async () => ({ likes: 0, comments: 0, views: 0 });
export const addComment = async () => null;
