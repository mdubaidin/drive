import React, { createContext, useCallback, useContext } from 'react';
import useSnack from '../hooks/useSnack';
import ThemeProvider from './../theme';
import AuthProvider from './AuthProvider';

const ProviderContext = createContext();

const Provider = ({ children }) => {
    const { SnackBar, showMessage } = useSnack();

    return (
        <ThemeProvider>
            <ProviderContext.Provider value={{ showMessage }}>
                <AuthProvider>
                    {children}
                    {SnackBar}
                </AuthProvider>
            </ProviderContext.Provider>
        </ThemeProvider>
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
