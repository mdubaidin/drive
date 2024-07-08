import { Box, Button, Card, Grid, Skeleton, Stack, Tab, Tabs, Typography } from '@mui/material';
import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from './Icon';
import { getItemIds, getParentId, handleAxiosError } from '../utils/function';
import { useMessage } from '../providers/Provider';
import useLoader from '../hooks/useLoader';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';

function TabPanel(props) {
    const { children, value, index } = props;

    return (
        <div role='tabpanel' hidden={value !== index}>
            {value === index && (
                <Box p={1}>
                    <div>{children}</div>
                </Box>
            )}
        </div>
    );
}

const Move = props => {
    const { closeModal, parent, selected, selectedLength, refresh, clearAll } = props;

    const [contents, setContents] = useState(null);
    const { name, _id: contentId, key, file } = contents?.at(0) || {};
    const [tabSelected, setTabSelected] = useState(0);
    const [folders, setFolders] = useState(null);
    const [selectedToMove, setSelectedToMove] = useState({ id: '', key: '' });
    const { showError, showResponse } = useMessage();
    const { circular, start, end } = useLoader();

    const handleChange = (event, newValue) => {
        setTabSelected(newValue);
    };

    const selectedFolders = selected?.folders;

    const folderToRemove = useMemo(
        () => (selectedFolders.length ? [...selectedFolders] : [parent._id]),
        [selectedFolders, parent._id]
    );

    const getFolders = useCallback(async () => {
        setSelectedToMove('');
        try {
            const response = await axios.post(`/folder/fetch`, {
                folders: folderToRemove,
            });
            const folderToFilter = [...folderToRemove];

            parent ? folderToFilter.push(parent._id) : folderToFilter.push(getParentId(key));

            const folders = response.data.folders;
            const uniqueFolders = folders.filter(folder => !folderToFilter.includes(folder._id));

            setFolders(uniqueFolders);
        } catch (e) {
            handleAxiosError(e, showError);
        }
    }, [showError, folderToRemove, key, parent]);

    const constructKey = (key, id) => (key ? key + '/' + id : id || '');

    const moveFile = async () => {
        start();
        try {
            const response = await axios.patch('/file/move', {
                fileId: contentId,
                fileKey: key,
                destination: constructKey(selectedToMove.key, selectedToMove.id),
            });

            const { success, message } = response.data;

            if (!success) return showError(message);

            refresh();
            showResponse('File moved successfully');
        } catch (e) {
            handleAxiosError(e, showError);
        } finally {
            end();
            closeModal();
        }
    };

    const moveFolder = async () => {
        start();
        try {
            const response = await axios.patch('/folder/move', {
                folderId: contentId,
                folderKey: key,
                destination: constructKey(selectedToMove.key, selectedToMove.id),
            });

            const { success, message } = response.data;

            if (!success) return showError(message);

            refresh();
            showResponse('Folder moved successfully');
        } catch (e) {
            handleAxiosError(e, showError);
        } finally {
            end();
            closeModal();
        }
    };

    const moveSelected = async () => {
        start();

        const files = contents.filter(content => selected.files.includes(content._id));
        const folders = contents.filter(content => selected.folders.includes(content._id));

        try {
            const response = await axios.post('/action/move', {
                destination: constructKey(selectedToMove.key, selectedToMove.id),
                items: { files, folders },
            });

            const { success, errors } = response.data;

            if (!success) return showError(errors);

            refresh();
            showResponse('Items moved successfully');
        } catch (e) {
            handleAxiosError(e, showError);
        } finally {
            clearAll();
            end();
            closeModal();
        }
    };

    const fetchContents = useCallback(async () => {
        setContents(null);
        try {
            const response = await axios.post(`/file/fetch`, { itemIds: getItemIds(selected) });

            const { success, errors, files } = response.data;
            if (!success) return showError(errors);

            setContents(files);
        } catch (e) {
            handleAxiosError(e, showError);
        }
    }, [setContents, showError, selected]);

    useEffect(() => {
        fetchContents();
    }, [fetchContents]);

    useEffect(() => {
        if (tabSelected === 0) getFolders();
        return () => setFolders(null);
    }, [tabSelected, getFolders]);

    return (
        <Card
            sx={{
                boxShadow: 'rgba(0, 0, 0, 0.45) 0px 25px 20px -20px',
                borderRadius: '8px',
                maxWidth: '610px',
                width: '100%',
                minHeight: '452px',
                mx: 2,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'custom.menu',
                overflowY: 'auto',
                backgroundImage:
                    'linear-gradient(rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.12))',
            }}>
            <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
                <Typography variant='h5'>
                    Move '{selectedLength > 1 ? selectedLength + ' Items' : name}'
                </Typography>
            </Stack>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabSelected} onChange={handleChange}>
                    <Tab label='Suggested' />
                    <Tab label='All Location' />
                    {/* <Tab label='Favorite' /> */}
                </Tabs>
            </Box>
            <Box flexGrow={1} sx={{ maxHeight: '302px', overflowY: 'auto' }}>
                <TabPanel value={tabSelected} index={0}>
                    {folders ? (
                        folders.map((folder, i) => (
                            <FolderCard
                                folder={folder}
                                selected={selectedToMove.id?.includes(folder._id)}
                                setSelected={setSelectedToMove}
                                key={i}
                            />
                        ))
                    ) : (
                        <TabSkeleton />
                    )}
                </TabPanel>
                <TabPanel value={tabSelected} index={1}>
                    <Grid
                        container
                        alignItems='center'
                        columnSpacing={1}
                        py={1}
                        ml={-3}
                        pl={2}
                        sx={{
                            mb: 0.2,
                            borderTopRightRadius: '20px',
                            borderBottomRightRadius: '20px',
                            bgcolor: selectedToMove ? 'custom.selectedMove' : 'transparent',
                            '&:hover': {
                                bgcolor: selectedToMove
                                    ? 'custom.selectedMove'
                                    : 'custom.cardHover',
                            },
                        }}
                        onClick={() => setSelectedToMove({ id: null, key: '' })}>
                        <Grid item height='20px'>
                            <CloudOutlinedIcon fontSize='small' />
                        </Grid>
                        <Grid item xs sx={{ overflow: 'hidden' }}>
                            <Typography
                                variant='body2'
                                fontWeight='500'
                                sx={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    lineHeight: 1,
                                }}>
                                My Files
                            </Typography>
                        </Grid>
                    </Grid>
                </TabPanel>
                {/* <TabPanel value={tabSelected} index={2}>
                    Item Three
                </TabPanel> */}
            </Box>
            <Box textAlign='right' mt={1}>
                <Button variant='text' onClick={closeModal} sx={{ mr: 2, px: 2.5 }}>
                    Cancel
                </Button>
                <Button
                    variant='contained'
                    sx={{ px: 3.5 }}
                    disabled={!selectedToMove || Boolean(circular)}
                    endIcon={circular}
                    onClick={selected ? moveSelected : file ? moveFile : moveFolder}>
                    Move
                </Button>
            </Box>
        </Card>
    );
};

