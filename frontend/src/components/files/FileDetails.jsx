import { Box, Divider, IconButton, Stack, Typography, Skeleton } from '@mui/material';
import React, { memo, useCallback, useEffect, useState } from 'react';
import Icon from '../Icon';
import Image from '../Image';
import { getParentId, handleAxiosError, parseKB } from '../../utils/function';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useMessage } from '../../providers/Provider';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';

const FileDetails = props => {
    const { details, detailsPanelClose } = props;
    const [location, setLocation] = useState(null);
    const user = useAuthUser();

    const { showError } = useMessage();

    const key = details.key;

    const getLocation = useCallback(async () => {
        const folderId = getParentId(key);

        try {
            const response = await axios.get(`/folder/${folderId}`);

            setLocation(response.data.folder);
        } catch (e) {
            handleAxiosError(e, showError);
        }
    }, [showError, key]);

    useEffect(() => {
        if (details && key) getLocation();
    }, [details, getLocation, key]);

    return details ? (
        Object.keys(details).length ? (
            <Box p={2}>
                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                    <Box display='inline-flex' alignItems='center' overflow='hidden'>
                        <Icon name={details.fileIcon} height='20px' sx={{ mr: 1 }} />
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

                <Box
                    mt={2}
                    overflow='hidden'
                    borderRadius='6px'
                    height='160px'
                    border='1px solid'
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    borderColor='custom.border'>
                    {details.preview ? (
                        <Image
                            src={details.preview}
                            sx={{ objectFit: 'cover', height: '100%', width: '100%' }}
                        />
                    ) : (
                        <Icon
                            name={details.fileIcon}
                            sx={{ objectFit: 'contain', height: '50%', width: '50%' }}
                        />
                    )}
                </Box>
                <Typography variant='subtitle1' fontWeight={500} mt={2} gutterBottom>
                    Who has access
                </Typography>
                <Typography variant='caption' color='text.secondary' fontWeight={500} mb={2}>
                    Owned by {user._id === details.userId ? 'me' : details.email}
                    {details.sharedWith.length ? ', Shared with ' : null}
                    {details.sharedWith.length
                        ? details.sharedWith.map(user => user.email + ' ')
                        : null}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant='subtitle1' fontWeight={500} mb={1}>
                    File details
                </Typography>
                <Typography variant='body1' fontWeight={500} fontSize={12}>
                    Type
                </Typography>
                <Typography variant='subtitle2' fontSize={14} mb={2}>
                    {details.name
                        .match(/.[a-zA-Z0-9]+$/)[0]
                        .toUpperCase()
                        .slice(1)}
                </Typography>
                <Typography variant='body1' fontWeight={500} fontSize={12}>
                    Size
                </Typography>
                <Typography variant='subtitle2' fontSize={14} mb={2}>
                    {parseKB(details.size)}
                </Typography>
                <Typography variant='body1' fontWeight={500} fontSize={12}>
                    Storage used
                </Typography>
                <Typography variant='subtitle2' fontSize={14} mb={2}>
                    {parseKB(details.size)}
                </Typography>
                <Typography variant='body1' fontWeight={500} fontSize={12}>
                    Location
                </Typography>
                <Typography variant='subtitle2' fontSize={14} mb={2}>
                    {location?.name || 'My Files'}
                </Typography>
                <Typography variant='body1' fontWeight={500} fontSize={12}>
                    Owner
                </Typography>
                <Typography variant='subtitle2' fontSize={14} mb={2}>
                    {user.email === details.email ? user.fullName : details.email}
                </Typography>
                <Typography variant='body1' fontWeight={500} fontSize={12}>
                    Modified
                </Typography>
                <Typography variant='subtitle2' fontSize={14} mb={2}>
                    {new Date(details.updatedAt).toDateString()}
                </Typography>
                <Typography variant='body1' fontWeight={500} fontSize={12}>
                    Created
                </Typography>
                <Typography variant='subtitle2' fontSize={14} mb={2}>
                    {new Date(details.createdAt).toDateString()}
                </Typography>
            </Box>
        ) : (
            <Box p={2} textAlign='right'>
                <IconButton onClick={detailsPanelClose}>
                    <CloseIcon />
                </IconButton>

                <Box
                    mt={2}
                    overflow='hidden'
                    display='flex'
                    justifyContent='center'
                    alignItems='center'
                    height='200px'>
                    <Image
                        src={`${process.env.PUBLIC_URL}/images/details.png`}
                        sx={{ objectFit: 'cover', height: '50%', width: '50%' }}
                    />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant='subtitle1' mb={1} textAlign='center'>
                    Select an item to see the details
                </Typography>
            </Box>
        )
    ) : (
        <DetailSkeleton />
    );
};

const DetailSkeleton = () => {
    return (
        <Box p={2}>
            <Skeleton variant='text' height='40px' />

            <Skeleton variant='rounded' height='200px' sx={{ mt: 2 }} />

            <Divider sx={{ my: 2 }} />
            <Skeleton variant='text' width='150px' sx={{ mb: 1 }} />

            <Skeleton variant='text' width='70px' />

            <Skeleton variant='text' width='100px' sx={{ mb: 2 }} />

            <Skeleton variant='text' width='70px' />

            <Skeleton variant='text' width='100px' sx={{ mb: 2 }} />

            <Skeleton variant='text' width='70px' />

            <Skeleton variant='text' width='100px' sx={{ mb: 2 }} />

            <Skeleton variant='text' width='70px' />

            <Skeleton variant='text' width='100px' sx={{ mb: 2 }} />

            <Skeleton variant='text' width='70px' />

            <Skeleton variant='text' width='100px' sx={{ mb: 2 }} />
        </Box>
    );
};

export default memo(FileDetails);
