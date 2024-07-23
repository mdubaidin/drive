import { Avatar, Box, Button, Grid, Menu, Stack, Typography } from '@mui/material';
import React from 'react';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const AccountMenu = ({ anchorElProfile, closeProfileMenu, user }) => {
    const signOut = useSignOut();

    return (
        <Menu
            anchorEl={anchorElProfile}
            open={Boolean(anchorElProfile)}
            onClose={closeProfileMenu}
            sx={{
                '.MuiPaper-root.MuiMenu-paper.MuiPopover-paper': {
                    width: 'min(100%, 350px)',
                    boxShadow:
                        'rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px',
                    border: '1px solid #00000017',
                    bgcolor: 'custom.menu',
                    padding: 0,
                    mt: 2,
                },
            }}>
            <Stack direction={'row'} justifyContent='space-between' alignItems='center' mb={2}>
                <Logo sx={{ height: 18 }} />

                <Button
                    variant='text'
                    sx={{ color: 'text.secondary' }}
                    onClick={() => {
                        signOut();
                        closeProfileMenu();
                        window.location.replace('/');
                    }}>
                    Sign out
                </Button>
            </Stack>
            <Box px={0.5} pt={1.2} pb={2}>
                <Grid container spacing={2} alignItems='center' flexWrap='nowrap'>
                    <Grid item>
                        <Avatar alt={user.name} src={``} sx={{ width: 100, height: 100 }} />
                    </Grid>
                    <Grid item xs={8}>
                        <Typography
                            variant='h6'
                            sx={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                            {user.name}
                        </Typography>
                        <Typography
                            variant='caption'
                            component='div'
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                            {user.email}
                        </Typography>
                        <Button
                            variant='text'
                            color='secondary'
                            sx={{ p: 0 }}
                            LinkComponent={Link}
                            to='/settings/account'
                            onClick={closeProfileMenu}>
                            Manage your account
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Menu>
    );
};

export default AccountMenu;
