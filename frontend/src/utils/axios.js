import axios from 'axios';
import { getCookie } from './cookies';
import { env } from './function';

axios.defaults.baseURL = env('SERVER');
axios.defaults.withCredentials = true;

console.log(env('SERVER'));

axios.interceptors.request.use(function (config) {
    const accessToken = getCookie('accessToken');
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
});

const authApi = axios.create({
    baseURL: env('SERVER') + '/auth',
});

authApi.interceptors.request.use(function (config) {
    config.headers.Authorization = process.env.REACT_APP_API_KEY;
    return config;
});

export { authApi };
