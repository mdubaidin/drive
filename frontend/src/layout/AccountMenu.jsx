import { Avatar, Button, Grid, Menu, Stack, Typography } from '@mui/material';
import React from 'react';
import useSignOut from 'react-auth-kit/hooks/useSignOut';

const AccountMenu = ({ anchorElProfile, closeProfileMenu, user }) => {
    const signOut = useSignOut();

    return (
        <Menu
            anchorEl={anchorElProfile}
            open={Boolean(anchorElProfile)}
            onClose={closeProfileMenu}
            sx={{
                '.MuiPaper-root.MuiMenu-paper.MuiPopover-paper': {
                    width: 'min(100%, 320px)',
                    boxShadow:
                        'rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px',
                    border: '1px solid #00000017',
                    bgcolor: 'custom.menu',
                    px: 0.5,
                    pt: 1.5,
                },
            }}>
            <Grid container spacing={2} alignItems='center' flexWrap='nowrap'>
                <Grid item>
                    <Avatar alt={user.name} src={``} sx={{ width: 100, height: 100 }} />
                </Grid>
                <Grid item xs={8}>
                    <Typography
                        variant='substitle1'
                        component='div'
                        fontWeight={600}
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
                    <Typography
                        variant='caption'
                        component='a'
                        href='#'
                        color='secondary.main'
                        display='block'>
                        My Drive account
                    </Typography>
                    <Typography
                        variant='caption'
                        component='a'
                        href='#'
                        color='secondary.main'
                        display='block'>
                        My Profile
                    </Typography>
                </Grid>
            </Grid>
            <Stack direction='row' mt={2}>
                {/* <Button variant='text' fullWidth>
                    Add account
                </Button> */}
                <Button variant='text' onClick={signOut} fullWidth>
                    Sign out
                </Button>
            </Stack>
        </Menu>
    );
};

export default AccountMenu;
