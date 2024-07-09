import React from 'react';
import Navbar from '../layout/Navbar';
import AuthOutlet from '@auth-kit/react-router/AuthOutlet';

const AuthRouter = () => {
    return (
        <Navbar>
            <AuthOutlet fallbackPath='/auth/sign-in' />
        </Navbar>
    );
};

export default AuthRouter;
