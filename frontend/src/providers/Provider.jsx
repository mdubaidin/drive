import React, { createContext, useCallback, useContext } from 'react';
import useSnack from '../hooks/useSnack';
import AuthProvider from './AuthProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';

const ProviderContext = createContext();

const Provider = ({ children }) => {
    const { SnackBar, showMessage } = useSnack();

    return (
        <ProviderContext.Provider value={{ showMessage }}>
            <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
                <AuthProvider>
                    {children}
                    {SnackBar}
                </AuthProvider>
            </GoogleOAuthProvider>
        </ProviderContext.Provider>
    );
};

const useMessage = () => {
    const showMessage = useContext(ProviderContext)?.showMessage;

    const showSuccess = useCallback(
        function (msg) {
            showMessage({ success: msg });
        },
        [showMessage]
    );

    const showError = useCallback(
        function (msg) {
            Array.isArray(msg)
                ? msg.forEach(msg => showMessage({ error: msg }))
                : showMessage({ error: msg });
        },
        [showMessage]
    );

    const showResponse = useCallback(
        function (msg, action) {
            showMessage({ response: msg, action });
        },
        [showMessage]
    );

    return { showError, showSuccess, showResponse };
};

// const useEventEmitter = () => {
//     const eventEmitter = useContext(HeaderContext).eventEmitter;
//     return eventEmitter;
// };

export default Provider;

export { useMessage, ProviderContext };
