import {
    AppBar,
    Box,
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
import { env, getAWSKey, handleAxiosError, parseKB } from '../../../../utils/function';
import { useCallback } from 'react';
import useLoader from '../../../../hooks/useLoader';
import { useMessage } from '../../../../providers/Provider';
import axios from 'axios';
import { useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useMenu } from '../../../../hooks/useMenu';
import useModal from '../../../../hooks/useModal';
import Share from '../../../../components/Share';
import Rename from '../Rename';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import './style.css';
import useMedia from '../../../../hooks/useMedia';
import Icon from '../../../../components/Icon';

const theme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const Preview = props => {
    const { closeModal, content, fileIcon, refresh, allFiles, fileIndex } = props;
    const [activeContent, setActiveContent] = useState(content);
    const [activeIndex, setActiveIndex] = useState(fileIndex);
    const { _id: id, key, name, file, mimetype: type, userId } = activeContent;
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
    const { modalState: renameState, closeModal: closeRename, openModal: openRename } = useModal();
    const { modalState: shareState, closeModal: closeShare, openModal: openShare } = useModal();

    const detailsPanelOpen = () => setDetailsPanel(true);

    const detailsPanelClose = () => setDetailsPanel(false);

    const previousSlide = () => {
        if (activeIndex === 0) return;
        setActiveIndex(activeIndex - 1);
        setActiveContent(allFiles[activeIndex - 1]);
    };

    const forwardSlide = () => {
        if (activeIndex === allFiles.length - 1) return;
        setActiveIndex(activeIndex + 1);
        setActiveContent(allFiles[activeIndex + 1]);
    };

    const getPreview = useCallback(async () => {
        start();

        try {
            const response = await axios.get(
                `/share/file/preview/${userId}?key=${getAWSKey(key, id)}`,
                {
                    responseType: 'blob',
                }
            );

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
    }, [id, key, showError, name, start, end, userId]);

    const download = useCallback(async () => {
        showResponse('Downloading...');

        try {
            const response = await axios.get(
                `/share/file/download/${userId}?key=${getAWSKey(key, id)}`,
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
    }, [id, key, name, showError, showResponse, userId]);

    // const NoPreview = (
    //     <Card
    //         sx={{
    //             bgcolor: '#4c494c',
    //             py: 2.5,
    //             mx: 1,
    //             px: 7,
    //             textAlign: 'center',
    //             borderRadius: '12px',
    //             boxShadow: ' rgba(0, 0, 0, 0.15) 0px 15px 25px, rgba(0, 0, 0, 0.05) 0px 5px 10px',
    //         }}>
    //         <Typography variant='subtitle1' mb={2} fontSize={20}>
    //             No preview available
    //         </Typography>
    //         <Button
    //             variant='contained'
    //             onClick={download}
    //             startIcon={<FileDownloadOutlinedIcon fontSize='small' />}
    //             sx={{
    //                 textTransform: 'capitalize',
    //                 px: 2.5,
    //                 py: 0.4,
    //                 fontSize: '12px',
    //             }}>
    //             Download
    //         </Button>
    //     </Card>
    // );

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
                        transition: 'all 0.3s ease-in',
                        flexWrap: 'wrap',
                    }}>
                    <Grid item xs={1} textAlign='center' display={{ xs: 'none', sm: 'block' }}>
                        <IconButton onClick={previousSlide}>
                            <ArrowBackIosNewOutlinedIcon />
                        </IconButton>
                    </Grid>

                    <Grid item xs>
                        <Box
                            display='grid'
                            alignItems='center'
                            onClick={closeModal}
                            minHeight='100vh'
                            sx={{ placeItems: 'center' }}>
                            {loaderState ? (
                                circular
                            ) : fileType === 'video' ? (
                                <video controls>
                                    <source
                                        src={`${env('FILES_SERVER')}/file/preview?key=${getAWSKey(
                                            key,
                                            id
                                        )}`}
                                    />
                                </video>
                            ) : fileType === 'audio' ? (
                                <audio controls>
                                    <source src={preview && preview[0]?.uri} />
                                </audio>
                            ) : (
                                <DocViewer
                                    documents={preview}
                                    onClick={e => e.stopPropagation()}
                                    pluginRenderers={DocViewerRenderers}
                                />
                            )}
                        </Box>
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
                        <Share
                            closeModal={closeShare}
                            selected={{ files: [id] }}
                            refresh={refresh}
                        />
                    </>
                </Modal>
            </Box>
        </ThemeProvider>
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
