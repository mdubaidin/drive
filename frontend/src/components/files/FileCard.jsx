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
import Icon from '../Icon';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Image from '../Image';
import axios from 'axios';
import { useMenu } from '../../hooks/useMenu';

import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RestoreIcon from '@mui/icons-material/Restore';
import { useMessage } from '../../providers/Provider';
import { memo } from 'react';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import useModal from '../../hooks/useModal';
import { getAWSKey, getFileIcon, handleAxiosError } from '../../utils/function';
import Preview from '../preview/Preview';
import Rename from '../Rename';
import useMedia from '../../hooks/useMedia';

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
        openShare,
        openMove,
        clearAll,
    } = props;
    const { name, mimetype: type, _id: id, trash, favorite, key, file: isFile } = file;
    const [preview, setPreview] = useState(null);
    const [fileIcon, setFileIcon] = useState(null);
    const [loading, setLoading] = useState(false);
    const { modalState: renameState, closeModal: closeRename, openModal: openRename } = useModal();
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

    const {
        anchorEl: anchorElOrganize,
        openMenu: openOrganizeMenu,
        closeMenu: closeOrganizeMenu,
    } = useMenu();
    const xsLayout = useMedia('(max-width: 576px)');
    const { showResponse } = useMessage();
    const checkboxRef = useRef();
    const cardRef = useRef();

    const getPreview = useCallback(async () => {
        setLoading(true);

        try {
            const response = await axios.get(`/file/preview?key=${getAWSKey(key, id)}`, {
                responseType: 'blob',
            });
            setPreview(URL.createObjectURL(response.data));
        } catch (e) {
            handleAxiosError(e, showError);
        } finally {
            setLoading(false);
        }
    }, [id, key, showError]);

    const download = useCallback(async () => {
        closeDetailMenu();
        showResponse('Downloading...');

        try {
            const response = await axios.get(`/file/download?key=${getAWSKey(key, id)}`, {
                responseType: 'blob',
            });

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
    }, [id, closeDetailMenu, key, name, showError, showResponse]);

    const moveToTrash = useCallback(
        async function () {
            closeDetailMenu();
            showResponse('Working...');

            try {
                const response = await axios.post(`/trash/file/${id}`);

                const { success, message } = response.data;

                if (!success) return showError(message);

                refresh();
                showResponse('File moved to trash');
            } catch (e) {
                handleAxiosError(e, showError);
            } finally {
                clearAll();
                setDetails({});
            }
        },
        [showError, refresh, showResponse, id, closeDetailMenu, setDetails, clearAll]
    );

    const addFavorite = useCallback(
        async function () {
            closeDetailMenu();
            closeOrganizeMenu();
            showResponse('Working...');

            try {
                const response = await axios.patch(`/file/favorite/add/${id}`);

                const { success, message } = response.data;

                if (!success) return showError(message);

                refresh();
                showResponse(`${name} is added to favorite`);
            } catch (e) {
                handleAxiosError(e, showError);
            }
        },
        [showError, showResponse, refresh, id, closeDetailMenu, closeOrganizeMenu, name]
    );

    const removeFavorite = useCallback(
        async function () {
            closeDetailMenu();
            closeOrganizeMenu();
            showResponse('Working...');

            try {
                const response = await axios.patch(`/file/favorite/remove/${id}`);

                const { success, message } = response.data;

                if (!success) return showError(message);

                refresh();
                showResponse(`${name} is removed from favorite`);
            } catch (e) {
                handleAxiosError(e, showError);
            }
        },
        [showError, showResponse, refresh, closeDetailMenu, closeOrganizeMenu, id, name]
    );

    const restore = useCallback(
        async function () {
            closeDetailMenu();
            showResponse('Working...');

            try {
                const response = await axios.post(`/trash/restore/file/${id}`);

                const { success, message } = response.data;

                if (!success) return showError(message);

                refresh();
                showResponse('File restored');
            } catch (e) {
                handleAxiosError(e, showError);
            }
        },
        [refresh, showError, showResponse, id, closeDetailMenu]
    );

    const makeCopy = useCallback(
        async function () {
            closeDetailMenu();
            showResponse('Working...');

            try {
                const response = await axios.patch(`/file/copy/${id}`);

                const { success, message } = response.data;

                if (!success) return showError(message);

                refresh();
                showResponse('File copied');
            } catch (e) {
                handleAxiosError(e, showError);
            }
        },
        [showError, showResponse, closeDetailMenu, id, refresh]
    );

    const deleteFile = useCallback(
        async function () {
            closeDetailMenu();
            showResponse('Working...');

            try {
                const response = await axios.patch(`/trash/delete/file/${id}`);

                const { success, message } = response.data;

                if (!success) return showError(message);

                refresh();
                showResponse('File deleted successfully');
            } catch (e) {
                handleAxiosError(e, showError);
            } finally {
                clearAll();
            }
        },
        [showError, showResponse, refresh, closeDetailMenu, id, clearAll]
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
            xsLayout,
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
    }, [name]);

    return (
        <React.Fragment>
            <Card
                sx={{
                    p: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '8px',
                    bgcolor: selected ? 'custom.selectedCard' : 'background.default',
                    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px',
                    cursor: 'default',
                    minHeight: '230px',
                    height: '100%',
                    maxHeight: '250px',
                    width: '100%',
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
                onDrag={e => e.preventDefault()}
                onDragCapture={e => e.preventDefault()}
                onClick={e => {
                    selectFile(e);
                }}>
                <Checkbox
                    sx={{ display: 'none' }}
                    checked={selected}
                    onChange={e => changeSelected(e.target.checked, id)}
                    inputRef={checkboxRef}
                />
                <Grid container alignItems='center' mb={1} columnSpacing={1}>
                    <Grid item height='20px'>
                        <Icon name={fileIcon} height='20px' />
                    </Grid>
                    <Grid item xs sx={{ overflow: 'hidden' }}>
                        <Typography
                            variant='body2'
                            fontWeight='500'
                            sx={{
                                lineHeight: 1,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: '1',
                            }}>
                            {name}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <IconButton
                            sx={{ p: 0.4 }}
                            onClick={e => {
                                // e.stopPropagation();
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
                                    : { objectFit: 'contain', height: '50%', width: '50%' }
                            }
                        />
                    )}
                </Box>
            </Card>

            <Menu
                anchorEl={anchorElDetail}
                open={Boolean(anchorElDetail)}
                onClose={e => {
                    closeDetailMenu(e);
                    clearAll();
                }}
                onClick={e => e.stopPropagation()}
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
                {trash ? (
                    <span>
                        <MenuItem onClick={restore}>
                            <ListItemIcon>
                                <RestoreIcon />
                            </ListItemIcon>
                            Restore
                        </MenuItem>
                        <MenuItem onClick={deleteFile}>
                            <ListItemIcon>
                                <DeleteOutlinedIcon />
                            </ListItemIcon>
                            Delete Forever
                        </MenuItem>{' '}
                    </span>
                ) : (
                    <span>
                        <MenuItem
                            onClick={() => {
                                closeDetailMenu();
                                openPreview();
                            }}>
                            <ListItemIcon>
                                <VisibilityOutlinedIcon />
                            </ListItemIcon>
                            Preview
                        </MenuItem>
                        <MenuItem onClick={download}>
                            <ListItemIcon>
                                <FileDownloadOutlinedIcon />
                            </ListItemIcon>
                            Download
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
                        <MenuItem onClick={makeCopy}>
                            <ListItemIcon>
                                <ContentCopyIcon />
                            </ListItemIcon>
                            Make a copy
                        </MenuItem>
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
                        <MenuItem onClick={openOrganizeMenu}>
                            <ListItemIcon>
                                {' '}
                                <FolderOutlinedIcon />{' '}
                            </ListItemIcon>
                            Organize
                        </MenuItem>
                        <Menu
                            anchorEl={anchorElOrganize}
                            open={Boolean(anchorElOrganize)}
                            onClose={closeOrganizeMenu}
                            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
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
                            <MenuItem
                                onClick={() => {
                                    openMove();
                                    closeOrganizeMenu();
                                    closeDetailMenu();
                                }}>
                                <ListItemIcon>
                                    <DriveFileMoveOutlinedIcon />
                                </ListItemIcon>
                                Move
                            </MenuItem>
                            {favorite ? (
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
                            )}
                        </Menu>
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
                        <MenuItem onClick={moveToTrash}>
                            <ListItemIcon>
                                <DeleteOutlinedIcon />
                            </ListItemIcon>
                            Move to trash
                        </MenuItem>
                    </span>
                )}
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
        </React.Fragment>
    );
};

export default memo(FileCard);
