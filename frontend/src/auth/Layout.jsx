import { Box, Card, createTheme, ThemeProvider } from '@mui/material';
import React from 'react';

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
                    'input::-webkit-outer-spin-button,\ninput::-webkit-inner-spin-button': {
                        WebkitAppearance: 'none',
                        margin: '0',
                    },
                },
            },
        },
    },
});

const Layout = ({ children }) => {
    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    background: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'flex-start', sm: 'center' },
                    minHeight: '100vh',
                    flexDirection: 'column',
                }}>
                <Card
                    sx={{
                        p: 2,
                        width: { xs: '100%', sm: '500px' },
                        transition: 'all 0.2s',
                        borderRadius: '10px',
                        border: '1px solid rgb(219, 219, 219)',
                        // boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
                    }}
                    elevation={0}>
                    {children}
                </Card>
            </Box>
        </ThemeProvider>
    );
};

export default Layout;
