import React from 'react';
import ReactAuthProvider from 'react-auth-kit/AuthProvider';
import createStore from 'react-auth-kit/createStore';
import refresh from '../utils/refresh';

const AuthProvider = ({ children }) => {
    const store = createStore({
        authName: 'jwt-auth',
        authType: 'cookie',
        cookieDomain: window.location.hostname,
        cookieSecure: window.location.protocol === 'https',
        refresh,
    });

    return <ReactAuthProvider store={store}>{children}</ReactAuthProvider>;
};

export default AuthProvider;
