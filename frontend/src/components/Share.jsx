import {
    Autocomplete,
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import WarningIcon from '@mui/icons-material/Warning';
import PublicIcon from '@mui/icons-material/Public';
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { env, getItemIds, handleAxiosError } from '../utils/function';
import { useMessage } from '../providers/Provider';
import useLoader from '../hooks/useLoader';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';

const GeneralAccess = {
    restricted: {
        name: 'Restricted',
        value: 'false',
        caption: 'Only people with access can open with the link',
        icon: <LockOutlinedIcon />,
    },
    open: {
        name: 'Anyone with the link',
        value: 'true',
        caption: 'Anyone on the internet with the link can view',
        icon: <PublicIcon />,
    },
};

const Share = props => {
    const { closeModal, refresh, selected, selectedLength, clearAll } = props;

    const [contents, setContents] = useState(null);
    const { _id: id, file, sharedWith, email, access, name } = contents?.at(0) || {};
    const [users, setUsers] = useState([]);
    const [userAccess, setUserAccess] = useState('viewer');
    const [linkAccessType, setLinkAccessType] = useState('restricted');
    const [fileAccessType, setFileAccessType] = useState('viewer');
    const [usersToUpdate, setUsersToUpdate] = useState({});
    const { loaderState, linear, start, end } = useLoader({ size: 50 });
    const user = useAuthUser() || {};
    const { showError, showResponse } = useMessage();

    const isEmailExists = useCallback(
        async (email, index) => {
            start();
            const newUserIds = [...users];
            newUserIds[index] = '';

            try {
                const response = await axios.get(`/user-info?email=${email}`, {
                    baseURL: 'https://api.admin.clikkle.com',
                });

                const { success, message, user } = response.data;

                if (!success) return showError(message);

                newUserIds[index] = { email, id: user._id };
            } catch (e) {
                handleAxiosError(e, showError);
            } finally {
                setUsers(newUserIds);
                end();
            }
        },
        [showError, users, end, start]
    );

    const updateAccess = useCallback(async () => {
        start();
        const contentId = file ? { fileId: id } : { folderId: id };
        const toUpdate = [];

        for (let user in usersToUpdate) {
            toUpdate.push({ id: user, access: usersToUpdate[user] });
        }

        try {
            const response = await axios.patch('/share', {
                ...contentId,
                users: toUpdate,
            });
            const { success, message } = response.data;

            if (!success) return showError(message);

            refresh();
            showResponse('Access updated');
        } catch (e) {
            handleAxiosError(e, showError);
        } finally {
            end();
            closeModal();
        }
    }, [showError, showResponse, refresh, id, file, usersToUpdate, closeModal, start, end]);

    const shareAccess = useCallback(async () => {
        start();

        console.log({ selected, selectedFiles: selected.files, selectedFolders: selected.folders });
        const files = contents.filter(content => selected.files.includes(content._id));
        const folders = contents.filter(content => selected.folders.includes(content._id));

        try {
            const response = await axios.post('/action/grant-access', {
                items: { files, folders },
                users,
                access: userAccess,
            });

            const { success, errors } = response.data;

            if (!success) return showError(errors);

            refresh();
            showResponse('Access updated');
        } catch (e) {
            handleAxiosError(e, showError);
        } finally {
            clearAll();
            end();
            closeModal();
        }
    }, [
        showError,
        showResponse,
        refresh,
        closeModal,
        users,
        userAccess,
        start,
        end,
        clearAll,
        selected,
        contents,
    ]);

    const publicAccess = useCallback(
        async access => {
            start();

            try {
                const response = await axios.patch(`/action/access/public`, {
                    itemIds: getItemIds(selected),
                    access: access || 'viewer',
                });
                const { success, errors } = response.data;

                if (!success) return showError(errors);

                showResponse('Access updated');
            } catch (e) {
                handleAxiosError(e, showError);
            } finally {
                end();
            }
        },
        [showError, showResponse, start, end, selected]
    );

    const privateAccess = useCallback(async () => {
        start();

        try {
            const response = await axios.patch(`/action/access/private`, {
                itemIds: getItemIds(selected),
            });
            const { success, errors } = response.data;

            if (!success) return showError(errors);

            showResponse('Access updated');
        } catch (e) {
            handleAxiosError(e, showError);
        } finally {
            end();
        }
    }, [showError, showResponse, start, end, selected]);

    const remove = index => {
        const newUserIds = [...users];
        newUserIds.splice(index, 1);
        setUsers(newUserIds);
    };

    const copyToClipboard = async () => {
        try {
            const link = file ? `${env('DOMAIN')}/file/d/${id}` : `${env('DOMAIN')}/folder/d/${id}`;
            await navigator.clipboard.writeText(link);
            showResponse('Link copied');
        } catch (e) {
            showError('Failed to copy the link');
        }
    };

    const fetchContents = useCallback(async () => {
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
        if (access) {
            setFileAccessType(access.access);
            setLinkAccessType(access.type === 'public' ? 'open' : 'restricted');
        }
    }, [access]);

    useEffect(() => {
        fetchContents();
    }, [fetchContents]);

    return contents ? (
        <Card
            sx={{
                boxShadow: 'rgba(0, 0, 0, 0.45) 0px 25px 20px -20px',
                borderRadius: '8px',
                maxWidth: '563px',
                width: '100%',
                mx: 2,
                pb: 3,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'custom.menu',
                overflowY: 'auto',
                backgroundImage:
                    'linear-gradient(rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.12))',
            }}>
            {linear}
            <Stack direction='row' alignItems='center' spacing={1} pt={3} mb={1.5} px={3}>
                <Typography variant='h5' component={'span'}>
                    Share
                </Typography>
                <Typography
                    variant='h6'
                    sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1,
                        fontWeight: 400,
                    }}>
                    '{selectedLength > 1 ? selectedLength + ' Items' : name}'
                </Typography>
            </Stack>

            <Box flexGrow={1}>
                <Box px={3}>
                    <Grid container columnSpacing={2}>
                        <Grid item xs={12} md>
                            <Autocomplete
                                clearIcon={false}
                                options={[]}
                                freeSolo
                                multiple
                                onChange={(e, newValue) => {
                                    if (e.key === 'Enter')
                                        isEmailExists(newValue[newValue.length - 1], [
                                            newValue.length - 1,
                                        ]);
                                }}
                                renderTags={(value, getTagProps) => {
                                    return value.map((option, index) => (
                                        <Chip
                                            label={option}
                                            key={option}
                                            icon={
                                                loaderState ? null : users[index] ? null : (
                                                    <WarningIcon
                                                        color='warning'
                                                        sx={{ fontSize: 16 }}
                                                    />
                                                )
                                            }
                                            onDelete={() => {
                                                remove(index);
                                                value.splice(index, 1);
                                            }}
                                        />
                                    ));
                                }}
                                renderInput={params => (
                                    <TextField
                                        label='Add people to share'
                                        disabled={loaderState}
                                        sx={{ mb: 0 }}
                                        {...params}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid
                            item
                            xs={12}
                            md='auto'
                            sx={{ display: loaderState || users.length ? 'block' : 'none' }}>
                            <Select
                                sx={{
                                    py: 2,
                                    mb: 2,
                                }}
                                displayEmpty
                                value={userAccess}
                                onChange={e => setUserAccess(e.target.value)}>
                                <MenuItem value='viewer'>Viewer</MenuItem>
                                <MenuItem value='commenter'>Commenter</MenuItem>
                                <MenuItem value='editor'>Editor</MenuItem>
                            </Select>
                        </Grid>
                    </Grid>
                </Box>

                {!users.length ? (
                    <Box>
                        <Typography
                            variant='subtitle01'
                            fontWeight='500'
                            component='div'
                            px={3}
                            my={2}>
                            People with access
                        </Typography>
                        <Box maxHeight='250px' overflow='auto'>
                            <Grid
                                container
                                alignItems='center'
                                sx={{
                                    px: 3,
                                    py: 1.5,
                                    '&:hover': {
                                        backgroundColor: 'custom.shareHover',
                                    },
                                }}>
                                <Grid item sm={1} sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    <Avatar
                                        alt='Remy Sharp'
                                        src='data:image/jpeg;base64,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'
                                        sx={{ width: 30, height: 30 }}
                                    />
                                </Grid>
                                <Grid item xs height={30}>
                                    {email ? (
                                        <Typography
                                            variant='body2'
                                            fontWeight={500}
                                            lineHeight={0.8}>
                                            {user.email === email ? user.name : email}
                                        </Typography>
                                    ) : (
                                        <Typography
                                            variant='body2'
                                            fontWeight={500}
                                            lineHeight={0.8}>
                                            {user.name}
                                        </Typography>
                                    )}

                                    <Typography variant='caption'>
                                        {email ? email : user.email}
                                    </Typography>
                                </Grid>
                                <Grid item xs={1}>
                                    <Typography variant='body2' color='text.secondary'>
                                        Owner
                                    </Typography>
                                </Grid>
                            </Grid>

                            {id &&
                                sharedWith.map(user => (
                                    <Grid
                                        container
                                        alignItems='center'
                                        key={user.userId}
                                        sx={{
                                            px: 3,
                                            py: 1.5,
                                            '&:hover': {
                                                backgroundColor: 'custom.shareHover',
                                            },
                                        }}>
                                        <Grid
                                            item
                                            sm={1}
                                            sx={{ display: { xs: 'none', sm: 'block' } }}>
                                            <Avatar
                                                alt='Remy Sharp'
                                                src='data:image/jpeg;base64,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'
                                                sx={{ width: 30, height: 30 }}
                                            />
                                        </Grid>
                                        <Grid item xs={10} sm height={30}>
                                            <Typography
                                                variant='body2'
                                                fontWeight={500}
                                                lineHeight={0.8}>
                                                {user.email}
                                            </Typography>

                                            <Typography variant='caption'>{user.email}</Typography>
                                        </Grid>
                                        <Grid item>
                                            <Select
                                                sx={{
                                                    '& .MuiSelect-select.MuiInputBase-input.MuiOutlinedInput-input':
                                                        {
                                                            paddingRight: '30px',
                                                            paddingLeft: 0,
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
                                                }}
                                                defaultValue={user.access}
                                                value={
                                                    usersToUpdate[user.userId] ||
                                                    user.access ||
                                                    'viewer'
                                                }
                                                displayEmpty
                                                onChange={e => {
                                                    setUsersToUpdate({
                                                        ...usersToUpdate,
                                                        [user.userId]: e.target.value,
                                                    });
                                                }}>
                                                <MenuItem value='viewer'>Viewer</MenuItem>
                                                <MenuItem value='commenter'>Commenter</MenuItem>
                                                <MenuItem value='editor'>Editor</MenuItem>
                                                <Divider variant='middle' />
                                                <MenuItem value='remove'>Remove access</MenuItem>
                                            </Select>
                                        </Grid>
                                    </Grid>
                                ))}
                        </Box>

                        <>
                            <Box px={3}>
                                <Typography
                                    variant='subtitle01'
                                    fontWeight='500'
                                    component='div'
                                    mt={3}
                                    mb={1}>
                                    General access
                                </Typography>
                            </Box>
                            <Grid
                                container
                                alignItems='center'
                                sx={{
                                    px: 3,
                                    py: 1.5,
                                    '&:hover': {
                                        backgroundColor: 'custom.shareHover',
                                    },
                                }}>
                                <Grid item flexBasis='40px'>
                                    <Box
                                        sx={{
                                            height: '40px',
                                            width: '40px',
                                            borderRadius: '100%',
                                            backgroundColor: 'custom.trashCaption',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                        {GeneralAccess[linkAccessType].icon}
                                    </Box>
                                </Grid>
                                <Grid item xs>
                                    <Select
                                        value={linkAccessType}
                                        displayEmpty
                                        disabled={!id}
                                        onChange={e => {
                                            setLinkAccessType(e.target.value);
                                            if (e.target.value === 'restricted') {
                                                privateAccess();
                                            }
                                            if (e.target.value === 'open') {
                                                publicAccess();
                                            }
                                        }}
                                        sx={{
                                            '& .MuiSelect-select.MuiInputBase-input.MuiOutlinedInput-input':
                                                {
                                                    paddingRight: '30px',
                                                    paddingLeft: '8px',
                                                },
                                            '& fieldset.MuiOutlinedInput-notchedOutline': {
                                                border: 'none',
                                            },
                                            '&:hover  fieldset.MuiOutlinedInput-notchedOutline': {
                                                border: 'none',
                                            },
                                            '&.Mui-focused fieldset.MuiOutlinedInput-notchedOutline':
                                                {
                                                    border: 'none',
                                                },
                                        }}>
                                        <MenuItem value='restricted'>Restricted</MenuItem>
                                        <MenuItem value='open'>Anyone with the link</MenuItem>
                                    </Select>

                                    <Typography variant='caption' component='div' ml={1}>
                                        {GeneralAccess[linkAccessType].caption}
                                    </Typography>
                                </Grid>

                                <Grid
                                    item
                                    sx={{
                                        display: linkAccessType === 'open' ? 'block' : 'none',
                                    }}>
                                    <Select
                                        value={fileAccessType}
                                        displayEmpty
                                        onChange={e => {
                                            setFileAccessType(e.target.value);
                                            publicAccess(e.target.value);
                                        }}
                                        sx={{
                                            '& fieldset.MuiOutlinedInput-notchedOutline': {
                                                border: 'none',
                                            },
                                            '&:hover  fieldset.MuiOutlinedInput-notchedOutline': {
                                                border: 'none',
                                            },
                                            '&.Mui-focused fieldset.MuiOutlinedInput-notchedOutline':
                                                {
                                                    border: 'none',
                                                },
                                        }}>
                                        <MenuItem value='viewer'>Viewer</MenuItem>
                                        <MenuItem value='commenter'>Commenter</MenuItem>
                                        <MenuItem value='editor'>Editor</MenuItem>
                                    </Select>
                                </Grid>
                            </Grid>{' '}
                            <Stack direction='row' justifyContent='space-between' mt={3} px={3}>
                                <Button
                                    variant='text'
                                    sx={{ px: 2.5 }}
                                    disabled={!id}
                                    onClick={copyToClipboard}>
                                    Copy link
                                </Button>

                                <Button
                                    variant='contained'
                                    sx={{ px: 3.5 }}
                                    disabled={!Object.keys(usersToUpdate).length || loaderState}
                                    onClick={updateAccess}>
                                    Done
                                </Button>
                            </Stack>
                        </>
                    </Box>
                ) : (
                    <Box sx={{ float: 'right', px: 3, mt: 2 }}>
                        <Button variant='outlined' sx={{ px: 3.5, mr: 2 }} onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button
                            variant='contained'
                            sx={{ px: 3.5 }}
                            disabled={loaderState}
                            onClick={shareAccess}>
                            Send
                        </Button>
                    </Box>
                )}
            </Box>
        </Card>
    ) : (
        <CircularProgress size='50px' />
    );
};

export default Share;
