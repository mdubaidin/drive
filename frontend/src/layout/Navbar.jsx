import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useLocation } from 'react-router-dom';

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
    Button,
    Grid,
    Toolbar,
    Typography,
    Menu,
    MenuItem,
    Modal,
    useTheme as useMuiTheme,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Snackbar,
    useMediaQuery,
    styled,
    Slide,
    CircularProgress,
} from '@mui/material';

//mui icons
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeIcon from '@mui/icons-material/DarkMode';

//react component
import Image from '../components/Image';

//services
import { useTheme } from '../theme';
import { useMenu } from '../hooks/useMenu';

import SearchBar from '../components/SearchBar';
import axios from 'axios';
import { useMessage } from '../providers/Provider';
import useModal from '../hooks/useModal';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import CreateFolder from '../components/folder/CreateFolder';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import eventEmitter from '../utils/eventEmitter';
import { getSessionData, handleAxiosError, setSessionData } from '../utils/function';
import { useDropzone } from 'react-dropzone';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import CollapseDrawer from './CollapseDrawer';
import Drawer from './Drawer';

const drawerWidth = 260;
const miniDrawerWidth = 72;

const openedMixin = theme => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    backgroundColor: theme.palette.background.default,
    borderRight: 'none',
});

const closedMixin = theme => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundColor: theme.palette.background.default,
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
    borderRight: 'none',
});

const StyledDrawer = styled(MuiDrawer, {
    shouldForwardProp: prop => prop !== 'open',
})(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,

    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
    }),
}));

function Transition(props) {
    return <Slide {...props} direction='left' />;
}

