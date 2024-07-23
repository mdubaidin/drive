import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import useMedia from './../hooks/useMedia';

//mui component
import {
    Typography,
    Box,
    Grid,
    IconButton,
    Button,
    Stack,
    MenuItem,
    Modal,
    ListItemIcon,
    Divider,
    Card,
    Tooltip,
    Menu,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import FileCard from './files/FileCard';
import axios from 'axios';
import FolderCard from './folder/FolderCard';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import DetailsPanel from '../components/DetailsPanel';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Done from '@mui/icons-material/Done';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { useMessage } from '../providers/Provider';
import useModal from '../hooks/useModal';
import Move from './Move';
import { Types } from '../data/filters';
import Icon from './Icon';
import Select from './Select';
import { useLocation } from 'react-router-dom';
import PageLoading from './PageLoading';
import Share from './Share';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useMenu } from '../hooks/useMenu';
import { handleAxiosError } from '../utils/function';
import Image from './Image';

const initialSelection = { files: [], folders: [] };

const Main = props => {
    const {
        files,
        folders,
        filesByDate,
        title,
        refresh,
        content,
        defaultImage,
        defaultTitle,
        defaultCaption,
    } = props.data;
    const [detailsPanel, setDetailsPanel] = useState(null);
    const [details, setDetails] = useState({});
    const [selected, setSelected] = useState(initialSelection);
    const [filter, setFilter] = useState({ type: '', sort: '', direction: -1, modified: '' });
    const [dateInterval, setDateInterval] = useState({ from: null, to: null });

    const { modalState: moveState, closeModal: closeMove, openModal: openMove } = useModal();
    const { modalState: shareState, closeModal: closeShare, openModal: openShare } = useModal();
    const {
        modalState: dateRangeState,
        closeModal: closeDateRange,
        openModal: openDateRange,
    } = useModal();
    const {
        anchorEl: optionAnchorEl,
        openMenu: openOptionMenu,
        closeMenu: closeOptionMenu,
    } = useMenu();

    const xmLayout = useMedia('(max-width: 1024px)');
    const { showError, showResponse } = useMessage();
    const location = useLocation();
    const { anchorEl: anchorElSort, openMenu: openSortMenu, closeMenu: closeSortMenu } = useMenu();

    useMemo(() => xmLayout && setDetailsPanel(false), [xmLayout]);

    const fileDetailsPanelOpen = () => setDetailsPanel('file');

    const folderDetailsPanelOpen = () => setDetailsPanel('folder');

    const detailsPanelClose = () => setDetailsPanel(null);

    const columns = useCallback(
        function () {
            return {
                xs: 12,
                sm: 6,
                md: 4,
                xm: detailsPanel ? 12 : 6,
                lg: detailsPanel ? 6 : 4,
                xlg: detailsPanel ? 4 : 3,
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
                return setSelected({ folders: [], files: [id] });
            }

            if (checked) {
                setSelected({ ...selected, files: [...selected.files, id] });
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
        const selectedFiles = files.map(file => file._id);
        const selectedFolders = folders.map(folder => folder._id);

        setSelected({ files: selectedFiles, folders: selectedFolders });
    };

    const clearAll = () => {
        setSelected(initialSelection);
        setDetails({});
    };

    const isItemsSelected = useCallback(
        () => selected.files.length || selected.folders.length || null,
        [selected]
    );
    const selectedLength = selected.files.length + selected.folders.length;

    const trashSelected = useCallback(async () => {
        showResponse('Working...');

        const items = {
            files: selected.files,
            folders: selected.folders,
        };

        try {
            const response = await axios.post('/action/trash', {
                items,
            });
            const { success, errors } = response.data;

            if (!success) return showError(errors);

            refresh();
            showResponse('Items moved to trash');
        } catch (e) {
            handleAxiosError(e, showError);
        } finally {
            setDetails({});
            clearAll();
        }
    }, [selected, showError, refresh, showResponse]);

    const copySelected = useCallback(async () => {
        closeOptionMenu();
        showResponse('Working...');

        try {
            const response = await axios.post('/action/copy', {
                items: selected.files,
            });
            const { success, messsage } = response.data;

            if (!success) return showError(messsage);

            refresh();
            showResponse('Items copied');
            setSelected(initialSelection);
        } catch (e) {
            handleAxiosError(e, showError);
        }
    }, [selected, showError, refresh, showResponse, closeOptionMenu]);

    const removeFavorite = useCallback(async () => {
        closeOptionMenu();
        showResponse('Working...');
        const items = {
            files: selected.files,
            folders: selected.folders,
        };

        try {
            const response = await axios.post('/action/remove-favorite', {
                items,
            });
            const { success, messsage } = response.data;

            if (!success) return showError(messsage);

            refresh();
            showResponse('Items removed from favorite');
            setSelected(initialSelection);
        } catch (e) {
            handleAxiosError(e, showError);
        }
    }, [selected, showError, refresh, showResponse, closeOptionMenu]);

    const addFavorite = useCallback(async () => {
        closeOptionMenu();
        showResponse('Working...');
        const items = {
            files: selected.files,
            folders: selected.folders,
        };

        try {
            const response = await axios.post('/action/add-favorite', {
                items,
            });
            const { success, messsage } = response.data;

            if (!success) return showError(messsage);

            refresh();
            showResponse('Items added to favorite');
            setSelected(initialSelection);
        } catch (e) {
            handleAxiosError(e, showError);
        }
    }, [selected, showError, refresh, showResponse, closeOptionMenu]);

    const downloadSelected = async () => {
        showResponse('Downloading...');
        const items = {
            files: files.filter(file => selected.files.includes(file._id)),
            folders: folders.filter(folder => selected.folders.includes(folder._id)),
        };

        try {
            const response = await axios.post(
                `/action/download`,
                { items },
                { responseType: 'blob' }
            );

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `files-download-${Date.now()}.zip`;
            document.body.appendChild(link);
            link.click();
            showResponse(`${selectedLength} items downloaded`);

            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (e) {
            handleAxiosError(e, showError);
        }
    };

    useEffect(() => {
        if (!isItemsSelected()) setDetails({});
        if (selectedLength > 1) setDetails({});
    }, [isItemsSelected, selectedLength]);

    useEffect(() => {
        refresh(filter);
    }, [filter, refresh]);

    return (
        <>
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
                        height: 'calc(100dvh - 80px)',
                        backgroundColor: 'background.main',
                        borderRadius: '12px',
                    }}>
                    <Box position='sticky' px={2} pt={2}>
                        <Grid container alignItems='center' mb={1} width='100%'>
                            <Grid item xs overflow='hidden'>
                                <Typography
                                    variant='h5'
                                    color='text.primary'
                                    sx={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        mb: 1,
                                    }}>
                                    {title}
                                </Typography>
                            </Grid>

                            <Grid item textAlign='center'>
                                <IconButton
                                    sx={{ display: { xs: 'none', xm: 'inline-flex' } }}
                                    disabled={selectedLength > 1}
                                    onClick={() => {
                                        if (!isItemsSelected()) {
                                            setDetails({});
                                            folderDetailsPanelOpen();
                                        }
                                        selected.files.length === 1 && fileDetailsPanelOpen();
                                        selected.folders.length === 1 && folderDetailsPanelOpen();
                                    }}>
                                    <InfoIcon />
                                </IconButton>
                                {location.pathname !== '/recent' && (
                                    <IconButton
                                        sx={{ display: { xs: 'inline-flex', sm: 'none' }, p: 0 }}
                                        onClick={openSortMenu}>
                                        <MoreVertIcon />
                                    </IconButton>
                                )}
                            </Grid>
                        </Grid>
                        <Box display={{ xs: 'none', sm: 'block' }}>
                            {isItemsSelected() ? (
                                <Box
                                    bgcolor='custom.selectedPanel'
                                    borderRadius='50px'
                                    mb={1}
                                    minHeight='36px'>
                                    <Grid container alignItems='center' columnSpacing={1.25}>
                                        <Grid item>
                                            <Tooltip title='Clear selection'>
                                                <IconButton onClick={clearAll}>
                                                    <CloseIcon fontSize='small' />
                                                </IconButton>
                                            </Tooltip>
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
                                            <Tooltip title='Share'>
                                                <IconButton onClick={openShare}>
                                                    <PersonAddAltIcon fontSize='small' />
                                                </IconButton>
                                            </Tooltip>
                                        </Grid>
                                        <Grid item>
                                            <Tooltip title='Download'>
                                                <IconButton onClick={downloadSelected}>
                                                    <FileDownloadOutlinedIcon fontSize='small' />
                                                </IconButton>
                                            </Tooltip>
                                        </Grid>
                                        <Grid item>
                                            <Tooltip title='Move'>
                                                <IconButton onClick={openMove}>
                                                    <DriveFileMoveOutlinedIcon fontSize='small' />
                                                </IconButton>
                                            </Tooltip>
                                        </Grid>
                                        <Grid item>
                                            <Tooltip title='Move to trash'>
                                                <IconButton onClick={trashSelected}>
                                                    <DeleteIcon fontSize='small' />
                                                </IconButton>
                                            </Tooltip>
                                        </Grid>
                                        <Grid item xs>
                                            <Tooltip title='More options'>
                                                <IconButton onClick={openOptionMenu}>
                                                    <MoreVertIcon fontSize='small' />
                                                </IconButton>
                                            </Tooltip>
                                            <Menu
                                                anchorEl={optionAnchorEl}
                                                open={Boolean(optionAnchorEl)}
                                                onClose={closeOptionMenu}
                                                sx={{
                                                    '.MuiPaper-root.MuiMenu-paper.MuiPopover-paper':
                                                        {
                                                            width: 'min(100%, 320px)',
                                                            boxShadow:
                                                                'rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px',
                                                            border: '1px solid #00000017',
                                                            bgcolor: 'custom.menu',
                                                            p: 0.5,
                                                        },
                                                }}>
                                                <MenuItem
                                                    onClick={copySelected}
                                                    disabled={!selected.files.length}>
                                                    <ListItemIcon>
                                                        <ContentCopyIcon />
                                                    </ListItemIcon>
                                                    Make a copy
                                                </MenuItem>
                                                {files && folders ? (
                                                    [
                                                        ...files?.filter(file =>
                                                            selected.files?.includes(file._id)
                                                        ),
                                                        ...folders?.filter(folder =>
                                                            selected.folders?.includes(folder._id)
                                                        ),
                                                    ].every(file => file.favorite === true) ? (
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
                                                    )
                                                ) : null}
                                            </Menu>
                                        </Grid>

                                        <Grid item>
                                            <Button
                                                variant='text'
                                                sx={{
                                                    color: 'text.primary',
                                                    display: { xs: 'none', sm: 'block' },
                                                    mr: 1,
                                                }}
                                                onClick={selectAll}>
                                                Select All
                                            </Button>
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
                                        {Types.map(type => {
                                            if (
                                                location.pathname === '/recent' &&
                                                type.value === 'folders'
                                            )
                                                return null;
                                            return (
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
                                            );
                                        })}
                                    </Select>
                                    {location.pathname !== '/recent' && (
                                        <Select
                                            displayEmpty
                                            onChange={e => {
                                                setFilter({ ...filter, sort: e.target.value });
                                            }}
                                            value={filter.sort}
                                            filter={filter.sort}
                                            clear={() => setFilter({ ...filter, sort: '' })}
                                            renderValue={v => {
                                                if (!filter.sort) return 'Sort';
                                                return v;
                                            }}>
                                            <MenuItem value='name'>Name</MenuItem>
                                            <MenuItem value='size'>Storage used</MenuItem>
                                        </Select>
                                    )}

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
                                                <Typography variant='h6'>Custom range</Typography>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                                                            sx={{ p: '3px 14px', fontSize: '12px' }}
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

                                    <Box flexGrow={1} textAlign='right'>
                                        {location.pathname !== '/recent' &&
                                            (filter.direction === 1 ? (
                                                <IconButton
                                                    onClick={() =>
                                                        setFilter({ ...filter, direction: -1 })
                                                    }>
                                                    <ArrowUpwardIcon fontSize='small' />
                                                </IconButton>
                                            ) : (
                                                <IconButton
                                                    onClick={() =>
                                                        setFilter({ ...filter, direction: 1 })
                                                    }>
                                                    <ArrowDownwardIcon fontSize='small' />
                                                </IconButton>
                                            ))}
                                    </Box>
                                </Stack>
                            )}
                        </Box>
                    </Box>
                    <PageLoading condition={files || folders}>
                        <Box
                            sx={{
                                height: { xs: 'calc(100% - 75px)', md: 'calc(100% - 130px)' },
                                overflowY: 'auto',
                                p: 2,
                            }}
                            onClick={clearAll}>
                            {location.pathname === '/recent' ? (
                                <>
                                    {filesByDate ? (
                                        <React.Fragment>
                                            {filesByDate.day ? (
                                                <>
                                                    <Typography
                                                        variant='subtitle1'
                                                        fontWeight='500'
                                                        mb={2}
                                                        color='text.secondary'>
                                                        Today
                                                    </Typography>
                                                    <Grid container spacing={1.5}>
                                                        {filesByDate.day.files.map((file, i) => (
                                                            <Grid item {...columns()} key={i}>
                                                                <FileCard
                                                                    file={file}
                                                                    setDetails={setDetails}
                                                                    detailsPanelOpen={
                                                                        fileDetailsPanelOpen
                                                                    }
                                                                    changeSelected={
                                                                        updateSelectedFiles
                                                                    }
                                                                    selected={selected.files.includes(
                                                                        file._id
                                                                    )}
                                                                    detailsPanel={detailsPanel}
                                                                    disabled={selectedLength > 1}
                                                                    clearAll={clearAll}
                                                                    refresh={refresh}
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </>
                                            ) : null}
                                            {filesByDate.week ? (
                                                <>
                                                    <Typography
                                                        variant='subtitle1'
                                                        fontWeight='500'
                                                        my={2}
                                                        color='text.secondary'>
                                                        Earlier this week
                                                    </Typography>
                                                    <Grid container spacing={1.5}>
                                                        {filesByDate.week.files.map((file, i) => (
                                                            <Grid item {...columns()} key={i}>
                                                                <FileCard
                                                                    file={file}
                                                                    setDetails={setDetails}
                                                                    detailsPanelOpen={
                                                                        fileDetailsPanelOpen
                                                                    }
                                                                    changeSelected={
                                                                        updateSelectedFiles
                                                                    }
                                                                    selected={selected.files.includes(
                                                                        file._id
                                                                    )}
                                                                    detailsPanel={detailsPanel}
                                                                    disabled={selectedLength > 1}
                                                                    clearAll={clearAll}
                                                                    refresh={refresh}
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </>
                                            ) : null}
                                            {filesByDate.month ? (
                                                <>
                                                    <Typography
                                                        variant='subtitle1'
                                                        fontWeight='500'
                                                        my={2}
                                                        color='text.secondary'>
                                                        Earlier this month
                                                    </Typography>
                                                    <Grid container spacing={1.5}>
                                                        {filesByDate.month.files.map((file, i) => (
                                                            <Grid item {...columns()} key={i}>
                                                                <FileCard
                                                                    file={file}
                                                                    setDetails={setDetails}
                                                                    detailsPanelOpen={
                                                                        fileDetailsPanelOpen
                                                                    }
                                                                    changeSelected={
                                                                        updateSelectedFiles
                                                                    }
                                                                    selected={selected.files.includes(
                                                                        file._id
                                                                    )}
                                                                    detailsPanel={detailsPanel}
                                                                    disabled={selectedLength > 1}
                                                                    clearAll={clearAll}
                                                                    refresh={refresh}
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </>
                                            ) : null}
                                            {filesByDate.year ? (
                                                <>
                                                    <Typography
                                                        variant='subtitle1'
                                                        fontWeight='500'
                                                        my={2}
                                                        color='text.secondary'>
                                                        Earlier this year
                                                    </Typography>
                                                    <Grid container spacing={1.5}>
                                                        {filesByDate.year.files.map((file, i) => (
                                                            <Grid item {...columns()} key={i}>
                                                                <FileCard
                                                                    file={file}
                                                                    setDetails={setDetails}
                                                                    detailsPanelOpen={
                                                                        fileDetailsPanelOpen
                                                                    }
                                                                    changeSelected={
                                                                        updateSelectedFiles
                                                                    }
                                                                    selected={selected.files.includes(
                                                                        file._id
                                                                    )}
                                                                    detailsPanel={detailsPanel}
                                                                    disabled={selectedLength > 1}
                                                                    clearAll={clearAll}
                                                                    refresh={refresh}
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </>
                                            ) : null}
                                            {filesByDate.older ? (
                                                <>
                                                    <Typography
                                                        variant='subtitle1'
                                                        fontWeight='500'
                                                        my={2}
                                                        color='text.secondary'>
                                                        Older
                                                    </Typography>
                                                    <Grid container spacing={1.5} mb={2}>
                                                        {filesByDate.older.files.map((file, i) => (
                                                            <Grid item {...columns()} key={i}>
                                                                <FileCard
                                                                    file={file}
                                                                    setDetails={setDetails}
                                                                    detailsPanelOpen={
                                                                        fileDetailsPanelOpen
                                                                    }
                                                                    changeSelected={
                                                                        updateSelectedFiles
                                                                    }
                                                                    selected={selected.files.includes(
                                                                        file._id
                                                                    )}
                                                                    detailsPanel={detailsPanel}
                                                                    disabled={selectedLength > 1}
                                                                    clearAll={clearAll}
                                                                    refresh={refresh}
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </>
                                            ) : null}
                                        </React.Fragment>
                                    ) : null}
                                </>
                            ) : (
                                <>
                                    {folders?.length ? (
                                        <React.Fragment>
                                            <Typography
                                                variant='subtitle1'
                                                fontWeight='500'
                                                mb={2}
                                                color='text.secondary'>
                                                Folders
                                            </Typography>
                                            <Grid container spacing={1.5} mb={2}>
                                                {folders?.map((folder, i) => (
                                                    <Grid item {...columns()} key={i}>
                                                        <FolderCard
                                                            folder={folder}
                                                            setDetails={setDetails}
                                                            detailsPanelOpen={
                                                                folderDetailsPanelOpen
                                                            }
                                                            changeSelected={updateSelectedFolders}
                                                            selected={selected.folders.includes(
                                                                folder._id
                                                            )}
                                                            disabled={selectedLength > 1}
                                                            detailsPanel={detailsPanel}
                                                            clearAll={clearAll}
                                                            refresh={refresh}
                                                        />
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </React.Fragment>
                                    ) : null}
                                    {files?.length ? (
                                        <React.Fragment>
                                            <Typography
                                                variant='subtitle1'
                                                fontWeight='500'
                                                mb={2}
                                                color='text.secondary'>
                                                Files
                                            </Typography>
                                            <Grid container spacing={1.5} mb={2}>
                                                {files?.map((file, i) => (
                                                    <Grid item {...columns()} key={i}>
                                                        <FileCard
                                                            file={file}
                                                            setDetails={setDetails}
                                                            detailsPanelOpen={fileDetailsPanelOpen}
                                                            changeSelected={updateSelectedFiles}
                                                            selected={selected.files.includes(
                                                                file._id
                                                            )}
                                                            detailsPanel={detailsPanel}
                                                            disabled={selectedLength > 1}
                                                            clearAll={clearAll}
                                                            refresh={refresh}
                                                            allFiles={files || []}
                                                            fileIndex={i}
                                                            openShare={openShare}
                                                            openMove={openMove}
                                                        />
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </React.Fragment>
                                    ) : null}
                                    {folders?.length || files?.length ? null : (
                                        <Stack
                                            direction='column'
                                            justifyContent='center'
                                            alignItems='center'
                                            height='100%'>
                                            <Image name={defaultImage} height='200px' />
                                            <Typography variant='h6' mt={2}>
                                                {defaultTitle}
                                            </Typography>
                                            <Typography
                                                variant='body2'
                                                mt={1}
                                                color='text.secondary'>
                                                {defaultCaption}
                                            </Typography>
                                        </Stack>
                                    )}
                                </>
                            )}
                        </Box>
                    </PageLoading>
                </Grid>

                <DetailsPanel
                    details={details}
                    detailsPanelClose={detailsPanelClose}
                    detailsPanel={detailsPanel}
                    xmLayout={xmLayout}
                />
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

            {/* Modals */}

            <Modal
                open={moveState}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <>
                    <Move
                        closeModal={closeMove}
                        parent={content}
                        selected={selected}
                        selectedLength={selectedLength}
                        refresh={refresh}
                        clearAll={clearAll}
                    />
                </>
            </Modal>
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
                        selected={selected}
                        selectedLength={selectedLength}
                        refresh={refresh}
                        clearAll={clearAll}
                    />
                </>
            </Modal>
        </>
    );
};

export default memo(Main);
