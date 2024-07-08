import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import useMedia from './../hooks/useMedia';

//mui component
import {
    Typography,
    Box,
    Grid,
    IconButton,
    Stack,
    Button,
    Modal,
    Card,
    MenuItem,
    Divider,
    ListItemIcon,
    Menu,
} from '@mui/material';
import axios from 'axios';
import FolderCard from '../components/folder/FolderCard';
import Image from '../components/Image';
import useModal from '../hooks/useModal';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Done from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import RestoreIcon from '@mui/icons-material/Restore';
import { useMessage } from '../providers/Provider';
import { handleAxiosError } from '../utils/function';
import useLoader from '../hooks/useLoader';
import Select from '../components/Select';
import { Types } from '../data/filters';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import Icon from '../components/Icon';
import PageLoading from '../components/PageLoading';
import FileCard from '../components/files/FileCard';
import { useMenu } from '../hooks/useMenu';

const initialSelection = { files: [], folders: [] };

const Trash = () => {
    const [detailsPanel, setDetailsPanel] = useState(null);
    const xmLayout = useMedia('(max-width: 1024px)');
    const [trash, setTrash] = useState(null);
    const [selected, setSelected] = useState(initialSelection);
    const { modalState, closeModal, openModal } = useModal();
    const { circular, start, end } = useLoader();
    const { showError, showResponse } = useMessage();
    const [filter, setFilter] = useState({ type: '', sort: '', direction: -1, modified: '' });
    const [dateInterval, setDateInterval] = useState({ from: '', to: '' });
    const {
        modalState: dateRangeState,
        closeModal: closeDateRange,
        openModal: openDateRange,
    } = useModal();
    const { anchorEl: anchorElSort, openMenu: openSortMenu, closeMenu: closeSortMenu } = useMenu();

    useMemo(() => xmLayout && setDetailsPanel(false), [xmLayout]);

    const columns = useCallback(
        function () {
            return {
                xs: 12,
                sm: 6,
                md: 4,
                xm: detailsPanel ? 6 : 4,
                lg: detailsPanel ? 4 : 3,
                xl: detailsPanel ? 3 : 2.4,
                xxl: detailsPanel ? 2.4 : 2,
            };
        },
        [detailsPanel]
    );

    const filterOptions = useMemo(
        () => [
            { name: 'Today', value: 'today' },
            { name: 'This week', value: 'week' },
            { name: 'This month', value: 'month' },
            { name: 'This year', value: 'year' },
        ],
        []
    );

    const updateSelectedFiles = useCallback(
        (checked, id, selection) => {
            if (selection === 'one') {
                return setSelected({ ...selected, files: [id] });
            }

            if (checked) {
                setSelected({ folders: [], files: [...selected.files, id] });
            } else {
                const newSelection = [...selected.files];
                newSelection.splice(selected.files.indexOf(id), 1);
                setSelected({ ...selected, files: newSelection });
            }
        },
        [selected]
    );

    const updateSelectedFolders = useCallback(
        (checked, id, selection) => {
            if (selection === 'one') {
                return setSelected({ files: [], folders: [id] });
            }

            if (checked) {
                setSelected({ ...selected, folders: [...selected.folders, id] });
            } else {
                const newSelection = [...selected.folders];
                newSelection.splice(selected.folders.indexOf(id), 1);
                setSelected({ ...selected, folders: newSelection });
            }
        },
        [selected]
    );

    const selectAll = () => {
        const selectedFiles = trash.files.map(file => file._id);
        const selectedFolders = trash.folders.map(folder => folder._id);

        setSelected({ files: selectedFiles, folders: selectedFolders });
    };

    const clearAll = () => setSelected(initialSelection);

    const getTrash = useCallback(
        async (filter = {}) => {
            const { modified, type, custom, sort, direction } = filter;
            setTrash(null);

            try {
                const response = await axios.get(
                    `/trash?type=${type || ''}&modified=${modified || ''}&sort=${
                        sort || ''
                    }&direction=${direction}${
                        custom ? `&from=${custom.from.$d}&to=${custom.to.$d}` : ''
                    }`
                );
                const files = [];
                const folders = [];
                response.data.contents.forEach(object => {
                    if (object.file === true) return files.push(object);
                    folders.push(object);
                });

                setTrash({ files, folders });
            } catch (e) {
                handleAxiosError(e, showError);
            }
        },
        [showError]
    );

    const restoreSelected = useCallback(async () => {
        const items = {
            files: selected.files,
            folders: selected.folders,
        };

        try {
            const response = await axios.post('/trash/restore', {
                items,
            });

            const { success, message } = response.data;

            if (!success) showError(message);

            getTrash();
            clearAll();
            showResponse('Items restored');
        } catch (e) {
            handleAxiosError(e, showError);
        }
    }, [selected, showError, getTrash, showResponse]);

    const deleteSelected = useCallback(async () => {
        const items = {
            files: trash.files.filter(file => selected.files.includes(file._id)),
            folders: trash.folders.filter(folder => selected.folders.includes(folder._id)),
        };
        showResponse('Working...');

        try {
            const response = await axios.patch('/trash/delete', {
                items,
            });

            const { success, message } = response.data;

            if (!success) showError(message);

            getTrash();
            clearAll();
            showResponse('Items deleted');
        } catch (e) {
            handleAxiosError(e, showError);
        }
    }, [trash, selected, showError, getTrash, showResponse]);

    const isItemsSelected = () => selected.files.length || selected.folders.length || null;
    const selectedLength = selected.files.length + selected.folders.length;

    const emptyTrash = useCallback(async () => {
        start();

        try {
            await axios.patch('/trash/empty');
            getTrash();
        } catch (e) {
            handleAxiosError(e, showError);
        } finally {
            end();
            clearAll();
            closeModal();
        }
    }, [closeModal, getTrash, showError, start, end]);

    useEffect(() => {
        getTrash(filter);
    }, [getTrash, filter]);

    return (
        <Box>
            <Grid
                container
                sx={{
                    overflow: 'hidden',
                    transition: 'all 0.3s ease-in',
                }}>
                <Grid
                    item
                    xs
                    sx={{
                        height: { xs: 'calc(100dvh - 85px)', md: 'calc(100dvh - 90px)' },
                        backgroundColor: 'background.main',
                        borderRadius: '12px',
                    }}>
                    <>
                        <Box position='sticky' px={2} pt={2}>
                            <Grid container alignItems='center' mb={1} width='100%'>
                                <Grid item xs>
                                    <Typography variant='h5' color='text.primary' py={0.9}>
                                        Trash
                                    </Typography>
                                </Grid>
                                {isItemsSelected() && (
                                    <Grid item>
                                        <Button
                                            variant='text'
                                            sx={{
                                                color: 'text.primary',
                                                display: { xs: 'none', xm: 'block' },
                                            }}
                                            onClick={selectAll}>
                                            Select All
                                        </Button>
                                    </Grid>
                                )}
                                <Grid item sx={{ display: { xs: 'block', sm: 'none' } }}>
                                    <IconButton sx={{ p: 0 }} onClick={openSortMenu}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                            <Box display={{ xs: 'none', sm: 'block' }}>
                                {isItemsSelected() ? (
                                    <Box
                                        bgcolor='custom.selectedPanel'
                                        borderRadius='50px'
                                        mb={1}
                                        minHeight='36px'>
                                        <Grid container alignItems='center' columnSpacing={1.5}>
                                            <Grid item>
                                                <IconButton onClick={clearAll}>
                                                    <CloseIcon fontSize='small' />
                                                </IconButton>
                                            </Grid>
                                            <Grid item>
                                                <Typography
                                                    variant='body2'
                                                    fontWeight={500}
                                                    lineHeight={0}>
                                                    {selectedLength} selected
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <IconButton onClick={restoreSelected}>
                                                    <RestoreIcon fontSize='small' />
                                                </IconButton>
                                            </Grid>
                                            <Grid item>
                                                <IconButton onClick={deleteSelected}>
                                                    <DeleteIcon fontSize='small' />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                ) : (
                                    <Stack direction='row' mb={1} columnGap={1.5} minHeight='36px'>
                                        <Select
                                            displayEmpty
                                            value={filter.type}
                                            onChange={e => {
                                                setFilter({ ...filter, type: e.target.value });
                                            }}
                                            filter={filter.type}
                                            clear={() => setFilter({ ...filter, type: '' })}
                                            renderValue={v => {
                                                if (!filter.type) return 'Type';
                                                return v;
                                            }}>
                                            {Types.map(type => (
                                                <MenuItem
                                                    sx={{ p: 1 }}
                                                    key={type.value}
                                                    value={type.value}>
                                                    <ListItemIcon>
                                                        <Icon name={type.icon} height='20px' />
                                                    </ListItemIcon>
                                                    <Typography variant='body2'>
                                                        {type.name}
                                                    </Typography>
                                                </MenuItem>
                                            ))}
                                        </Select>

                                        <Select
                                            displayEmpty
                                            onChange={e => {
                                                setFilter({ ...filter, modified: e.target.value });
                                            }}
                                            value={filter.modified}
                                            filter={filter.modified}
                                            clear={() => setFilter({ ...filter, modified: '' })}
                                            renderValue={v => {
                                                if (!filter.modified) return 'Modified';
                                                return v;
                                            }}>
                                            {filterOptions.map(item => (
                                                <MenuItem key={item.name} value={item.value}>
                                                    {item.name}
                                                </MenuItem>
                                            ))}
                                            <MenuItem onMouseDown={openDateRange}>
                                                Custom date range
                                            </MenuItem>
                                            <Modal
                                                open={dateRangeState}
                                                onClose={closeDateRange}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}>
                                                <Card sx={{ p: 2 }}>
                                                    <Typography variant='h6'>
                                                        Custom range
                                                    </Typography>
                                                    <LocalizationProvider
                                                        dateAdapter={AdapterDayjs}>
                                                        <Divider sx={{ my: 2 }} />
                                                        <Box px={1}>
                                                            <Typography
                                                                variant='body2'
                                                                color='text.tertiary'
                                                                fontWeight={500}
                                                                gutterBottom>
                                                                From
                                                            </Typography>
                                                            <DatePicker
                                                                slotProps={{
                                                                    textField: { size: 'small' },
                                                                }}
                                                                value={dateInterval.from}
                                                                onChange={value =>
                                                                    setDateInterval({
                                                                        ...dateInterval,
                                                                        from: value,
                                                                    })
                                                                }
                                                            />
                                                            <Typography
                                                                variant='body2'
                                                                color='text.tertiary'
                                                                fontWeight={500}
                                                                gutterBottom>
                                                                To
                                                            </Typography>
                                                            <DatePicker
                                                                slotProps={{
                                                                    textField: { size: 'small' },
                                                                }}
                                                                value={dateInterval.to}
                                                                onChange={value =>
                                                                    setDateInterval({
                                                                        ...dateInterval,
                                                                        to: value,
                                                                    })
                                                                }
                                                            />
                                                        </Box>
                                                        <Divider variant='middle' />
                                                        <Box mt={1.5} textAlign='right' px={1}>
                                                            <Button
                                                                variant='outlined'
                                                                size='small'
                                                                sx={{
                                                                    p: '3px 14px',
                                                                    fontSize: '12px',
                                                                }}
                                                                disabled={
                                                                    !(
                                                                        dateInterval.from &&
                                                                        dateInterval.to
                                                                    )
                                                                }
                                                                onClick={() => {
                                                                    setFilter({
                                                                        ...filter,
                                                                        modified: 'custom',
                                                                        custom: dateInterval,
                                                                    });
                                                                    closeDateRange();
                                                                }}>
                                                                Apply
                                                            </Button>
                                                        </Box>
                                                    </LocalizationProvider>
                                                </Card>
                                            </Modal>
                                        </Select>
                                    </Stack>
                                )}
                            </Box>
                            {trash?.folders.length || trash?.files.length ? (
                                <Grid
                                    container
                                    justifyContent='space-between'
                                    alignItems='center'
                                    p={1}
                                    mb={1}
                                    bgcolor='custom.trashCaption'
                                    borderRadius='8px'>
                                    <Grid item xs={12} sm>
                                        <Typography
                                            variant='subtitle2'
                                            color='text.primary'
                                            fontSize={{ xs: 14, md: 15 }}>
                                            {xmLayout
                                                ? 'Items are deleted forever after 30 days.'
                                                : 'Items in the trash will be deleted forever after 30 days'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm='auto' textAlign={{ sm: 'right' }}>
                                        <Button
                                            variant='text'
                                            sx={{
                                                color: 'text.primary',
                                                p: { xs: 0, sm: 1 },
                                                '&:hover': {
                                                    color: 'primary.main',
                                                    background: 'transparent',
                                                },
                                            }}
                                            onClick={openModal}>
                                            Empty trash
                                        </Button>
                                    </Grid>
                                </Grid>
                            ) : null}
                        </Box>
                        <PageLoading condition={trash}>
                            <Box
                                sx={{ height: 'calc(100% - 170px)', overflowY: 'auto', p: 2 }}
                                onClick={clearAll}>
                                {trash?.folders.length ? (
                                    <>
                                        <Typography
                                            variant='subtitle1'
                                            fontWeight='500'
                                            mb={2}
                                            color='text.secondary'>
                                            Folders
                                        </Typography>
                                        <Grid container spacing={1.5} mb={2}>
                                            {trash.folders.map((folder, i) => (
                                                <Grid item {...columns()} key={i}>
                                                    <FolderCard
                                                        folder={folder}
                                                        changeSelected={updateSelectedFolders}
                                                        selected={selected.folders.includes(
                                                            folder._id
                                                        )}
                                                        disabled={selectedLength > 1}
                                                        clearAll={clearAll}
                                                        refresh={getTrash}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </>
                                ) : null}

                                {trash?.files.length ? (
                                    <>
                                        <Typography
                                            variant='subtitle1'
                                            fontWeight='500'
                                            mt={4}
                                            mb={2}
                                            color='text.secondary'>
                                            Files
                                        </Typography>
                                        <Grid container spacing={1.5} mb={3}>
                                            {trash.files.map((file, i) => (
                                                <Grid item {...columns()} key={i}>
                                                    <FileCard
                                                        file={file}
                                                        changeSelected={updateSelectedFiles}
                                                        selected={selected.files.includes(file._id)}
                                                        disabled={selectedLength > 1}
                                                        clearAll={clearAll}
                                                        refresh={getTrash}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </>
                                ) : null}
                                {trash?.folders.length || trash?.files.length ? null : (
                                    <Stack
                                        direction='column'
                                        justifyContent='center'
                                        alignItems='center'
                                        height='100%'>
                                        <Image name='empty-trash.svg' height='200px' />
                                        <Typography variant='h6' mt={2}>
                                            Trash is empty
                                        </Typography>
                                        <Typography variant='body2' mt={1} color='text.secondary'>
                                            Items moved to the trash will be deleted after 30 days
                                        </Typography>
                                    </Stack>
                                )}
                            </Box>
                        </PageLoading>
                    </>
                </Grid>
            </Grid>

            {/* Menu */}
            <Menu
                anchorEl={anchorElSort}
                open={Boolean(anchorElSort)}
                onClose={closeSortMenu}
                sx={{ '.MuiPaper-root.MuiMenu-paper.MuiPopover-paper': { width: '180px' } }}>
                <MenuItem
                    onClick={() => {
                        closeSortMenu();
                        setFilter({ ...filter, sort: 'name' });
                    }}>
                    Name{' '}
                    {filter.sort === 'name' ? (
                        <Done fontSize='small' sx={{ color: 'green', ml: 'auto' }} />
                    ) : null}
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        closeSortMenu();
                        setFilter({ ...filter, sort: 'size' });
                    }}>
                    Storage used{' '}
                    {filter.sort === 'size' ? (
                        <Done fontSize='small' sx={{ color: 'green', ml: 'auto' }} />
                    ) : null}
                </MenuItem>
                <Divider variant='middle' />
                <MenuItem
                    onClick={() => {
                        closeSortMenu();
                        setFilter({ ...filter, direction: 1 });
                    }}>
                    Ascending{' '}
                    {filter.direction === 1 ? (
                        <Done fontSize='small' sx={{ color: 'green', ml: 'auto' }} />
                    ) : null}
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        closeSortMenu();
                        setFilter({ ...filter, direction: -1 });
                    }}>
                    Descending{' '}
                    {filter.direction === -1 ? (
                        <Done fontSize='small' sx={{ color: 'green', ml: 'auto' }} />
                    ) : null}
                </MenuItem>
            </Menu>

            <Modal
                open={modalState}
                onClose={closeModal}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <Card
                    sx={{
                        boxShadow: 'rgba(0, 0, 0, 0.45) 0px 25px 20px -20px',
                        borderRadius: '8px',
                        maxWidth: '500px',
                        width: '100%',
                        mx: 2,
                        p: 3,
                    }}>
                    <Typography variant='h5'>Delete forever ?</Typography>

                    <Typography variant='body2' mt={3} mb={2}>
                        All items in the trash will be deleted and you won't be able to <br />{' '}
                        restore them.
                    </Typography>
                    <Box sx={{ float: 'right' }}>
                        <Button variant='text' onClick={closeModal} sx={{ mr: 2 }}>
                            Cancel
                        </Button>
                        <Button
                            variant='contained'
                            onClick={emptyTrash}
                            endIcon={circular}
                            disabled={Boolean(circular)}>
                            Delete forever
                        </Button>
                    </Box>
                </Card>
            </Modal>
        </Box>
    );
};

export default memo(Trash);
