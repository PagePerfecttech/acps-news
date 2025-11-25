// Stub file - imgbb service is not used
export const uploadToImgbb = async () => {
    throw new Error('Imgbb service is not configured');
};

export const isImgBBConfigured = (): boolean => {
    return false; // ImgBB is not configured in this app
};

export const uploadImage = async (_file: File, _fileName?: string): Promise<{ url: string | null; error: string | null }> => {
    return {
        url: null,
        error: 'ImgBB service is not configured'
    };
};

const imgbbService = {
    uploadToImgbb,
    isImgBBConfigured,
    uploadImage
};

export default imgbbService;
