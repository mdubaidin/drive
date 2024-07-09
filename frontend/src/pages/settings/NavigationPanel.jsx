import { Box, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import React from 'react';

const settings = ['General', 'Notifications'];

const NavigationPanel = props => {
    const { selected, setSelected } = props;

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
                {settings.map((setting, i) => (
                    <ListItem disablePadding>
                        <ListItemButton
                            selected={selected === i}
                            disableRipple
                            disableTouchRipple
                            onClick={() => setSelected(i)}
                            variant='sidebarButton'>
                            <ListItemText
                                primary={setting}
                                primaryTypographyProps={{ fontSize: 14 }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default NavigationPanel;
