import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Link, useLocation } from 'react-router-dom';

//mui component
import {
    AppBar,
    Box,
    Stack,
    Drawer as MuiDrawer,
    IconButton,
    ListItemIcon,
    Divider,
    Avatar,
    Grid,
    Toolbar,
    Typography,
    Menu,
    MenuItem,
    Modal,
    Snackbar,
    useMediaQuery,
    Slide,
    CircularProgress,
} from '@mui/material';

//mui icons
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

//react component
import Image from '../components/Image';

//services
import { useMenu } from '../hooks/useMenu';

import SearchBar from '../components/SearchBar';
import axios from 'axios';
import { useMessage } from '../providers/Provider';
import useModal from '../hooks/useModal';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import CreateFolder from '../components/folder/CreateFolder';
import eventEmitter from '../utils/eventEmitter';
import { getSessionData, handleAxiosError, setSessionData } from '../utils/function';
import { useDropzone } from 'react-dropzone';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import Drawer from './Drawer';
import AccountMenu from './AccountMenu';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';

const drawerWidth = 256;

function Transition(props) {
    return <Slide {...props} direction='left' />;
}

export default function Navbar(props) {
    const { children } = props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [progress, setProgress] = useState({ started: false, value: 0, text: null });
    const isAuthenticated = useIsAuthenticated();
    const matches = useMediaQuery('(min-width:1024px)', { noSsr: true });

    const {
        modalState: createFolderState,
        closeModal: closeCreateFolder,
        openModal: openCreateFolder,
    } = useModal();

    const {
        modalState: progressState,
        openModal: openProgress,
        closeModal: closeProgress,
    } = useModal();

    const {
        anchorEl: anchorElUpload,
        openMenu: openUploadMenu,
        closeMenu: closeUploadMenu,
    } = useMenu();

    const fileRef = useRef();
    const folderRef = useRef();
    const parentKey = getSessionData('parentKey');
    const { showError } = useMessage();
    const location = useLocation();

    const user = useAuthUser() || {};

    // useMenu
    const {
        anchorEl: anchorElProfile,
        openMenu: openProfileMenu,
        closeMenu: closeProfileMenu,
    } = useMenu();

    const fileHandler = async e => {
        closeUploadMenu();
        e.stopPropagation();
        const files = e.target.files;
        if (!files.length) return showError('No file selected');
        console.log('file Uploading');
        await uploadFile(files);
    };

    const folderHandler = async e => {
        closeUploadMenu();
        e.stopPropagation();
        const files = e.target.files;
        if (!files.length) return;
        const index = files[0].webkitRelativePath.indexOf('/');
        const folderName = files[0].webkitRelativePath.slice(0, index);
        console.log('folder Uploading');
        await uploadFolder(files, folderName);
    };

    const filesLength = files =>
        files.length > 1 ? files.length + ' Items' : files.length + ' Item';

    const uploadFile = useCallback(
        async files => {
            setProgress(prev => ({ ...prev, text: `Uploading ` + filesLength(files) }));
            openProgress();

            const formData = new FormData();
            for (const file of files) formData.append(`files`, file);

            console.log(formData);
            try {
                const response = await axios.post(`/file/${parentKey || ''}`, formData, {
                    onUploadProgress: e =>
                        setProgress(prev => ({ ...prev, started: true, value: e.progress * 100 })),
                });

                const { success, message } = response.data;

                if (!success) {
                    showError(message);
                    setProgress(prev => ({ ...prev, text: 'Uploading failed!' }));
                }

                setProgress(prev => ({ ...prev, text: files.length + ` Upload complete` }));
                eventEmitter.emit('uploaded');
            } catch (err) {
                handleAxiosError(err, showError);
            } finally {
                setProgress(prev => ({ ...prev, started: false, value: 0 }));
                setSessionData('parentKey', '');
            }
        },
        [parentKey, showError, openProgress]
    );

    const uploadFolder = useCallback(
        async files => {
            setProgress(prev => ({ ...prev, text: `Uploading ` + filesLength(files) }));
            openProgress();

            const formData = new FormData();
            for (const file of files) {
                console.log(file);
                formData.append(`files`, file, window.btoa(file.webkitRelativePath));
            }

            console.log({ formData, files });

            try {
                const response = await axios.post(`/folder/upload/${parentKey || ''}`, formData, {
                    onUploadProgress: e =>
                        setProgress(prev => ({ ...prev, started: true, value: e.progress * 100 })),
                });

                const { success, errors } = response.data;

                if (!success) {
                    showError(errors);
                    setProgress(prev => ({ ...prev, text: 'Uploading failed!' }));
                }

                setProgress(prev => ({ ...prev, text: files.length + ` Upload complete` }));
                eventEmitter.emit('uploaded');
            } catch (err) {
                handleAxiosError(err, showError);
            } finally {
                setProgress(prev => ({ ...prev, started: false, value: 0 }));
                setSessionData('parentKey', '');
            }
        },
        [parentKey, showError, openProgress]
    );

    const onDrop = useCallback(
        async acceptedFiles => {
            const files = [];
            const folders = [];
            acceptedFiles.forEach(file => {
                if (file.name === file.path) {
                    files.push(file);
                } else {
                    // file.webkitRelativePath = file.path;
                    folders.push(file);
                }
            });
            console.log({ files, folders });
            if (files.length) await uploadFile(files);
            if (folders.length) await uploadFolder(folders);
        },
        [uploadFile, uploadFolder]
    );
    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname, location.hash]);

    if (!isAuthenticated) return children;

    return (
        <Box
            sx={{
                bgcolor: 'background.default',
                px: { xs: 0.5, xm: 0 },
                height: '100dvh',
                position: 'relative',
            }}>
            <AppBar
                elevation={0}
                component={Box}
                position='sticky'
                sx={{
                    width: { xs: '100%', xm: `calc(100% - ${drawerWidth}px)` },
                    ml: { xm: `${drawerWidth}px` },
                    transition: '225ms, background-color 0s',
                    backgroundColor: 'background.default',
                    borderBottom: '1px solid custom.border',
                    color: 'text.primary',
                    zIndex: { xs: 1200, xm: 1250 },
                    pb: 0.5,
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
                        <Grid item sx={{ display: { xm: 'none' } }}>
                            <IconButton
                                onClick={() => handleDrawerToggle()}
                                edge='start'
                                sx={{
                                    ml: 0.2,
                                    mr: 1,
                                }}>
                                <MenuIcon />
                            </IconButton>
                        </Grid>

                        <Grid item xs md={5} alignItems='start'>
                            <SearchBar />
                        </Grid>

                        <Grid item xs display={{ xs: 'none', sm: 'block' }}>
                            <Stack
                                direction='row'
                                alignItems='center'
                                justifyContent='flex-end'
                                spacing={0}>
                                <IconButton LinkComponent={Link} to='/settings'>
                                    <SettingsIcon />
                                </IconButton>
                            </Stack>
                        </Grid>

                        <Grid item>
                            <IconButton
                                onClick={openProfileMenu}
                                sx={{
                                    borderWidth: '2px',
                                    borderStyle: 'solid',
                                    borderColor: 'primary.main',
                                    p: '3px',
                                }}>
                                <Avatar
                                    alt={user.name}
                                    src={`https://api.files.clikkle.com/open/file/preview/${user.photo}`}
                                    sx={{ width: 30, height: 30 }}
                                />
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
                <MuiDrawer
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
                    <Drawer openUploadMenu={openUploadMenu} />
                </MuiDrawer>
                <MuiDrawer
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
                    <Drawer openUploadMenu={openUploadMenu} />
                </MuiDrawer>
            </Box>

            <div {...getRootProps({ onClick: e => e.stopPropagation() })}>
                <input {...getInputProps()} />
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
                        transition: '225ms, background-color 0s',
                    }}>
                    {children}
                </Box>
            </div>

            <input
                type='file'
                ref={fileRef}
                style={{ display: 'none' }}
                onChange={fileHandler}
                onClick={() => {
                    fileRef.current.value = '';
                }}
                multiple
            />
            <input
                type='file'
                directory=''
                webkitdirectory=''
                mozdirectory=''
                ref={folderRef}
                onClick={() => {
                    folderRef.current.value = '';
                }}
                style={{ display: 'none' }}
                onChange={folderHandler}
            />

            <Menu
                anchorEl={anchorElUpload}
                open={Boolean(anchorElUpload)}
                onClose={closeUploadMenu}
                sx={{
                    '.MuiPaper-root.MuiMenu-paper.MuiPopover-paper': {
                        width: '220px',
                        bgcolor: 'custom.menu',
                        mt: 1,
                    },
                }}>
                <MenuItem
                    sx={{ px: 1 }}
                    onClick={() => {
                        openCreateFolder();
                        closeUploadMenu();
                    }}>
                    <ListItemIcon>
                        <Image name='icons/folder.png' height='20px' />
                    </ListItemIcon>
                    New folder
                </MenuItem>
                <Divider variant='fullWidth' sx={{ my: 0.5 }} />
                <MenuItem
                    sx={{ px: 1 }}
                    onClick={() => {
                        fileRef.current.click();
                    }}>
                    <ListItemIcon>
                        <UploadFileIcon fontSize='small' />
                    </ListItemIcon>
                    File upload
                </MenuItem>

                <MenuItem
                    sx={{ px: 1 }}
                    onClick={() => {
                        folderRef.current.click();
                    }}>
                    <ListItemIcon>
                        <DriveFolderUploadIcon fontSize='small' />
                    </ListItemIcon>
                    Folder upload
                </MenuItem>
            </Menu>

            <Modal
                open={createFolderState}
                onClose={closeCreateFolder}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <>
                    <CreateFolder closeModal={closeCreateFolder} />
                </>
            </Modal>

            <Snackbar
                open={progressState}
                TransitionComponent={Transition}
                anchorOrigin={
                    matches
                        ? { vertical: 'bottom', horizontal: 'right' }
                        : { vertical: 'top', horizontal: 'right' }
                }
                onClose={closeProgress}
                sx={{
                    '& .MuiPaper-root.MuiSnackbarContent-root': {
                        flexGrow: { xs: 0, sm: 1 },
                    },
                    '.MuiSnackbarContent-message': { flexGrow: 1 },
                    '.MuiSnackbarContent-action': { pl: 1 },
                }}
                message={
                    <Box display='flex' alignItems='center' justifyContent='space-between'>
                        <Typography variant='body2' sx={{ color: 'custom.common' }} mr={1}>
                            {progress.text}
                        </Typography>
                        {progress.started && (
                            <CircularProgress
                                sx={{ height: '20px !important', width: '20px !important' }}
                                variant={progress.value === 100 ? 'indeterminate' : 'determinate'}
                                value={progress.value}
                            />
                        )}
                    </Box>
                }
                action={
                    <IconButton
                        aria-label='close'
                        color='inherit'
                        sx={{ p: 0.5 }}
                        onClick={closeProgress}>
                        <CloseIcon />
                    </IconButton>
                }
            />
        </Box>
    );
}
