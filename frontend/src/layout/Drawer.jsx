import {
    Box,
    Button,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    styled,
    Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { fileManager, sharedFile } from '../data/sidebarLinks';
import useErrorHandler from '../hooks/useErrorHandler';
import { useMessage } from '../providers/Provider';
import axios from 'axios';
import { parseKB } from '../utils/function';
import Image from '../components/Image';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import AddIcon from '@mui/icons-material/Add';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

const StorageProgress = styled(LinearProgress)(({ theme }) => ({
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 300 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
        backgroundColor: theme.palette.secondary.main,
    },
}));

const Drawer = props => {
    const { openSettingsMenu, openUploadMenu } = props;
    const [stats, setStats] = useState(null);
    const errorHandler = useErrorHandler();
    const { showError } = useMessage();

    const getStorage = useCallback(async () => {
        try {
            const response = await axios.get(`/stats`);

            const { success, errors, stats } = response.data;
            if (!success) return showError(errors);

            setStats(stats);
        } catch (e) {
            errorHandler(e);
        }
    }, [errorHandler, showError]);

    useEffect(() => {
        getStorage();
    }, [getStorage]);

    return (
        <Box minHeight='100dvh' color='text.secondary' display='flex' flexDirection='column'>
            <Box
                display={{ xs: 'flex', xm: 'none' }}
                alignItems='center'
                justifyContent='center'
                position='relative'
                component={Link}
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
                    mt: { xm: 8 },
                }}>
                <Box px={2} py={1}>
                    <Button
                        variant='contained'
                        sx={{
                            borderRadius: '16px',
                            boxShadow:
                                '0 1px 2px 0 rgba(60,64,67,.3),0 1px 3px 1px rgba(60,64,67,.15)',
                            padding: '18px 20px 18px 16px',
                            width: 100,
                            height: 56,
                            backgroundColor: 'background.button.new',
                            color: 'contrast',
                            '.MuiButton-startIcon>*:nth-of-type(1)': {
                                fontSize: 24,
                            },
                            '&:hover': {
                                backgroundColor: 'background.button.newHover',
                            },
                        }}
                        startIcon={<AddIcon />}
                        onClick={openUploadMenu}>
                        New
                    </Button>
                </Box>
                <List sx={{ px: 2 }}>
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
                                        variant='sidebarButton'>
                                        <ListItemIcon
                                            sx={{
                                                minWidth: '34px',
                                                color: 'text.secondary',
                                            }}>
                                            {link.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={link.name}
                                            primaryTypographyProps={{ fontSize: 14 }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            )}
                        </NavLink>
                    ))}
                </List>

                <List sx={{ px: 2 }}>
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
                                        variant='sidebarButton'>
                                        <ListItemIcon
                                            sx={{
                                                minWidth: '34px',
                                                color: 'text.secondary',
                                            }}>
                                            {link.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={link.name}
                                            primaryTypographyProps={{ fontSize: 14 }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            )}
                        </NavLink>
                    ))}
                    {stats ? (
                        <>
                            <Box px={2} my={2}>
                                <StorageProgress
                                    variant='determinate'
                                    value={(stats.used / stats.storage) * 100}
                                    sx={{ borderRadius: '5px' }}
                                />
                                <Typography
                                    variant='caption'
                                    component='div'
                                    my={1}
                                    color='text.primary'>
                                    {parseKB(stats.used)} of {parseKB(stats.storage)} used
                                </Typography>
                                <Button
                                    variant='text'
                                    color='secondary'
                                    fullWidth
                                    sx={{
                                        mt: 1,
                                        borderRadius: '100px',
                                        border: '1px solid',
                                        borderColor: 'custom.border',
                                    }}>
                                    Get more storage
                                </Button>
                            </Box>
                        </>
                    ) : null}
                </List>
            </Box>

            <Box>
                <Divider variant='middle' />

                <Divider variant='middle' sx={{ display: { xs: 'block', sm: 'none' } }} />
                <List sx={{ px: 1, display: { xs: 'block', sm: 'none' } }}>
                    <ListItem
                        disablePadding
                        onClick={openSettingsMenu}
                        sx={{
                            '&:hover': {
                                backgroundColor: 'custom.cardHover',
                                borderRadius: '8px',
                            },
                        }}>
                        <ListItemButton disableRipple disableTouchRipple variant='sidebarButton'>
                            <ListItemIcon
                                sx={{
                                    minWidth: '30px',
                                    color: 'text.secondary',
                                }}>
                                <SettingsIcon fontSize='small' />
                            </ListItemIcon>
                            <ListItemText
                                primary='Settings'
                                primaryTypographyProps={{ fontSize: 14 }}
                            />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        </Box>
    );
};

export default Drawer;
