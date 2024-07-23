import { Box, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import React from 'react';
import { NavLink } from 'react-router-dom';

const settings = {
    General: '/settings',
    Notifications: '/settings/notifications',
    Account: '/settings/account',
};

const NavigationPanel = () => {
    return (
        <Box
            sx={{
                overflowY: 'auto',
                overflowX: 'hidden',
                height: 'calc(100dvh - 90px)',
                flexGrow: 1,
                mt: { xs: 3, xm: 8 },
            }}>
            <List sx={{ px: 2 }}>
                {Object.keys(settings).map(setting => (
                    <NavLink
                        to={settings[setting]}
                        key={setting}
                        end
                        style={{ textDecoration: 'none', color: 'inherit' }}>
                        {({ isActive }) => (
                            <ListItem disablePadding>
                                <ListItemButton
                                    selected={isActive}
                                    disableRipple
                                    disableTouchRipple
                                    variant='sidebarButton'>
                                    <ListItemText
                                        primary={setting}
                                        primaryTypographyProps={{ fontSize: 14 }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        )}
                    </NavLink>
                ))}
            </List>
        </Box>
    );
};

export default NavigationPanel;
