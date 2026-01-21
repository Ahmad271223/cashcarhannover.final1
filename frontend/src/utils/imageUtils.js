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

    // Case 1: Already a full Cloudinary URL
    if (urlOrPath.includes('cloudinary.com')) {
        // Check if already optimized (simple check)
        if (urlOrPath.includes('f_auto') && urlOrPath.includes('q_auto')) {
            return urlOrPath;
        }

        // Inject optimizations after /upload/
        if (urlOrPath.includes(UPLOAD_PREFIX)) {
            return urlOrPath.replace(UPLOAD_PREFIX, `${UPLOAD_PREFIX}${OPTIMIZATIONS}/`);
        }
        return urlOrPath;
    }

    // Case 2: Relative path stored in DB (e.g. "cashcar_uploads/xyz")
    if (urlOrPath.startsWith('cashcar_uploads/')) {
        return `https://res.cloudinary.com/${CLOUD_NAME}${UPLOAD_PREFIX}${OPTIMIZATIONS}/${urlOrPath}`;
    }

    // Case 3: Local uploads or other URLs (fallback)
    if (urlOrPath.startsWith('http')) {
        return urlOrPath;
    }

    // Case 4: Local backend uploads (fallback for non-Cloudinary)
    return `${BACKEND_URL}/api/uploads/${urlOrPath}`;
};
