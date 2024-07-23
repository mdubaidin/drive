import {
    AppBar,
    Box,
    Button,
    Card,
    // Button,
    // Card,
    Divider,
    Drawer,
    Grid,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Modal,
    Stack,
    ThemeProvider,
    Toolbar,
    Tooltip,
    Typography,
    createTheme,
} from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import { getAWSKey, handleAxiosError, parseKB } from '../../utils/function';
import { useCallback } from 'react';
import useLoader from '../../hooks/useLoader';
import { useMessage } from '../../providers/Provider';
import axios from 'axios';
import { useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import { useMenu } from '../../hooks/useMenu';
import useModal from '../../hooks/useModal';
import Share from '../Share';
import Rename from '../Rename';
import Move from '../Move';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import './style.css';
import useMedia from '../../hooks/useMedia';
import Icon from '../Icon';
import Image from '../Image';

const theme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const previewAllowed = [
    'bmp',
    'csv',
    'txt',
    'gif',
    'jpg',
    'jpeg',
    'png',
    'pdf',
    'tiff',
    'mp4',
    'mkv',
    'webp',
    'webm',
];

const Preview = props => {
    const { closeModal, content, fileIcon, refresh, allFiles, fileIndex } = props;
    const [activeContent, setActiveContent] = useState(content);
    const { _id: id, key, name, favorite, file, mimetype: type } = activeContent;
    const [activeIndex, setActiveIndex] = useState(fileIndex);
    const [detailsPanel, setDetailsPanel] = useState(false);
    const [preview, setPreview] = useState([]);
    const { circular, start, end, loaderState } = useLoader({ size: 56, color: 'primary.main' });
    const { showError, showResponse } = useMessage();
    const xmLayout = useMedia('(max-width: 1024px)');
    const fileType = useMemo(() => type?.slice(0, type.indexOf('/')), [type]);
    const {
        anchorEl: anchorElDetail,
        openMenu: openDetailMenu,
        closeMenu: closeDetailMenu,
    } = useMenu();
    const { modalState: moveState, closeModal: closeMove, openModal: openMove } = useModal();
    const { modalState: renameState, closeModal: closeRename, openModal: openRename } = useModal();
    const { modalState: shareState, closeModal: closeShare, openModal: openShare } = useModal();

    const detailsPanelOpen = () => setDetailsPanel(true);

    const detailsPanelClose = () => setDetailsPanel(false);

    const previousSlide = useCallback(() => {
        if (activeIndex === 0) return;
        setActiveIndex(activeIndex - 1);
        setActiveContent(allFiles[activeIndex - 1]);
    }, [activeIndex, allFiles]);

    // console.log({ activeContent, activeIndex, preview });

    const forwardSlide = useCallback(() => {
        if (activeIndex === allFiles.length - 1) return;
        setActiveIndex(activeIndex + 1);
        setActiveContent(allFiles[activeIndex + 1]);
    }, [activeIndex, allFiles]);

    const getPreview = useCallback(async () => {
        start();

        try {
            const response = await axios.get(`/file/preview?key=${getAWSKey(key, id)}`, {
                responseType: 'blob',
            });

            setPreview([
                {
                    uri: window.URL.createObjectURL(response.data),
                    fileType: name.match(/.[a-zA-Z0-9]+$/)[0].slice(1),
                },
            ]);
        } catch (e) {
            handleAxiosError(e, showError);
        } finally {
            end();
        }
    }, [id, key, showError, name, start, end]);

    const download = useCallback(async () => {
        showResponse('Downloading...');

        try {
            const response = await axios.get(
                `/file/download?key=${getAWSKey(key, id)}`,
                {},
                {
                    responseType: 'blob',
                }
            );

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            showResponse(`${name} is downloaded successfully`);

            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (e) {
            handleAxiosError(e, showError);
        }
    }, [id, key, name, showError, showResponse]);

    const addFavorite = useCallback(
        async function () {
            closeDetailMenu();
            showResponse('Working...');

            try {
                const response = await axios.patch(`/file/favorite/add/${id}`);

                const { success, message } = response.data;

                if (!success) return showError(message);

                refresh();
                showResponse(`${name} is added to favorite`);
            } catch (e) {
                handleAxiosError(e, showError);
            }
        },
        [showError, showResponse, refresh, id, closeDetailMenu, name]
    );

    const removeFavorite = useCallback(
        async function () {
            closeDetailMenu();
            showResponse('Working...');

            try {
                const response = await axios.patch(`/file/favorite/remove/${id}`);

                const { success, message } = response.data;

                if (!success) return showError(message);

                refresh();
                showResponse(`${name} is removed from favorite`);
            } catch (e) {
                handleAxiosError(e, showError);
            }
        },
        [showError, showResponse, refresh, closeDetailMenu, id, name]
    );

    useEffect(() => {
        getPreview();
    }, [getPreview]);

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ minHeight: '100dvh' }} display='flex' flexDirection='column'>
                <AppBar
                    elevation={0}
                    component={Box}
                    position='fixed'
                    sx={{
                        backgroundColor: 'transparent',
                    }}>
                    <Toolbar
                        sx={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            position: 'relative',
                            '&': {
                                px: 1,
                                minHeight: '64px',
                            },
                        }}>
                        <Grid container alignItems='center' columnSpacing={1.5}>
                            <Grid item>
                                <IconButton onClick={closeModal}>
                                    <ArrowBackOutlinedIcon />
                                </IconButton>
                            </Grid>
                            <Grid item xs sx={{ overflow: 'hidden' }}>
                                <Stack direction='row' alignItems='center' spacing={1}>
                                    <Icon name={fileIcon} height='20px' />
                                    <Typography
                                        variant='body1'
                                        fontWeight='400'
                                        sx={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            lineHeight: 1,
                                        }}>
                                        {name}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item>
                                <Stack
                                    direction='row'
                                    alignItems='center'
                                    justifyContent='flex-end'
                                    spacing={0.5}>
                                    <Tooltip title='Download'>
                                        <IconButton onClick={download}>
                                            <FileDownloadOutlinedIcon fontSize='small' />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title='More options'>
                                        <IconButton onClick={openDetailMenu}>
                                            <MoreVertIcon fontSize='small' />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>
                <Grid
                    container
                    alignItems='center'
                    sx={{
                        mt: 4,
                        transition: 'all 0.3s ease-in',
                        flexWrap: 'wrap',
                    }}>
                    <Grid item xs={1} textAlign='center' display={{ xs: 'none', sm: 'block' }}>
                        <IconButton onClick={previousSlide}>
                            <ArrowBackIosNewOutlinedIcon />
                        </IconButton>
                    </Grid>

                    <Grid item xs>
                        <Stack
                            direction='row'
                            justifyContent='center'
                            alignItems='center'
                            height='calc(100dvh - 64px)'
                            mx={1}
                            onClick={closeModal}>
                            {previewAllowed.includes(type.split('/')[1]) ? (
                                loaderState ? (
                                    circular
                                ) : fileType === 'video' ? (
                                    <video controls>
                                        <source src={preview && preview[0]?.uri} />
                                    </video>
                                ) : fileType === 'audio' ? (
                                    <audio controls>
                                        <source src={preview && preview[0]?.uri} />
                                    </audio>
                                ) : fileType === 'image' ? (
                                    <Image
                                        src={preview && preview[0]?.uri}
                                        alt='no-preview'
                                        sx={{ maxHeight: '85vh' }}
                                    />
                                ) : (
                                    <DocViewer
                                        documents={preview}
                                        onClick={e => e.stopPropagation()}
                                        pluginRenderers={DocViewerRenderers}
                                    />
                                )
                            ) : (
                                <NoPreview />
                            )}
                        </Stack>
                    </Grid>
                    <Grid item xs={1} textAlign='center' display={{ xs: 'none', sm: 'block' }}>
                        <IconButton onClick={forwardSlide}>
                            <ArrowForwardIosOutlinedIcon />
                        </IconButton>
                    </Grid>
                    <DetailsPanel
                        details={activeContent}
                        detailsPanelClose={detailsPanelClose}
                        detailsPanel={detailsPanel}
                        xmLayout={xmLayout}
                        fileIcon={fileIcon}
                    />
                </Grid>

                <Menu
                    anchorEl={anchorElDetail}
                    open={Boolean(anchorElDetail)}
                    onClose={closeDetailMenu}
                    sx={{
                        '.MuiPaper-root.MuiMenu-paper.MuiPopover-paper': {
                            width: 'min(100%, 320px)',
                            boxShadow:
                                'rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px',
                            border: '1px solid #00000017',
                            p: 0.5,
                        },
                    }}>
                    <MenuItem
                        onClick={() => {
                            closeDetailMenu();
                            openShare();
                        }}>
                        <ListItemIcon>
                            <PersonAddAltOutlinedIcon />
                        </ListItemIcon>
                        Share
                    </MenuItem>

                    <MenuItem
                        onClick={() => {
                            openMove();
                            closeDetailMenu();
                        }}>
                        <ListItemIcon>
                            <DriveFileMoveOutlinedIcon />
                        </ListItemIcon>
                        Move
                    </MenuItem>
                    {favorite ? (
                        <MenuItem onClick={removeFavorite}>
                            <ListItemIcon>
                                <StarIcon />
                            </ListItemIcon>
                            Remove from favorite
                        </MenuItem>
                    ) : (
                        <MenuItem onClick={addFavorite}>
                            <ListItemIcon>
                                <StarBorderIcon />
                            </ListItemIcon>
                            Add to favorite
                        </MenuItem>
                    )}

                    <MenuItem
                        onClick={() => {
                            closeDetailMenu();
                            openRename();
                        }}>
                        <ListItemIcon>
                            <DriveFileRenameOutlineOutlinedIcon />
                        </ListItemIcon>
                        Rename
                    </MenuItem>

                    <MenuItem
                        onClick={() => {
                            closeDetailMenu();
                            detailsPanelOpen();
                        }}>
                        <ListItemIcon>
                            <InfoOutlinedIcon />
                        </ListItemIcon>
                        File information
                    </MenuItem>
                </Menu>

                {/* Move */}
                <Modal
                    open={moveState}
                    onClose={closeMove}
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <>
                        <Move closeModal={closeMove} content={content} refresh={refresh} />
                    </>
                </Modal>

                {/* Rename */}
                <Modal
                    open={renameState}
                    onClose={closeRename}
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <>
                        <Rename
                            closeModal={closeRename}
                            name={name}
                            id={id}
                            refresh={refresh}
                            file={file}
                        />
                    </>
                </Modal>

                {/* Share */}
                <Modal
                    open={shareState}
                    onClose={closeShare}
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <>
                        <Share closeModal={closeShare} content={content} refresh={refresh} />
                    </>
                </Modal>
            </Box>
        </ThemeProvider>
    );
};

