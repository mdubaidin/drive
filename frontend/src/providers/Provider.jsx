import React, { createContext, useCallback, useContext } from 'react';
import useSnack from '../hooks/useSnack';
import ThemeContextProvider from './../theme';
import AuthProvider from './AuthProvider';
import Navbar from '../layout/Navbar';

const ProviderContext = createContext();

const Provider = ({ children }) => {
    const { SnackBar, showMessage } = useSnack();

    return (
        <ThemeContextProvider>
            <ProviderContext.Provider value={{ showMessage }}>
                <AuthProvider>
                    <Navbar>{children}</Navbar>
                    {SnackBar}
                </AuthProvider>
            </ProviderContext.Provider>
        </ThemeContextProvider>
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
