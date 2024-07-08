import {
    Box,
    Button,
    Divider,
    LinearProgress,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Typography,
    Link as MuiLink,
    Modal,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { fileManager, sharedFile } from '../services/sidebarLinks';
import useErrorHandler from '../hooks/useErrorHandler';
import { useMessage } from '../providers/Provider';
import { Feedback } from '@mui/icons-material';
import MicrophoneIcon from '../components/MicrophoneIcon';
import axios from 'axios';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { env, parseKB } from '../utils/function';
import useModal from '../hooks/useModal';
import Image from '../components/Image';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';

const Drawer = ({ openSettingsMenu }) => {
    const [stats, setStats] = useState(null);
    const errorHandler = useErrorHandler();
    const { showError } = useMessage();
    const user = useAuthUser();

    const {
        modalState: feedbackState,
        openModal: openFeedback,
        closeModal: closeFeedback,
    } = useModal();

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

    console.log(stats);

    useEffect(() => {
        getStorage();
    }, [getStorage]);

    return (
        <Box minHeight='100dvh' color='text.secondary' display='flex' flexDirection='column'>
            <Box
                display='flex'
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
                }}>
                <Typography variant='body2' pl={3} mt={1.5} fontSize='14px' fontWeight={500}>
                    File Manager
                </Typography>
                <List sx={{ px: 3 }}>
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
                                                minWidth: '35px',
                                                color: 'text.secondary',
                                            }}>
                                            {link.icon}
                                        </ListItemIcon>
                                        <ListItemText primary={link.name} />
                                    </ListItemButton>
                                </ListItem>
                            )}
                        </NavLink>
                    ))}
                </List>
                <Divider variant='middle' />
                <Typography variant='body2' pl={3} mt={1.5} fontSize='14px' fontWeight={500}>
                    Shared File
                </Typography>
                <List sx={{ px: 3 }}>
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
                                                minWidth: '35px',
                                                color: 'text.secondary',
                                            }}>
                                            {link.icon}
                                        </ListItemIcon>
                                        <ListItemText primary={link.name} />
                                    </ListItemButton>
                                </ListItem>
                            )}
                        </NavLink>
                    ))}
                </List>
            </Box>

            <Box>
                <Divider variant='middle' />
                {stats ? (
                    <>
                        <Typography
                            variant='body2'
                            pl={3}
                            mt={1.5}
                            fontSize='14px'
                            fontWeight={500}>
                            Storage
                        </Typography>

                        <Box px={3} pb={3}>
                            <LinearProgress
                                variant='determinate'
                                value={(stats.used / stats.storage) * 100}
                                color='primary'
                                sx={{ borderRadius: '2px', mt: 1 }}
                            />
                            <Typography
                                variant='caption'
                                component='div'
                                mt={1}
                                color='primary.main'>
                                {parseKB(stats.used)} used of {parseKB(stats.storage)}
                            </Typography>
                            <Button
                                variant='contained'
                                color='primary'
                                startIcon={<CloudOutlinedIcon fontSize='small' />}
                                sx={{ mt: 1, color: 'white' }}
                                href={env('MY_ACCOUNT')}
                                fullWidth>
                                Upgrade storage
                            </Button>
                        </Box>
                    </>
                ) : null}
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

                <Stack
                    direction='row'
                    justifyContent='center'
                    my={1}
                    sx={{ display: { xs: 'none', sm: 'flex' } }}>
                    <MuiLink
                        display='inline-flex'
                        alignItems='center'
                        color='text.secondary'
                        sx={{ cursor: 'pointer' }}
                        onClick={openFeedback}>
                        <MicrophoneIcon />
                        <Typography variant='caption' fontWeight='bold'>
                            Give feedback
                        </Typography>
                    </MuiLink>
                </Stack>
            </Box>

            <Modal
                open={feedbackState}
                onClose={closeFeedback}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                }}>
                <>
                    <Feedback closeModal={closeFeedback} />
                </>
            </Modal>
        </Box>
    );
};

export default Drawer;
