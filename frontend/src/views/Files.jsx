import { Box, Grid } from '@mui/material';

import React, { useCallback, useEffect, useState } from 'react';
import { getAWSKey } from '../utils/function';
import { useOutletContext, useParams } from 'react-router-dom';
import useMedia from '../hooks/useMedia';
import axios from 'axios';
import PageLoading from '../components/PageLoading';
import Error from '../components/Error';
import useLoader from '../hooks/useLoader';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';

import DetailPanel from './components/DetailPanel';
import Header from './components/Header';
import useErrorHandler from '../hooks/useErrorHandler';

const Files = () => {
    const [detailsPanel, setDetailsPanel] = useState(false);
    const xmLayout = useMedia('(max-width: 1024px)');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const { circular, start, end, loaderState } = useLoader({ size: 56, color: 'primary.main' });
    const authUser = useAuthUser() || {};
    const errorHandler = useErrorHandler();
    const [error, setError] = useState(false);
    const access = useOutletContext();

    const { id } = useParams();

    const detailsPanelOpen = () => setDetailsPanel(true);

    const detailsPanelClose = () => setDetailsPanel(false);

    const getPublicFile = useCallback(async () => {
        try {
            const response = await axios.get(`/open/files/${id}`);

            setFile(response.data.file);
        } catch (e) {
            errorHandler(e);
        }
    }, [errorHandler, id]);

    const getPreview = useCallback(async () => {
        start();

        try {
            const key = getAWSKey(file?.key, id);

            const response = access
                ? await axios.get(`/open/files/preview/${id}?key=${key}`, { responseType: 'blob' })
                : await axios.get(`/file/preview?key=${key}`, { responseType: 'blob' });

            setPreview([
                {
                    uri: window.URL.createObjectURL(response.data),
                    fileType: file?.name.match(/.[a-zA-Z0-9]+$/)[0].slice(1),
                },
            ]);
        } catch (e) {
            errorHandler(e);
        } finally {
            end();
        }
    }, [id, file, errorHandler, start, end, access]);

    const getFile = useCallback(async () => {
        try {
            const response = await axios.get(`/share/file/${id}?user=${authUser?._id}`);

            if (!response.data.success) {
                return setError(true);
            }

            setFile(response.data.file);
        } catch (e) {
            errorHandler(e);
            setError(true);
        }
    }, [errorHandler, id, authUser._id]);

    useEffect(() => {
        if (access) getPublicFile();
        else getFile();
    }, [access, getFile, getPublicFile]);

    useEffect(() => {
        getPreview();
    }, [getPreview]);

    return (
        <>
            {file ? (
                <Box
                    sx={{ bgcolor: 'background.default', minHeight: '100dvh' }}
                    display='flex'
                    flexDirection='column'>
                    <Header access={access} file={file} detailsPanelOpen={detailsPanelOpen} />

                    <Grid
                        container
                        flexGrow={1}
                        sx={{
                            overflow: 'hidden',
                            transition: 'all 0.3s ease-in',
                        }}>
                        <Grid item xs display='flex' justifyContent='center' alignItems='center'>
                            <Box
                                display='grid'
                                alignItems='center'
                                minHeight='100vh'
                                sx={{ placeItems: 'center' }}>
                                {loaderState ? (
                                    circular
                                ) : file?.fileType === 'video' ? (
                                    <video controls>
                                        <source src={preview && preview[0]?.uri} />
                                    </video>
                                ) : file?.fileType === 'audio' ? (
                                    <audio controls>
                                        <source src={preview && preview[0]?.uri} />
                                    </audio>
                                ) : (
                                    <DocViewer
                                        documents={preview}
                                        pluginRenderers={DocViewerRenderers}
                                    />
                                )}
                            </Box>
                        </Grid>
                        {file && (
                            <DetailPanel
                                details={file}
                                detailsPanelClose={detailsPanelClose}
                                detailsPanel={detailsPanel}
                                xmLayout={xmLayout}
                            />
                        )}
                    </Grid>
                </Box>
            ) : error ? (
                <Error error={'You may require permission from the owner to access the file.'} />
            ) : (
                <PageLoading condition={file} height={'100vh'} />
            )}
        </>
    );
};

export default Files;
