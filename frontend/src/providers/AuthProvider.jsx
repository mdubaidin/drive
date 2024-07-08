import React from 'react';
import ReactAuthProvider from 'react-auth-kit/AuthProvider';
import createStore from 'react-auth-kit/createStore';

const AuthProvider = ({ children }) => {
    const store = createStore({
        authName: 'jwt-auth.access-token',
        authType: 'cookie',
        cookieDomain: window.location.hostname,
        cookieSecure: window.location.protocol === 'https:',
        refresh: true,
    });

    return <ReactAuthProvider store={store}>{children}</ReactAuthProvider>;
};

export default AuthProvider;
