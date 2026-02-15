/**
 * Generates an optimized Cloudinary URL with f_auto and q_auto.
 * 
 * @param {string} urlOrPath - The full Cloudinary URL or a relative path/public ID.
 * @param {number|string} [width='auto'] - Optional width for resizing (e.g., 800 or 'auto').
 * @returns {string} The optimized URL.
 */
export const getOptimizedImageUrl = (urlOrPath, width = 'auto') => {
    if (!urlOrPath) return '';

    const CLOUD_NAME = 'dktiuq3jr'; // Based on existing code usage
    const UPLOAD_PREFIX = '/image/upload/';
    const OPTIMIZATIONS = `f_auto,q_auto${width !== 'auto' ? `,w_${width}` : ''}`;
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

    // Case 1: URLs (S3 or external)
    if (urlOrPath.startsWith('http')) {
        return urlOrPath;
    }

    // Case 3: Local uploads or other URLs (fallback)
    if (urlOrPath.startsWith('http')) {
        return urlOrPath;
    }

    // Case 4: Local backend uploads (fallback for non-Cloudinary)
    return `${BACKEND_URL}/api/uploads/${urlOrPath}`;
};
