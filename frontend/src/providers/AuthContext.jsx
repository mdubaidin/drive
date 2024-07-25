import React from 'react';
import Navbar from '../layout/Navbar';
import AuthOutlet from '@auth-kit/react-router/AuthOutlet';
import ThemeProvider from '../theme';

const AuthContext = () => {
    return (
        <ThemeProvider>
            <Navbar>
                <AuthOutlet fallbackPath='/auth/sign-in' />
            </Navbar>
        </ThemeProvider>
    );
};

export default AuthContext;
