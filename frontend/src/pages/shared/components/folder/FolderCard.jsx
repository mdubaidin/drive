import React, { memo, useCallback, useMemo, useRef } from 'react';
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
import { useMenu } from '../../../../hooks/useMenu';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
// import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import Icon from '../../../../components/Icon';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../../../../providers/Provider';
import useModal from '../../../../hooks/useModal';
import { handleAxiosError } from '../../../../utils/function';
import Share from '../../../../components/Share';
import Rename from '../Rename';
import useMedia from '../../../../hooks/useMedia';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';

const sharedFolder = {
    by: '/shared-by-me/folder/',
    with: '/shared-with-me/folder/',
};

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
    } = props;
    const { name, trash, _id: id, userId, sharedWith, file } = folder;
    const { modalState: renameState, closeModal: closeRename, openModal: openRename } = useModal();
    const { modalState: shareState, closeModal: closeShare, openModal: openShare } = useModal();
    const { showError, showResponse } = useMessage();
    const {
        anchorEl: anchorElDetail,
        openMenu: openDetailMenu,
        closeMenu: closeDetailMenu,
    } = useMenu();
    const xsLayout = useMedia('(max-width: 576px)');
    const checkboxRef = useRef();
    const user = useAuthUser();

    const isAccessable = useMemo(
        () =>
            userId === user._id ||
            sharedWith?.find(sharedUser => sharedUser.userId === user._id)?.access === 'editor',
        [user, userId, sharedWith]
    );

    const navigate = useNavigate();

    const download = useCallback(async () => {
        closeDetailMenu();
        showResponse('Downloading...');

        try {
            const response = await axios.get(`/share/folder/download/${id}`, {
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

    const openFolder = useCallback(
        e => {
            e.stopPropagation();
            if (!trash) {
                if (sharedFolder[shared]) navigate(sharedFolder[shared] + id);
                clearAll && clearAll();
            }
        },
        [clearAll, trash, shared, navigate, id]
    );

    const selectFolder = useCallback(
        e => {
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
        },
        [
            xsLayout,
            changeSelected,
            detailsPanel,
            detailsPanelOpen,
            disabled,
            id,
            folder,
            openFolder,
            setDetails,
            trash,
        ]
    );

    return (
        <>
            <Card
                sx={{
                    p: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '8px',
                    maxWidth: '500px',
                    bgcolor: selected ? 'custom.selectedCard' : 'background.default',
                    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px',
                    cursor: 'default',
                    '&:hover': {
                        bgcolor: selected ? 'custom.selectedCard' : 'custom.cardHover',
                    },
                }}
                elevation={0}
                onDoubleClick={e => {
                    e.stopPropagation();
                    openFolder(e);
                }}
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

                        folder.path = name;
                        setDetails(folder);
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
                        file={file}
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
                    <Share closeModal={closeShare} content={folder} refresh={refresh} />
                </>
            </Modal>
        </>
    );
};

export default memo(FolderCard);
