import createRefresh from 'react-auth-kit/createRefresh';
import { authApi } from './axios';

const refresh = createRefresh({
    interval: 86400,
    refreshApiCallback: async param => {
        try {
            const response = await authApi.post('/refresh', param, {
                headers: { Authorization: `Bearer ${param.authToken}` },
            });
            console.log('Refreshing');

            return {
                isSuccess: true,
                newAuthToken: response.data.token,
                newAuthTokenExpireIn: 10,
                newRefreshTokenExpiresIn: 60,
            };
        } catch (error) {
            console.error(error);
            return {
                isSuccess: false,
            };
        }
    },
});

export default refresh;
