import {
    AppBar,
    Avatar,
    Box,
    Drawer,
    Grid,
    IconButton,
    Toolbar,
    Typography,
    useMediaQuery,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import AccountMenu from '../../layout/AccountMenu';
import { useMenu } from '../../hooks/useMenu';
import NavigationPanel from './NavigationPanel';
import MenuIcon from '@mui/icons-material/Menu';

const drawerWidth = 256;

const Settings = ({ children }) => {
    const navigate = useNavigate();
    const user = useAuthUser() || {};
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const matches = useMediaQuery('(min-width:1024px)', { noSsr: true });

    const {
        anchorEl: anchorElProfile,
        openMenu: openProfileMenu,
        closeMenu: closeProfileMenu,
    } = useMenu();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname, location.hash]);

    return (
        <Box
            sx={{
                bgcolor: 'background.default',
                px: { xs: 0.5, xm: 0 },
                height: '100dvh',
            }}>
            <AppBar
                elevation={0}
                component={Box}
                position='sticky'
                sx={{
                    width: '100%',
                    transition: '225ms, background-color 0s',
                    backgroundColor: 'background.default',
                    borderBottom: '1px solid custom.border',
                    color: 'text.primary',
                    zIndex: { xs: 1200, xm: 1250 },
                }}>
                <Toolbar
                    sx={{
                        flexDirection: 'column',
                        justifyContent: 'center',
                        position: 'relative',
                        '&': {
                            minHeight: '64px',
                            px: 1,
                        },
                    }}>
                    <Grid container alignItems='center' columnSpacing={1}>
                        <Grid item xs display='flex' alignItems='center'>
                            {matches ? (
                                <IconButton
                                    onClick={() => navigate(-1)}
                                    edge='start'
                                    sx={{
                                        ml: 0.2,
                                        mr: 1,
                                    }}>
                                    <ArrowBackIcon />
                                </IconButton>
                            ) : (
                                <IconButton
                                    onClick={() => handleDrawerToggle()}
                                    edge='start'
                                    sx={{
                                        ml: 0.2,
                                        mr: 1,
                                    }}>
                                    <MenuIcon />
                                </IconButton>
                            )}

                            <Typography variant='h6' fontWeight={400}>
                                Settings
                            </Typography>
                        </Grid>

                        <Grid item>
                            <IconButton
                                onClick={openProfileMenu}
                                sx={{
                                    borderWidth: '2px',
                                    borderStyle: 'solid',
                                    borderColor: 'secondary.main',
                                    p: '3px',
                                }}>
                                <Avatar alt={user.name} sx={{ width: 30, height: 30 }} />
                            </IconButton>
                            <AccountMenu
                                anchorElProfile={anchorElProfile}
                                closeProfileMenu={closeProfileMenu}
                                user={user}
                            />
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>

            <Box
                component='nav'
                sx={{
                    width: { xm: drawerWidth },
                    flexShrink: { sm: 0 },
                    bgcolor: 'background.default',
                }}>
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                <Drawer
                    variant='temporary'
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', xm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            bgcolor: 'background.default',
                            backgroundImage: 'none',
                        },
                    }}>
                    <NavigationPanel />
                </Drawer>
                <Drawer
                    variant='permanent'
                    sx={{
                        display: { xs: 'none', xm: 'block' },
                        p: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            bgcolor: 'background.default',
                            border: 'none',
                        },
                    }}>
                    <NavigationPanel />
                </Drawer>
            </Box>
            <Box
                component='main'
                sx={{
                    width: {
                        xs: '100%',
                        xm: `calc(100% - ${drawerWidth + 16}px)`,
                    },
                    ml: {
                        xm: `${drawerWidth}px`,
                    },
                    backgroundColor: 'background.paper',
                    borderRadius: '12px',
                    transition: '0s',
                    height: 'calc(100dvh - 80px)',
                }}>
                {children}
            </Box>
        </Box>
    );
};

export default Settings;
