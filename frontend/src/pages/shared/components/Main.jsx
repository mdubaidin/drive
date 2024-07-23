import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import useMedia from '../../../hooks/useMedia';

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
    Menu,
    ListItemAvatar,
    Avatar,
    Select as MuiSelect,
    Tooltip,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileCard from './files/FileCard';
import axios from 'axios';
import FolderCard from './folder/FolderCard';
import DetailsPanel from '../../../components/DetailsPanel';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CloseIcon from '@mui/icons-material/Close';
import { handleAxiosError } from '../../../utils/function';
import { useMessage } from '../../../providers/Provider';
import useModal from '../../../hooks/useModal';
import Done from '@mui/icons-material/Done';
import { Types } from '../../../data/filters';
import Icon from '../../../components/Icon';
import Select from '../../../components/Select';
import PageLoading from '../../../components/PageLoading';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useMenu } from '../../../hooks/useMenu';
import Share from '../../../components/Share';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
// import { useUser } from '../../hooks/Authorize';

const initialSelection = { files: [], folders: [] };

const Main = props => {
    const { files, folders, title, refresh, shared } = props.data;
    const [detailsPanel, setDetailsPanel] = useState(null);
    const [details, setDetails] = useState({});
    const [selected, setSelected] = useState(initialSelection);
    const [peoples, setPeoples] = useState([]);
    const [filter, setFilter] = useState({
        type: '',
        people: '',
        modified: '',
        sort: '',
        direction: 1,
    });
    const [dateInterval, setDateInterval] = useState({ from: '', to: '' });
    const {
        modalState: dateRangeState,
        closeModal: closeDateRange,
        openModal: openDateRange,
    } = useModal();
    const xmLayout = useMedia('(max-width: 1024px)');
    const { showError, showResponse } = useMessage();
    const user = useAuthUser() || {};
    const { anchorEl: anchorElSort, openMenu: openSortMenu, closeMenu: closeSortMenu } = useMenu();
    const { modalState: shareState, closeModal: closeShare, openModal: openShare } = useModal();

    useMemo(() => xmLayout && setDetailsPanel(false), [xmLayout]);

    const fileDetailsPanelOpen = () => setDetailsPanel('file');

    const folderDetailsPanelOpen = () => setDetailsPanel('folder');

    const DetailsPanelClose = () => setDetailsPanel(null);

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

    const selectedData = useMemo(
        () => ({
            files: files?.filter(file => selected.files.includes(file._id)) || [],
            folders: folders?.filter(folder => selected.folders.includes(folder._id)) || [],
        }),
        [selected.files, selected.folders, files, folders]
    );

    const isAccessable = useMemo(() => {
        return [...selectedData.files, ...selectedData.folders].every(
            item =>
                item.userId === user._id ||
                item.sharedWith.some(
                    sharedUser => sharedUser.userId === user._id && sharedUser.access === 'editor'
                )
        );
    }, [user._id, selectedData.files, selectedData.folders]);

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

    const copySelected = useCallback(async () => {
        if (!selected.files.length)
            return showResponse('There are no files currently designated for copying.');

        showResponse('Working...');

        try {
            const response = await axios.post(`/share/action/copy/${user._id}`, {
                items: selected.files,
            });
            const { success, errors } = response.data;

            if (!success) return showError(errors);

            refresh();
            showResponse('Items copied');
            setSelected(initialSelection);
        } catch (e) {
            handleAxiosError(e, showError);
        }
    }, [selected, showError, refresh, showResponse, user._id]);

    const downloadSelected = async () => {
        showResponse('Downloading...');
        const items = {
            files: files.filter(file => selected.files.includes(file._id)),
            folders: folders.filter(folder => selected.folders.includes(folder._id)),
        };

        try {
            const response = await axios.post(
                `/share/action/download`,
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

    useMemo(() => {
        if (files && folders) {
            if (shared === 'with')
                [...files, ...folders].forEach(item =>
                    setPeoples(prev => ({ ...prev, [item.userId]: item.email }))
                );
            if (shared === 'by')
                [...files, ...folders].forEach(item =>
                    item.sharedWith.forEach(share =>
                        setPeoples(prev => ({ ...prev, [share.userId]: share.email }))
                    )
                );
        }
    }, [files, folders, setPeoples, shared]);

    return (
        <React.Fragment>
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
                    <Box position='sticky' px={2} pt={2}>
                        <Grid container alignItems='center' mb={1} width='100%'>
                            <Grid item xs>
                                <Typography variant='h5' color='text.primary'>
                                    {title}
                                </Typography>
                            </Grid>
                            {isItemsSelected() && (
                                <Grid item>
                                    <Button
                                        variant='text'
                                        sx={{
                                            color: 'text.primary',
                                            display: { xs: 'none', sm: 'block' },
                                        }}
                                        onClick={selectAll}>
                                        Select All
                                    </Button>
                                </Grid>
                            )}
                            <Grid item>
                                <IconButton
                                    sx={{ display: { xs: 'none', xm: 'block' } }}
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
                                <IconButton
                                    sx={{ display: { xs: 'block', sm: 'none' }, p: 0 }}
                                    onClick={openSortMenu}>
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
                                    <Grid container alignItems='center' columnSpacing={1.25}>
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
                                            <Tooltip title='Share'>
                                                <IconButton
                                                    onClick={openShare}
                                                    disabled={!isAccessable}>
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
                                            <Tooltip title='Make a copy'>
                                                <IconButton onClick={copySelected}>
                                                    <ContentCopyIcon sx={{ fontSize: '18px' }} />
                                                </IconButton>
                                            </Tooltip>
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
                                                <Typography variant='body2'>{type.name}</Typography>
                                            </MenuItem>
                                        ))}
                                    </Select>

                                    <Select
                                        displayEmpty
                                        onChange={e => {
                                            setFilter({
                                                ...filter,
                                                people: e.target.value,
                                            });
                                        }}
                                        filter={filter.people && peoples[filter.people]}
                                        value={filter.people}
                                        clear={() => setFilter({ ...filter, people: '' })}
                                        renderValue={v => {
                                            if (!filter.people) return 'People';
                                            return peoples[v];
                                        }}>
                                        {Object.keys(peoples).map(people => (
                                            <MenuItem value={people} sx={{ px: 1.2 }}>
                                                <ListItemAvatar sx={{ minWidth: '45px' }}>
                                                    <Avatar
                                                        alt='Remy Sharp'
                                                        src='data:image/jpeg;base64,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'
                                                        sx={{ width: 30, height: 30 }}
                                                    />
                                                </ListItemAvatar>{' '}
                                                {peoples[people]}
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
                                        <MuiSelect
                                            displayEmpty
                                            onChange={e => {
                                                setFilter({
                                                    ...filter,
                                                    sort: e.target.value,
                                                });
                                            }}
                                            filter={filter.sort}
                                            value={filter.sort}
                                            clear={() => setFilter({ ...filter, sort: '' })}
                                            renderValue={v => {
                                                if (!filter.sort) return 'Sort';
                                                return v;
                                            }}
                                            sx={{
                                                '& .MuiSelect-select.MuiInputBase-input.MuiOutlinedInput-input':
                                                    {
                                                        paddingRight: '30px',
                                                    },
                                                '& fieldset.MuiOutlinedInput-notchedOutline': {
                                                    border: 'none',
                                                },
                                                '&:hover  fieldset.MuiOutlinedInput-notchedOutline':
                                                    {
                                                        border: 'none',
                                                    },
                                                '&.Mui-focused fieldset.MuiOutlinedInput-notchedOutline':
                                                    {
                                                        border: 'none',
                                                    },
                                            }}>
                                            <MenuItem value='name'>Name</MenuItem>
                                            <MenuItem value='size'>Storage used</MenuItem>
                                        </MuiSelect>

                                        {filter.direction === 1 ? (
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
                                        )}
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
                                                        detailsPanelOpen={folderDetailsPanelOpen}
                                                        changeSelected={updateSelectedFolders}
                                                        selected={selected.folders.includes(
                                                            folder._id
                                                        )}
                                                        disabled={selectedLength > 1}
                                                        detailsPanel={detailsPanel}
                                                        clearAll={clearAll}
                                                        refresh={refresh}
                                                        shared={shared}
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
                                                        location={title}
                                                        file={file}
                                                        setDetails={setDetails}
                                                        detailsPanelOpen={fileDetailsPanelOpen}
                                                        changeSelected={updateSelectedFiles}
                                                        selected={selected.files.includes(file._id)}
                                                        detailsPanel={detailsPanel}
                                                        disabled={selectedLength > 1}
                                                        clearAll={clearAll}
                                                        refresh={refresh}
                                                        allFiles={files || []}
                                                        fileIndex={i}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </React.Fragment>
                                ) : null}
                            </>
                        </Box>
                    </PageLoading>
                </Grid>

                <DetailsPanel
                    details={details}
                    detailsPanelClose={DetailsPanelClose}
                    detailsPanel={detailsPanel}
                    xmLayout={xmLayout}
                />
            </Grid>

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
                        selectedItems={shareState && selectedData}
                        selectedLength={selectedLength}
                        refresh={refresh}
                        clearAll={clearAll}
                    />
                </>
            </Modal>

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
        </React.Fragment>
    );
};

export default memo(Main);
