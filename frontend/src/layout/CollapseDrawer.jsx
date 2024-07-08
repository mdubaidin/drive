import { Box, List, ListItem, ListItemButton, ListItemIcon } from '@mui/material';
import React from 'react';
import Image from '../components/Image';
import { fileManager, sharedFile } from '../services/sidebarLinks';
import { Link, NavLink } from 'react-router-dom';

const CollapseDrawer = () => {
    return (
        <Box minHeight='100dvh' color='text.secondary' display='flex' flexDirection='column'>
            <Box
                display='flex'
                alignItems='center'
                justifyContent='center'
                component={Link}
                mb={3}
                to='/'
                sx={{ textDecoration: 'none', color: 'text.primary', py: 1 }}>
                <Image name='logo.png' sx={{ height: '30px' }} />
            </Box>
            <Box
                sx={{
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    height: 'calc(100dvh - 90px)',
                    flexGrow: 1,
                }}>
                <List sx={{ px: 1, pb: 0 }}>
                    {fileManager.map(link => (
                        <NavLink
                            to={link.to}
                            key={link.name}
                            style={{ textDecoration: 'none', color: 'inherit' }}>
                            {({ isActive }) => (
                                <ListItem disablePadding>
                                    <ListItemButton
                                        selected={isActive}
                                        disableRipple
                                        disableTouchRipple
                                        variant='sidebarButton'
                                        sx={{ height: '45px', my: '2px' }}>
                                        <ListItemIcon
                                            sx={{
                                                minWidth: '35px',
                                                color: 'text.secondary',
                                            }}>
                                            {link.icon}
                                        </ListItemIcon>
                                    </ListItemButton>
                                </ListItem>
                            )}
                        </NavLink>
                    ))}
                </List>

                <List sx={{ px: 1, pt: 0 }}>
                    {sharedFile.map(link => (
                        <NavLink
                            to={link.to}
                            key={link.name}
                            style={{ textDecoration: 'none', color: 'inherit' }}>
                            {({ isActive }) => (
                                <ListItem disablePadding>
                                    <ListItemButton
                                        selected={isActive}
                                        disableRipple
                                        disableTouchRipple
                                        variant='sidebarButton'
                                        sx={{ height: '45px', my: '2px' }}>
                                        <ListItemIcon
                                            sx={{
                                                minWidth: '35px',
                                                color: 'text.secondary',
                                            }}>
                                            {link.icon}
                                        </ListItemIcon>
                                    </ListItemButton>
                                </ListItem>
                            )}
                        </NavLink>
                    ))}
                </List>
            </Box>
        </Box>
    );
};

export default CollapseDrawer;
