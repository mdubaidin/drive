import React, { memo, useCallback, useRef } from 'react';
import {
    Card,
    Checkbox,
    Grid,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Modal,
    Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useMenu } from '../../hooks/useMenu';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import RestoreIcon from '@mui/icons-material/Restore';
import Icon from '../Icon';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../../providers/Provider';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import useModal from '../../hooks/useModal';
import { handleAxiosError } from '../../utils/function';
import Rename from '../Rename';
import useMedia from '../../hooks/useMedia';

const FolderCard = props => {
    const {
        setDetails,
        detailsPanelOpen,
        folder,
        selected,
        changeSelected,
        disabled,
        detailsPanel,
        clearAll,
        refresh,
        shared,
        openShare,
        openMove,
    } = props;
    const { name, trash, favorite, _id: id, file } = folder;
    const { modalState: renameState, closeModal: closeRename, openModal: openRename } = useModal();
    const { showError, showResponse } = useMessage();
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
    const checkboxRef = useRef();

    const navigate = useNavigate();

    const download = useCallback(async () => {
        closeDetailMenu();
        showResponse('Downloading...');

        try {
            const response = await axios.get(`/folder/download/${id}`, {
                responseType: 'blob',
            });

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `files-download-${name}${Date.now()}.zip`;
            document.body.appendChild(link);
            link.click();
            showResponse(`${name} folder is downloaded successfully`);

            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (e) {
            handleAxiosError(e, showError);
        }
    }, [closeDetailMenu, name, id, showError, showResponse]);

    async function moveToTrash() {
        closeDetailMenu();
        showResponse('Working...');

        try {
            const response = await axios.post(`/trash/folder/${id}`);

            const { success, message } = response.data;
            console.log({ message, success });
            if (!success) return showError(message);

            refresh();
            showResponse('Folder moved to trash');
        } catch (e) {
            handleAxiosError(e, showError);
        }
    }

    async function addFavorite() {
        showResponse('Working...');
        closeDetailMenu();
        closeOrganizeMenu();

        try {
            const response = await axios.patch(`/folder/favorite/add/${id}`);

            const { success, message } = response.data;

            if (!success) return showError(message);

            refresh();
            showResponse(`${name} is added to favorite`);
        } catch (e) {
            handleAxiosError(e, showError);
        }
    }

    async function removeFavorite() {
        showResponse('Working...');
        closeDetailMenu();
        closeOrganizeMenu();

        try {
            const response = await axios.patch(`/folder/favorite/remove/${id}`);

            const { success, message } = response.data;

            if (!success) return showError(message);

            refresh();
            showResponse(`${name} is removed from favorite`);
        } catch (e) {
            handleAxiosError(e, showError);
        }
    }

    async function restore() {
        showResponse('Working...');
        closeDetailMenu();

        try {
            const response = await axios.post(`/trash/restore/folder/${id}`);

            const { success, message } = response.data;

            if (!success) return showError(message);

            refresh();
            showResponse('Folder restored');
        } catch (e) {
            handleAxiosError(e, showError);
        }
    }

    async function deleteFolder() {
        showResponse('Working...');
        closeDetailMenu();

        try {
            const response = await axios.patch(`/trash/delete/folder/${id}`);

            const { success, message } = response.data;

            if (!success) return showError(message);

            refresh();
            showResponse('Folder deleted successfully');
        } catch (e) {
            console.log(e);
            handleAxiosError(e, showError);
        }
    }

    const openFolder = useCallback(
        e => {
            e.preventDefault();
            e.stopPropagation();

            if (!trash) {
                if (shared) {
                    navigate(`/shared-folder/${id}`, {
                        state: { id },
                    });
                } else {
                    navigate(`/folder/${id}`, {
                        state: { id },
                    });
                }
                clearAll && clearAll();
            }
        },
        [clearAll, id, shared, trash, navigate]
    );

    const selectFolder = e => {
        e.stopPropagation();

        if (xsLayout) return openFolder(e);

        if (e.ctrlKey) {
            checkboxRef.current.focus();
            checkboxRef.current.click();
            return;
        }
        changeSelected(true, id, 'one');

        if (!disabled && !trash) {
            detailsPanel && detailsPanelOpen();

            setDetails(folder);
        }
    };

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
                    cursor: 'default',
                    '&:hover': {
                        bgcolor: selected ? 'custom.selectedCard' : 'custom.cardHover',
                    },
                }}
                id='selectable'
                elevation={0}
                onDoubleClick={openFolder}
                onClick={selectFolder}>
                <Checkbox
                    sx={{ display: 'none' }}
                    checked={selected}
                    onChange={e => changeSelected(e.target.checked, id)}
                    inputRef={checkboxRef}
                />
                <Grid
                    container
                    alignItems='center'
                    flexWrap='nowrap'
                    columnSpacing={2}
                    id='selectable'>
                    <Grid item height='20px'>
                        <Icon name='folder.png' sx={{ height: '20px' }} />
                    </Grid>
                    <Grid item xs sx={{ overflow: 'hidden' }}>
                        <Typography
                            variant='body2'
                            fontWeight='500'
                            sx={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
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
                {trash ? (
                    <span>
                        <MenuItem onClick={restore}>
                            <ListItemIcon>
                                <RestoreIcon />
                            </ListItemIcon>
                            Restore
                        </MenuItem>
                        <MenuItem onClick={deleteFolder}>
                            <ListItemIcon>
                                <DeleteOutlinedIcon />
                            </ListItemIcon>
                            Delete Forever
                        </MenuItem>{' '}
                    </span>
                ) : (
                    <span>
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
                                    closeDetailMenu();
                                    closeOrganizeMenu();
                                    openMove();
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

                                folder.path = name;
                                setDetails(folder);
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
                        file={file}
                    />
                </>
            </Modal>
        </>
    );
};

export default memo(FolderCard);