export default function Navbar(props) {
    const { children } = props;

    const signOut = useSignOut();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [progress, setProgress] = useState({ started: false, value: 0, text: null });
    const isAuthenticated = useIsAuthenticated();
    const [collapseDrawer, setCollapseDrawer] = useState(true);
    const [drawerHover, setDrawerHover] = useState(false);
    const matches = useMediaQuery('(min-width:1024px)', { noSsr: true });

    const handleDrawerOpen = () => {
        setCollapseDrawer(!collapseDrawer);
    };

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

    const user = useMemo(() => ({ firstName: 'John', lastName: '', email: '' }), []);

    const { toggleTheme, mode } = useTheme();
    const theme = useMuiTheme();

    // useMenu
    const {
        anchorEl: anchorElProfile,
        openMenu: openProfileMenu,
        closeMenu: closeProfileMenu,
    } = useMenu();

    const {
        anchorEl: anchorElSettings,
        openMenu: openSettingsMenu,
        closeMenu: closeSettingsMenu,
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
                    width: {
                        xs: '100%',
                        xm:
                            collapseDrawer && !drawerHover
                                ? `calc(100% - ${drawerWidth}px)`
                                : `calc(100% - ${miniDrawerWidth}px )`,
                    },
                    ml: {
                        xm:
                            collapseDrawer && !drawerHover
                                ? `${drawerWidth}px`
                                : `${miniDrawerWidth}px`,
                    },
                    transition: '225ms, background-color 0s',
                    backgroundColor: 'background.default',
                    borderBottom: '1px solid custom.border',
                    color: 'text.primary',
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
                        <Grid item>
                            <IconButton
                                onClick={matches ? handleDrawerOpen : handleDrawerToggle}
                                edge='start'
                                sx={{
                                    ml: 0.2,
                                    mr: 1,
                                }}>
                                <MenuIcon sx={{ fontSize: '30px' }} />
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
                                <Button
                                    variant='contained'
                                    sx={{
                                        m: 0,
                                        borderRadius: '1.25rem',
                                        boxShadow:
                                            '0 1px 2px 0 rgba(60,64,67,.3),0 1px 3px 1px rgba(60,64,67,.15)',
                                        py: '4px',
                                        mr: 1,
                                        display: { xs: 'none', xm: 'inline-flex' },
                                    }}
                                    endIcon={<AddIcon />}
                                    onClick={openUploadMenu}>
                                    New
                                </Button>
                                <IconButton onClick={openSettingsMenu}>
                                    <SettingsIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorElSettings}
                                    open={Boolean(anchorElSettings)}
                                    onClose={closeSettingsMenu}>
                                    <MenuItem onClick={toggleTheme}>
                                        <ListItemIcon>
                                            {mode === 'dark' ? (
                                                <LightModeIcon fontSize='small' />
                                            ) : (
                                                <DarkModeIcon fontSize='small' />
                                            )}
                                        </ListItemIcon>
                                        Appearance
                                    </MenuItem>
                                </Menu>
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
                                    alt={user.firstName}
                                    src={`https://api.files.clikkle.com/open/file/preview/${user.photo}`}
                                    sx={{ width: 30, height: 30 }}
                                />
                            </IconButton>

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
                                        <Avatar
                                            alt={user.firstName}
                                            src={`https://api.files.clikkle.com/open/file/preview/${user.photo}`}
                                            sx={{ width: 100, height: 100 }}
                                        />
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
                                            {user.firstName + ' ' + user.lastName}
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
                                            color='primary.main'
                                            display='block'>
                                            My Clikkle account
                                        </Typography>
                                        <Typography
                                            variant='caption'
                                            component='a'
                                            href='#'
                                            color='primary.main'
                                            display='block'>
                                            My Profile
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Stack direction='row' mt={2}>
                                    <Button variant='text' fullWidth>
                                        Add account
                                    </Button>
                                    <Button variant='text' onClick={signOut} fullWidth>
                                        Sign out
                                    </Button>
                                </Stack>
                            </Menu>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>

            <Box
                component='nav'
                sx={{
                    width: { xm: drawerWidth },
                    flexShrink: { sm: 0 },
                    bgcolor: 'custom.menu',
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
                            bgcolor: 'custom.menu',
                        },
                    }}>
                    <StyledDrawer />
                </MuiDrawer>
                <StyledDrawer
                    variant='permanent'
                    open={collapseDrawer}
                    hover={drawerHover}
                    onMouseOver={() => {
                        if (!collapseDrawer) {
                            setCollapseDrawer(true);
                            setDrawerHover(true);
                        }
                    }}
                    onMouseLeave={() => {
                        if (drawerHover) {
                            setCollapseDrawer(false);
                            setDrawerHover(false);
                        }
                    }}
                    sx={{
                        display: { xs: 'none', xm: 'block' },
                        p: 0,
                        '& .MuiDrawer-paper': {
                            boxShadow: drawerHover
                                ? 'rgba(149, 157, 165, 0.2) 0px 8px 24px'
                                : 'none',
                        },
                    }}>
                    {collapseDrawer ? <Drawer /> : <CollapseDrawer />}
                </StyledDrawer>
            </Box>

            <div {...getRootProps({ onClick: e => e.stopPropagation() })}>
                <input {...getInputProps()} />
                <Box
                    component='main'
                    sx={{
                        width: {
                            xs: '100%',
                            xm:
                                collapseDrawer && !drawerHover
                                    ? `calc(100% - ${drawerWidth + 16}px)`
                                    : `calc(100% - ${miniDrawerWidth + 16}px )`,
                        },
                        ml: {
                            xm:
                                collapseDrawer && !drawerHover
                                    ? `${drawerWidth}px`
                                    : `${miniDrawerWidth}px`,
                        },
                        mt: 1,
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
                multiple
            />
            <input
                type='file'
                directory=''
                webkitdirectory=''
                mozdirectory=''
                ref={folderRef}
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

            <SpeedDial
                ariaLabel='Action to upload'
                sx={{
                    position: 'absolute',
                    bottom: 24,
                    right: 16,
                    display: { xs: 'flex', xm: 'none' },
                    '& .MuiButtonBase-root.MuiFab-root.MuiSpeedDial-fab': {
                        borderRadius: '8px',
                        p: 0,
                        width: '50px',
                        height: '50px',
                    },
                }}
                icon={<SpeedDialIcon />}>
                <SpeedDialAction
                    icon={<VerticalAlignTopIcon />}
                    onClick={() => {
                        fileRef.current?.click();
                    }}
                    tooltipTitle='Upload files'
                />
                <SpeedDialAction
                    icon={<FolderOpenOutlinedIcon />}
                    onClick={openCreateFolder}
                    tooltipTitle='Create folder'
                />
            </SpeedDial>

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