const NoPreview = () => {
    return (
        <Card
            sx={{
                bgcolor: '#4c494c',
                py: 2.5,
                mx: 1,
                px: 7,
                textAlign: 'center',
                borderRadius: '12px',
                boxShadow: ' rgba(0, 0, 0, 0.15) 0px 15px 25px, rgba(0, 0, 0, 0.05) 0px 5px 10px',
            }}>
            <Typography variant='subtitle1' mb={2} fontSize={20}>
                No preview available
            </Typography>
            <Button
                variant='contained'
                // onClick={download}
                startIcon={<FileDownloadOutlinedIcon fontSize='small' />}
                sx={{
                    textTransform: 'capitalize',
                    px: 2.5,
                    py: 0.4,
                    fontSize: '12px',
                }}>
                Download
            </Button>
        </Card>
    );
};

const DetailsPanel = props => {
    const { details, detailsPanel, detailsPanelClose, xmLayout, fileIcon } = props;

    return xmLayout ? (
        <Drawer
            anchor='bottom'
            open={detailsPanel}
            onClose={detailsPanelClose}
            sx={{
                zIndex: 2000,
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                '::-webkit-scrollbar': {
                    display: 'none',
                },
                '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    bgcolor: 'custom.menu',
                },
            }}>
            {details && (
                <Box p={2}>
                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                        <Box display='inline-flex' alignItems='center' overflow='hidden'>
                            <Icon name={fileIcon} height='20px' sx={{ mr: 1 }} />
                            <Typography
                                variant='subtitle1'
                                color='text.primary'
                                fontWeight={500}
                                sx={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>
                                {details.name}
                            </Typography>
                        </Box>
                        <IconButton onClick={detailsPanelClose}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>

                    <Divider sx={{ my: 2 }} />
                    <Typography variant='subtitle1' fontWeight={500} mb={1} color='text.primary'>
                        General Info
                    </Typography>
                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Type
                            </Typography>
                        </Grid>
                        <Grid item xs>
                            <Typography variant='body2' color='text.primary' fontSize={11} mb={2}>
                                {details.name
                                    ?.match(/.[a-zA-Z0-9]+$/)[0]
                                    .toUpperCase()
                                    .slice(1)}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Size
                            </Typography>
                        </Grid>

                        <Grid item xs>
                            <Typography variant='body2' color='text.primary' fontSize={11} mb={2}>
                                {parseKB(details.size)}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Storage used
                            </Typography>
                        </Grid>
                        <Grid item xs>
                            <Typography variant='body2' color='text.primary' fontSize={11} mb={2}>
                                {parseKB(details.size)}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Modified
                            </Typography>
                        </Grid>
                        <Grid item xs>
                            <Typography variant='body2' color='text.primary' fontSize={11} mb={2}>
                                {new Date(details.updatedAt).toDateString()}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Created
                            </Typography>
                        </Grid>
                        <Grid item xs>
                            <Typography variant='body2' color='text.primary' fontSize={11} mb={2}>
                                {new Date(details.createdAt).toDateString()}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                        variant='subtitle1'
                        color='text.secondary'
                        fontWeight={500}
                        mt={2}
                        gutterBottom>
                        Sharing
                    </Typography>
                    <Typography variant='body2' color='text.primary' mb={2}>
                        {details.email}
                    </Typography>
                </Box>
            )}
        </Drawer>
    ) : (
        <Grid
            item
            onClick={e => e.stopPropagation()}
            sx={{
                width: detailsPanel ? '310px' : '0px',
                transform: detailsPanel ? 'transform(0)' : 'translateX(280px)',
                mr: detailsPanel ? 1.5 : 0,
                mb: 2,
                transition: '0.2s ease-in',
                transitionProperty: 'width, transform',
                height: 'calc(100dvh - 85px)',
                mt: 'auto',
                backgroundColor: 'background.default',
                borderRadius: '12px',
                overflowY: 'auto',
            }}>
            {details && (
                <Box p={2}>
                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                        <Box display='inline-flex' alignItems='center' overflow='hidden'>
                            <Icon name={fileIcon} height='20px' sx={{ mr: 1 }} />
                            <Typography
                                variant='subtitle1'
                                color='text.primary'
                                fontWeight={500}
                                sx={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>
                                {details.name}
                            </Typography>
                        </Box>
                        <IconButton onClick={detailsPanelClose}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>

                    <Divider sx={{ my: 2 }} />
                    <Typography variant='subtitle1' fontWeight={500} mb={1} color='text.primary'>
                        General Info
                    </Typography>
                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Type
                            </Typography>
                        </Grid>
                        <Grid item xs>
                            <Typography variant='body2' color='text.primary' fontSize={11} mb={2}>
                                {details.name
                                    ?.match(/.[a-zA-Z0-9]+$/)[0]
                                    .toUpperCase()
                                    .slice(1)}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Size
                            </Typography>
                        </Grid>

                        <Grid item xs>
                            <Typography variant='body2' color='text.primary' fontSize={11} mb={2}>
                                {parseKB(details.size)}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Storage used
                            </Typography>
                        </Grid>
                        <Grid item xs>
                            <Typography variant='body2' color='text.primary' fontSize={11} mb={2}>
                                {parseKB(details.size)}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Modified
                            </Typography>
                        </Grid>
                        <Grid item xs>
                            <Typography variant='body2' color='text.primary' fontSize={11} mb={2}>
                                {new Date(details.updatedAt).toDateString()}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Created
                            </Typography>
                        </Grid>
                        <Grid item xs>
                            <Typography variant='body2' color='text.primary' fontSize={11} mb={2}>
                                {new Date(details.createdAt).toDateString()}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                        variant='subtitle1'
                        color='text.primary'
                        fontWeight={500}
                        mt={2}
                        gutterBottom>
                        Sharing
                    </Typography>
                    <Typography variant='body2' color='text.secondary' mb={2}>
                        {details.email}
                    </Typography>
                </Box>
            )}
        </Grid>
    );
};

export default Preview;
