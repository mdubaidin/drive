import {
    Box,
    Card,
    Checkbox,
    Grid,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Modal,
    Skeleton,
    Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../../../../components/Icon';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Image from '../../../../components/Image';
import axios from 'axios';
import { useMenu } from '../../../../hooks/useMenu';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
// import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useMessage } from '../../../../providers/Provider';
import { memo } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import useModal from '../../../../hooks/useModal';
import { getFileIcon, handleAxiosError } from '../../../../utils/function';
import Share from '../../../../components/Share';
import { useMemo } from 'react';
import Preview from '../Preview/Preview';
import useMedia from '../../../../hooks/useMedia';
import Rename from '../Rename';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';

const FileCard = props => {
    const {
        setDetails,
        file,
        detailsPanelOpen,
        selected,
        changeSelected,
        disabled,
        detailsPanel,
        refresh,
        allFiles,
        fileIndex,
    } = props;
    const { name, mimetype: type, _id: id, trash, userId, sharedWith, key, file: isFile } = file;
    const [preview, setPreview] = useState(null);
    const [fileIcon, setFileIcon] = useState(null);
    const [loading, setLoading] = useState(false);
    const user = useAuthUser() || {};
    const xsLayout = useMedia('(max-width: 576px)');
    const { modalState: renameState, closeModal: closeRename, openModal: openRename } = useModal();
    const { modalState: shareState, closeModal: closeShare, openModal: openShare } = useModal();
    const {
        modalState: previewState,
        closeModal: closePreview,
        openModal: openPreview,
    } = useModal();
    const { showError } = useMessage();
    const {
        anchorEl: anchorElDetail,
        openMenu: openDetailMenu,
        closeMenu: closeDetailMenu,
    } = useMenu();

    const { showResponse } = useMessage();
    const checkboxRef = useRef();
    const cardRef = useRef();

    const isAccessable = useMemo(
        () =>
            userId === user?._id ||
            sharedWith?.find(sharedUser => sharedUser.userId === user?._id)?.access === 'editor',
        [user._id, userId, sharedWith]
    );

    const getAWSKey = (key, id) => (key ? encodeURIComponent(key + '/' + id) : id);

    const getPreview = useCallback(async () => {
        setLoading(true);

        try {
            const response = await axios.get(
                `/share/file/preview/${userId}?key=${getAWSKey(key, id)}`,
                {
                    responseType: 'blob',
                }
            );
            setPreview(URL.createObjectURL(response.data));
        } catch (e) {
            handleAxiosError(e, showError);
        } finally {
            setLoading(false);
        }
    }, [id, key, showError, userId]);

    const download = useCallback(async () => {
        closeDetailMenu();
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
    }, [id, closeDetailMenu, key, name, showError, showResponse, userId]);

    const makeCopy = useCallback(
        async function () {
            closeDetailMenu();
            showResponse('Working...');

            try {
                const response = await axios.patch(`/share/file/copy`, {
                    fileId: id,
                    ownerId: userId,
                });

                const { success, errors } = response.data;

                if (!success) return showError(errors);

                refresh();
                showResponse('File copied');
            } catch (e) {
                handleAxiosError(e, showError);
            }
        },
        [showError, showResponse, closeDetailMenu, id, refresh, userId]
    );

    const selectFile = useCallback(
        e => {
            e.stopPropagation();
            if (xsLayout) return openPreview();

            if (e.ctrlKey) {
                checkboxRef.current.focus();
                checkboxRef.current.click();
                return;
            }
            changeSelected(true, id, 'one');

            if (!disabled && !trash) {
                detailsPanel && detailsPanelOpen();

                file.preview = preview;
                file.fileIcon = fileIcon;
                setDetails(file);
            }
        },
        [
            changeSelected,
            detailsPanel,
            detailsPanelOpen,
            disabled,
            file,
            fileIcon,
            id,
            openPreview,
            preview,
            setDetails,
            trash,
            xsLayout,
        ]
    );

    useEffect(() => {
        const ext = type?.slice(0, type.indexOf('/'));
        if (ext === 'image') getPreview();
        else setPreview(null);
    }, [getPreview, type]);

    useEffect(() => {
        const fileIcon = getFileIcon(name);
        setFileIcon(fileIcon);
        console.log('fileicon');
    }, [name]);

    return (
        <>
            <Card
                sx={{
                    p: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '8px',
                    bgcolor: selected ? 'custom.selectedCard' : 'background.default',
                    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px',
                    // height: 'max(100%, 250px)',
                    cursor: 'default',
                    minHeight: '230px',
                    height: '100%',
                    maxHeight: '250px',
                    zIndex: 520,
                    '&:hover': {
                        bgcolor: selected ? 'custom.selectedCard' : 'custom.cardHover',
                    },
                }}
                ref={cardRef}
                onDoubleClick={e => {
                    e.stopPropagation();
                    openPreview();
                }}
                elevation={0}
                onClick={e => selectFile(e)}>
                <Checkbox
                    sx={{ display: 'none' }}
                    checked={selected}
                    onChange={e => changeSelected(e.target.checked, id)}
                    inputRef={checkboxRef}
                />
                <Grid container alignItems='center' mb={1} flexWrap='nowrap' columnSpacing={1}>
                    <Grid item height='20px'>
                        <Icon name={fileIcon} height='20px' />
                    </Grid>
                    <Grid item xs sx={{ overflow: 'hidden' }}>
                        <Typography
                            variant='body2'
                            fontWeight='500'
                            sx={{
                                whiteSpace: { xs: 'nowrap', xm: 'normal', lg: 'nowrap' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1,
                            }}>
                            {name}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <IconButton
                            sx={{ p: 0.4 }}
                            onClick={e => {
                                e.stopPropagation();
                                openDetailMenu(e);
                            }}
                            disabled={disabled}>
                            <MoreVertIcon fontSize='small' />
                        </IconButton>
                    </Grid>
                </Grid>

                <Box
                    flexGrow='1'
                    overflow='hidden'
                    borderRadius='6px'
                    bgcolor='custom.common'
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    sx={{
                        boxShadow: 'rgba(0, 0, 0, 0.03) 0px 0px 0px 1px',
                    }}>
                    {loading ? (
                        <Skeleton variant='rounded' width='100%' height='100%' />
                    ) : (
                        <Image
                            src={preview || `${process.env.PUBLIC_URL}/images/icons/${fileIcon}`}
                            sx={
                                preview
                                    ? { objectFit: 'cover', height: '100%', width: '100%' }
                                    : { objectFit: 'contain', height: '75%', width: '75%' }
                            }
                        />
                    )}
                </Box>
            </Card>

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
                        bgcolor: 'custom.menu',
                        p: 0.5,
                    },
                }}>
                <MenuItem onClick={download}>
                    <ListItemIcon>
                        <FileDownloadOutlinedIcon />
                    </ListItemIcon>
                    Download
                </MenuItem>
                <MenuItem
                    disabled={!isAccessable}
                    onClick={() => {
                        closeDetailMenu();
                        openRename();
                    }}>
                    <ListItemIcon>
                        <DriveFileRenameOutlineOutlinedIcon />
                    </ListItemIcon>
                    Rename
                </MenuItem>
                <MenuItem onClick={makeCopy}>
                    <ListItemIcon>
                        <ContentCopyIcon />
                    </ListItemIcon>
                    Make a copy
                </MenuItem>
                <MenuItem
                    disabled={!isAccessable}
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
                    onClick={e => {
                        e.stopPropagation();
                        setDetails(null);
                        closeDetailMenu(e);
                        detailsPanelOpen();

                        file.preview = preview;
                        file.fileIcon = fileIcon;
                        setDetails(file);
                    }}>
                    <ListItemIcon>
                        <InfoOutlinedIcon />
                    </ListItemIcon>
                    File information
                </MenuItem>
                {/* <MenuItem onClick={moveToTrash}>
                    <ListItemIcon>
                        <DeleteOutlinedIcon />
                    </ListItemIcon>
                    Remove
                </MenuItem> */}
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
                        file={isFile}
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
                    <Share closeModal={closeShare} selected={{ files: [id] }} refresh={refresh} />
                </>
            </Modal>

            {/* Preview */}
            <Modal
                open={previewState}
                onClose={closePreview}
                sx={{
                    '.MuiBackdrop-root.MuiModal-backdrop': { backgroundColor: 'rgb(0 0 0 / 81%)' },
                }}>
                <>
                    <Preview
                        closeModal={closePreview}
                        content={file}
                        refresh={refresh}
                        fileIcon={fileIcon}
                        allFiles={allFiles}
                        fileIndex={fileIndex}
                    />
                </>
            </Modal>
        </>
    );
};

export default memo(FileCard);
