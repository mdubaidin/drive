import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import PageLoading from '../components/PageLoading';
import AuthProvider from '../providers/AuthProvider';
import { ThemeProvider } from '@mui/material';
import theme from '../theme/views';

const Index = () => {
    const [access, setAccess] = useState(false);
    const [loading, setLoading] = useState(true);

    const { id } = useParams();

    const validateAccess = useCallback(async () => {
        try {
            const response = await axios.get(`/open/validate/${id}`);
            setAccess(response.data.access);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        validateAccess();
    }, [validateAccess]);

    return (
        <ThemeProvider theme={theme}>
            <PageLoading condition={!loading} height='100dvh'>
                {access ? (
                    <Outlet context={access} />
                ) : (
                    <AuthProvider>
                        <Outlet context={access} />
                    </AuthProvider>
                )}
            </PageLoading>
        </ThemeProvider>
    );
};

export default Index;
