// SuperAdmin Authentication Utilities

export interface SuperAdminSession {
    user: {
        email: string;
        name: string;
        role: 'superadmin';
    };
    token: string;
    expiresAt: number;
}

const STORAGE_KEY = 'superadmin_session';

/**
 * Check if user is authenticated as SuperAdmin
 */
export const isSuperAdminAuthenticated = (): boolean => {
    try {
        const sessionStr = localStorage.getItem(STORAGE_KEY);
        if (!sessionStr) return false;

        const session: SuperAdminSession = JSON.parse(sessionStr);

        // Check if session is expired
        if (Date.now() > session.expiresAt) {
            clearSuperAdminSession();
            return false;
        }

        return session.user.role === 'superadmin';
    } catch (error) {
        console.error('Error checking SuperAdmin auth:', error);
        return false;
    }
};

/**
 * Get current SuperAdmin session
 */
export const getSuperAdminSession = (): SuperAdminSession | null => {
    try {
        const sessionStr = localStorage.getItem(STORAGE_KEY);
        if (!sessionStr) return null;

        const session: SuperAdminSession = JSON.parse(sessionStr);

        // Check if session is expired
        if (Date.now() > session.expiresAt) {
            clearSuperAdminSession();
            return null;
        }

        return session;
    } catch (error) {
        console.error('Error getting SuperAdmin session:', error);
        return null;
    }
};

/**
 * Clear SuperAdmin session
 */
export const clearSuperAdminSession = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};

/**
 * Logout SuperAdmin
 */
export const logoutSuperAdmin = (): void => {
    clearSuperAdminSession();
    window.location.href = '/superadmin3537/login';
};
