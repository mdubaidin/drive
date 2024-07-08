import React, { createContext, useContext, useEffect, useState } from 'react';
import Loading from '../components/Loading';
import { getCookie } from '../utils/cookies';
import { env } from '../utils/function';
import axios from 'axios';
// import Setup from '../components/Setup';

const authorizeContext = createContext();

const authServer = axios.create({
    baseURL: env('AUTHENTICATION_SERVER'),
});

const accessToken = getCookie('accessToken');
authServer.defaults.withCredentials = false;
authServer.defaults.headers.Authorization = `Bearer ${accessToken}`;

const AuthorizationProvider = ({ children }) => {
    const [content, setContent] = useState(<Loading message='Please wait, logging you in...' />);
    const [user, setUser] = useState({});

    const authorize = async (loggedIn, cb) => {
        if (loggedIn) {
            // const isSetupCompleted = await checkSetup();

            setContent(children);
        } else {
            const redirectTo =
                env('AUTHENTICATION_CLIENT') +
                '/login?redirectto=' +
                encodeURIComponent(window.location.href);
            console.log(redirectTo);
            setContent(
                <Loading
                    message='Please wait, redirecting you to Clikkle Accounts'
                    redirectTo={redirectTo}
                />
            );
        }
        if (typeof cb === 'function') cb(setUser);
    };

    // function stringToBoolean(str) {
    //     return str === 'true';
    // }

    // async function checkSetup() {
    //     const setup = stringToBoolean(getCookie('setupCompleted'));

    //     if (setup) return true;
    //     try {
    //         const res = await axios.get('/setup');
    //         const isSetupCompleted = Boolean(res.data.setup);
    //         setCookie('setupCompleted', isSetupCompleted);
    //         return isSetupCompleted;
    //     } catch (e) {
    //         handleAxiosError(e, showError);
    //     }
    // }

    useEffect(() => {
        (async () => {
            try {
                const role = getCookie('role');
                if (!role) throw new Error('role not found');
                const response = await authServer.get(`/${role}/profile`);
                const user = response.data.user;

                authorize(true, setUser => setUser(user));
            } catch (err) {
                console.log(err);
                authorize(false);
            }
        })();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <authorizeContext.Provider value={{ authorize, setUser, user, setContent }}>
            {content}
        </authorizeContext.Provider>
    );
};

const useAuthorize = () => useContext(authorizeContext).authorize;
const useUser = () => useContext(authorizeContext)?.user;
const useSetUser = () => useContext(authorizeContext).setUser;
const useSetContent = () => useContext(authorizeContext).setContent;

export default AuthorizationProvider;
export { useAuthorize, useUser, useSetUser, useSetContent };
