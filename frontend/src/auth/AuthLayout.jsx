import { Box, Card, createTheme, ThemeProvider } from '@mui/material';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

const theme = createTheme({
    palette: {
        primary: {
            main: '#141414',
        },
        secondary: {
            main: '#FFC107',
        },
        error: {
            main: '#F44336',
        },
        text: {
            title: 'linear-gradient(56deg, rgba(43, 46, 224, 0.15) 0%,rgba(26, 218, 182, 0.15) 100%),linear-gradient(336deg, rgb(50, 52, 221),rgb(60, 239, 241))',
        },
        background: {
            default: '#F2F2F2',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    marginBottom: '16px',
                },
            },
        },
    },
});

const AuthLayout = () => {
    const [isValid, setIsValid] = useState(true);

    return isValid ? (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    background: '#F2F2F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'flex-start', sm: 'center' },
                    minHeight: '100vh',
                    flexDirection: 'column',
                }}>
                <Card
                    sx={{
                        p: 2,
                        width: { xs: '100%', sm: '448px', md: '980px' },
                        transition: 'all 0.2s',
                    }}
                    elevation={0}>
                    <Outlet context={{ isValid, setIsValid }} />
                </Card>
            </Box>
        </ThemeProvider>
    ) : (
        <Outlet context={{ isValid, setIsValid }} />
    );
};

export default AuthLayout;
