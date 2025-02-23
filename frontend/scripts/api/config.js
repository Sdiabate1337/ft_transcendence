// API Configuration
export const API_CONFIG = {
    BASE_URL: 'http://localhost:3000/api',  // Replace with your actual API URL
    OAUTH_42_URL: 'http://localhost:3000/api/auth/42/login',
    ENDPOINTS: {
        AUTH: {
            LOGIN_42: '/auth/42/callback',
            LOGIN_EMAIL: '/auth/login',
            REGISTER_EMAIL: '/auth/register',
            LOGOUT: '/auth/logout',
            REFRESH_TOKEN: '/auth/refresh',
            VERIFY_2FA: '/auth/2fa/verify',
            SETUP_2FA: '/auth/2fa/setup',
            DISABLE_2FA: '/auth/2fa/disable'
        },
        USER: {
            PROFILE: '/users/profile',
            UPDATE_PROFILE: '/users/profile/update',
            UPLOAD_AVATAR: '/users/profile/avatar',
            CHECK_DISPLAY_NAME: '/users/check-display-name',
            MATCH_HISTORY: '/users/matches',
            STATS: '/users/stats'
        },
        FRIENDS: {
            LIST: '/friends',
            ADD: '/friends/add',
            REMOVE: '/friends/remove',
            ACCEPT: '/friends/accept',
            REJECT: '/friends/reject',
            STATUS: '/friends/status'
        }
    },
    HEADERS: {
        'Content-Type': 'application/json'
    }
};
