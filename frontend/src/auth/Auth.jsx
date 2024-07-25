import React, { useEffect } from 'react';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const Auth = () => {
    const isAuthenticated = useIsAuthenticated();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        if (isAuthenticated && pathname.includes('auth')) {
            return window.history.go(1);
        }

        navigate('/auth/sign-in');
    }, [isAuthenticated, pathname, navigate]);

    return isAuthenticated ? null : <Outlet />;
};

export default Auth;
