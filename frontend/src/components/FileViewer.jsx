import {
    AppBar,
    Avatar,
    Box,
    Button,
    Divider,
    Drawer,
    Grid,
    IconButton,
    Menu,
    Stack,
    ThemeProvider,
    Toolbar,
    Typography,
    createTheme,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import React, { useCallback, useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useMenu } from '../hooks/useMenu';
import { env, getFileIcon, handleAxiosError, parseKB } from '../utils/function';
import { Link, useParams } from 'react-router-dom';
import Icon from './Icon';
import useMedia from '../hooks/useMedia';
import axios from 'axios';
import AuthorizationProvider, { useUser } from '../hooks/Authorize';
import PageLoading from './PageLoading';
import Error from './Error';
import Image from './Image';
import { getCookie } from '../utils/cookies';
import useLoader from '../hooks/useLoader';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import Provider, { useMessage } from '../providers/Provider';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#3B84D9',
        },
    },
});

const FileViewer = ({ access }) => {
    const [detailsPanel, setDetailsPanel] = useState(false);
    const [user, setUser] = useState(null);
    const xmLayout = useMedia('(max-width: 1024px)');
    const [file, setFile] = useState(null);
    const [error, setError] = useState(false);
    const [preview, setPreview] = useState([]);
    const { circular, start, end, loaderState } = useLoader({ size: 56, color: 'primary.main' });
    const authUser = useUser();
    const { showError, showResponse } = useMessage();
    const {
        anchorEl: anchorElProfile,
        openMenu: openProfileMenu,
        closeMenu: closeProfileMenu,
    } = useMenu();
    const { id } = useParams();

    const detailsPanelOpen = () => setDetailsPanel(true);

    const detailsPanelClose = () => setDetailsPanel(false);

    const getPublicFile = useCallback(async () => {
        try {
            const response = await axios.get(`/open/file/${id}`);

            setFile(response.data.file);
        } catch (e) {
            handleAxiosError(e, showError);
        }
    }, [showError, id]);

    const getAWSKey = (key, id) => (key ? encodeURIComponent(key + '/' + id) : id);

    const getPreview = useCallback(async () => {
        start();

        try {
            const response = access
                ? await axios.get(`/open/file-preview/${id}?key=${getAWSKey(file?.key, id)}`, {
                      responseType: 'blob',
                  })
                : await axios.get(`/file/preview?key=${getAWSKey(file?.key, id)}`, {
                      responseType: 'blob',
                  });

            setPreview([
                {
                    uri: window.URL.createObjectURL(response.data),
                    fileType: file?.name.match(/.[a-zA-Z0-9]+$/)[0].slice(1),
                },
            ]);
        } catch (e) {
            handleAxiosError(e, showError);
        } finally {
            end();
        }
    }, [id, file, showError, start, end, access]);

    const getFile = useCallback(async () => {
        try {
            const response = await axios.get(`/share/file/${id}?user=${authUser?._id}`);

            const { errors, success } = response.data;

            if (!success) {
                showError(errors);
                return setError(true);
            }

            setFile(response.data.file);
        } catch (e) {
            handleAxiosError(e, showError);
        }
    }, [showError, id, authUser]);

    const download = useCallback(async () => {
        showResponse('Downloading...');

        try {
            const response = access
                ? await axios.get(`/open/file-download/${id}?key=${getAWSKey(file?.key, id)}`, {
                      responseType: 'blob',
                  })
                : await axios.get(`/file/download?key=${getAWSKey(file?.key, id)}`, {
                      responseType: 'blob',
                  });

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = file?.name;
            document.body.appendChild(link);
            link.click();
            showResponse(`${file?.name} is downloaded successfully`);

            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (e) {
            handleAxiosError(e, showError);
        }
    }, [id, file, showError, showResponse, access]);

    const getProfile = useCallback(async () => {
        const role = getCookie('role');
        const accessToken = getCookie('accessToken');

        if (!(accessToken && role)) return;

        try {
            const response = await axios.get(`/${role}/profile`, {
                baseURL: env('AUTHENTICATION_SERVER'),
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const user = response.data.user;
            setUser(user);
        } catch (err) {
            console.log(err);
        }
    }, [setUser]);

    useEffect(() => {
        if (access) getProfile();
    }, [getProfile, access]);

    useEffect(() => {
        if (access) getPublicFile();
        else getFile();
    }, [access, getFile, getPublicFile]);

    useEffect(() => {
        getPreview();
    }, [getPreview]);

    return (
        <ThemeProvider theme={theme}>
            {file ? (
                <Box
                    sx={{ bgcolor: '#303030', minHeight: '100dvh' }}
                    display='flex'
                    flexDirection='column'>
                    <AppBar
                        elevation={0}
                        component={Box}
                        position='fixed'
                        sx={{
                            backgroundColor: 'transparent',
                            color: 'text.primary',
                        }}>
                        <Toolbar
                            sx={{
                                flexDirection: 'column',
                                justifyContent: 'center',
                                position: 'relative',
                                '&': {
                                    minHeight: '64px',
                                },
                            }}>
                            <Grid container alignItems='center' pacing={1}>
                                <Grid item xs={6} md={10}>
                                    <Box
                                        component={Link}
                                        to='/'
                                        sx={{ textDecoration: 'none', color: 'text.primary' }}>
                                        <Image
                                            cdn='files/logo/2023/files-text.png'
                                            sx={{ height: '50px' }}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={6} md={2} textAlign={'right'}>
                                    {authUser || user ? (
                                        <>
                                            <IconButton
                                                onClick={openProfileMenu}
                                                sx={{
                                                    borderWidth: '2px',
                                                    borderStyle: 'solid',
                                                    borderColor: 'primary.main',
                                                    p: '3px',
                                                }}>
                                                <Avatar
                                                    alt='Remy Sharp'
                                                    src='data:image/jpeg;base64,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'
                                                    sx={{ width: 30, height: 30 }}
                                                />
                                            </IconButton>

                                            <Menu
                                                anchorEl={anchorElProfile}
                                                open={Boolean(anchorElProfile)}
                                                onClose={closeProfileMenu}
                                                sx={{
                                                    '.MuiPaper-root.MuiMenu-paper.MuiPopover-paper':
                                                        {
                                                            width: 'min(100%, 320px)',
                                                            boxShadow:
                                                                'rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px',
                                                            border: '1px solid #00000017',
                                                            bgcolor: 'custom.menu',
                                                            px: 0.5,
                                                            pt: 1.5,
                                                        },
                                                }}>
                                                <Grid
                                                    container
                                                    spacing={2}
                                                    alignItems='center'
                                                    flexWrap='nowrap'>
                                                    <Grid item>
                                                        <Avatar
                                                            alt='Remy Sharp'
                                                            src='https://shorturl.at/fjqz9'
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
                                                            {user
                                                                ? user.firstName +
                                                                  ' ' +
                                                                  user.lastName
                                                                : authUser.firstName +
                                                                  ' ' +
                                                                  authUser.lastName}
                                                        </Typography>
                                                        <Typography
                                                            variant='caption'
                                                            component='div'
                                                            sx={{
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }}>
                                                            {user ? user.email : authUser.email}
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
                                            </Menu>
                                        </>
                                    ) : (
                                        <Button
                                            variant='contained'
                                            sx={{
                                                textTransform: 'capitalize',
                                                px: { xs: 2.4, sm: 3 },
                                            }}
                                            href={
                                                env('AUTHENTICATION_CLIENT') +
                                                '/login?redirectto=' +
                                                encodeURIComponent(window.location.href)
                                            }>
                                            Sign in
                                        </Button>
                                    )}
                                </Grid>
                                <Grid item xs>
                                    <Stack
                                        direction='row'
                                        alignItems='center'
                                        spacing={1}
                                        ml={2}
                                        mt={2}>
                                        <Icon
                                            name={
                                                file?.mimetype ? getFileIcon(file.name) : 'file.png'
                                            }
                                            height='25px'
                                        />
                                        <Typography
                                            variant='h6'
                                            fontWeight='400'
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                lineHeight: 1,
                                            }}>
                                            {file?.name}
                                        </Typography>
                                    </Stack>
                                </Grid>
                                <Grid item>
                                    <Stack
                                        direction='row'
                                        alignItems='center'
                                        justifyContent='flex-end'
                                        mt={1}>
                                        <IconButton onClick={download}>
                                            <FileDownloadOutlinedIcon />
                                        </IconButton>
                                        <IconButton onClick={detailsPanelOpen}>
                                            <InfoIcon />
                                        </IconButton>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Toolbar>
                    </AppBar>
                    <Grid
                        container
                        flexGrow={1}
                        sx={{
                            overflow: 'hidden',
                            transition: 'all 0.3s ease-in',
                        }}>
                        <Grid item xs display='flex' justifyContent='center' alignItems='center'>
                            {/* <Card
                                sx={{
                                    bgcolor: '#4c494c',
                                    py: 2.5,
                                    mx: 1,
                                    px: 7,
                                    textAlign: 'center',
                                    borderRadius: '12px',
                                    boxShadow:
                                        ' rgba(0, 0, 0, 0.15) 0px 15px 25px, rgba(0, 0, 0, 0.05) 0px 5px 10px',
                                }}>
                                <Typography variant='subtitle1' mb={2} fontSize={20}>
                                    No preview available
                                </Typography>
                                <Button
                                    variant='contained'
                                    onClick={() => {
                                        access ? publicDownload() : download();
                                    }}
                                    startIcon={<FileDownloadOutlinedIcon fontSize='small' />}
                                    sx={{
                                        textTransform: 'capitalize',
                                        px: 2.5,
                                        py: 0.4,
                                        fontSize: '12px',
                                    }}>
                                    Download
                                </Button>
                            </Card> */}

                            <Box
                                display='grid'
                                alignItems='center'
                                minHeight='100vh'
                                sx={{ placeItems: 'center' }}>
                                {loaderState ? (
                                    circular
                                ) : file?.fileType === 'video' ? (
                                    <video controls>
                                        <source
                                            // src={`${env('FILES_SERVER')}/file/preview?key=${getAWSKey(
                                            //     key,
                                            //     id
                                            // )}`}
                                            src={preview && preview[0]?.uri}
                                        />
                                    </video>
                                ) : file?.fileType === 'audio' ? (
                                    <audio controls>
                                        <source src={preview && preview[0]?.uri} />
                                    </audio>
                                ) : (
                                    <DocViewer
                                        documents={preview}
                                        pluginRenderers={DocViewerRenderers}
                                        // config={{
                                        //     noRenderer: { overrideComponent: memo(NoPreview) },
                                        // }}
                                    />
                                )}
                            </Box>
                        </Grid>
                        {file && (
                            <DetailsPanel
                                details={file}
                                detailsPanelClose={detailsPanelClose}
                                detailsPanel={detailsPanel}
                                xmLayout={xmLayout}
                            />
                        )}
                    </Grid>
                </Box>
            ) : error ? (
                <Error
                    error={'You may require permission from the owner to access the file.'}
                    title='You need access'
                />
            ) : (
                <PageLoading condition={file} height={'100vh'} />
            )}
        </ThemeProvider>
    );
};

const Authorize = () => {
    const [access, setAccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const { id } = useParams();

    const getAccess = useCallback(async () => {
        try {
            const response = await axios.get(`/open/access/${id}`);

            setAccess(response.data.access);
            if (!response.data.access) setLoading(true);
        } catch (e) {
            console.log(e);
        }
    }, [id]);

    useEffect(() => {
        getAccess();
    }, [getAccess]);

    return (
        <PageLoading condition={access || loading}>
            <Provider>
                {access ? (
                    <FileViewer access={access} />
                ) : (
                    <AuthorizationProvider>
                        <FileViewer access={access} />
                    </AuthorizationProvider>
                )}
            </Provider>
        </PageLoading>
    );
};

const DetailsPanel = props => {
    const { details, detailsPanel, detailsPanelClose, xmLayout } = props;

    return xmLayout ? (
        <Drawer
            anchor='bottom'
            open={detailsPanel}
            onClose={detailsPanelClose}
            sx={{
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
                            <Icon name={getFileIcon(details.name)} height='20px' sx={{ mr: 1 }} />
                            <Typography
                                variant='subtitle1'
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
                    <Typography variant='subtitle1' fontWeight={500} mb={1}>
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
                            <Typography variant='body2' fontSize={11} mb={2}>
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
                            <Typography variant='body2' fontSize={11} mb={2}>
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
                            <Typography variant='body2' fontSize={11} mb={2}>
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
                            <Typography variant='body2' fontSize={11} mb={2}>
                                {new Date(details.createdAt).toDateString()}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant='subtitle1' fontWeight={500} mt={2} gutterBottom>
                        Sharing
                    </Typography>
                    <Typography variant='body2' mb={2}>
                        {details.email}
                    </Typography>
                </Box>
            )}
        </Drawer>
    ) : (
        <Grid
            item
            sx={{
                width: detailsPanel ? '310px' : '0px',
                transform: detailsPanel ? 'transform(0)' : 'translateX(280px)',
                ml: detailsPanel ? 1.5 : 0,
                transition: '0.2s ease-in',
                transitionProperty: 'width, transform',
                height: 'calc(100vh - 120px)',
                m: 2,
                mt: 'auto',
                backgroundColor: 'background.default',
                borderRadius: '12px',
                overflowY: 'auto',
            }}>
            {details && (
                <Box p={2}>
                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                        <Box display='inline-flex' alignItems='center' overflow='hidden'>
                            <Icon name={getFileIcon(details.name)} height='20px' sx={{ mr: 1 }} />
                            <Typography
                                variant='subtitle1'
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
                    <Typography variant='subtitle1' fontWeight={500} mb={1}>
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
                            <Typography variant='body2' fontSize={11} mb={2}>
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
                            <Typography variant='body2' fontSize={11} mb={2}>
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
                            <Typography variant='body2' fontSize={11} mb={2}>
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
                            <Typography variant='body2' fontSize={11} mb={2}>
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
                            <Typography variant='body2' fontSize={11} mb={2}>
                                {new Date(details.createdAt).toDateString()}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant='subtitle1' fontWeight={500} mt={2} gutterBottom>
                        Sharing
                    </Typography>
                    <Typography variant='body2' mb={2}>
                        {details.email}
                    </Typography>
                </Box>
            )}
        </Grid>
    );
};

export default Authorize;