export default Move;

const FolderCard = props => {
    const { folder, selected, setSelected } = props;

    return (
        <Grid
            container
            alignItems='center'
            columnSpacing={1}
            py={1}
            ml={-3}
            pl={2}
            sx={{
                mb: 0.2,
                borderTopRightRadius: '20px',
                borderBottomRightRadius: '20px',
                bgcolor: selected ? 'custom.selectedMove' : 'transparent',
                '&:hover': { bgcolor: selected ? 'custom.selectedMove' : 'custom.cardHover' },
            }}
            onClick={() => setSelected({ id: folder._id, key: folder.key })}>
            <Grid item height='20px'>
                <Icon name='folder.png' height='20px' />
            </Grid>
            <Grid item xs sx={{ overflow: 'hidden' }}>
                <Typography
                    variant='body2'
                    fontWeight='500'
                    sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1,
                    }}>
                    {folder.name}
                </Typography>
            </Grid>
        </Grid>
    );
};

const TabSkeleton = () => {
    return (
        <Box>
            <Stack direction='row' spacing={2} mb={1} alignItems='center'>
                <Skeleton variant='text' width='20px' />
                <Skeleton variant='text' sx={{ flexGrow: 1 }} />
            </Stack>
            <Stack direction='row' spacing={2} mb={1} alignItems='center'>
                <Skeleton variant='text' width='20px' />
                <Skeleton variant='text' sx={{ flexGrow: 1 }} />
            </Stack>
            <Stack direction='row' spacing={2} mb={1} alignItems='center'>
                <Skeleton variant='text' width='20px' />
                <Skeleton variant='text' sx={{ flexGrow: 1 }} />
            </Stack>
            <Stack direction='row' spacing={2} mb={1} alignItems='center'>
                <Skeleton variant='text' width='20px' />
                <Skeleton variant='text' sx={{ flexGrow: 1 }} />
            </Stack>
            <Stack direction='row' spacing={2} mb={1} alignItems='center'>
                <Skeleton variant='text' width='20px' />
                <Skeleton variant='text' sx={{ flexGrow: 1 }} />
            </Stack>
        </Box>
    );
};
