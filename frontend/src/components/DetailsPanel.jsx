import React, { memo } from 'react';
import FileDetails from './files/FileDetails';
import { Drawer, Grid } from '@mui/material';
import FolderDetails from './folder/FolderDetails';

const DetailsPanel = props => {
    const { details, detailsPanel, detailsPanelClose, xmLayout } = props;

    return xmLayout ? (
        <Drawer
            anchor='right'
            open={detailsPanel}
            onClose={detailsPanelClose}
            sx={{
                // borderTopLeftRadius: '8px',
                // borderTopRightRadius: '8px',
                '::-webkit-scrollbar': {
                    display: 'none',
                },
                '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    width: { xs: '100%', sm: '290px' },
                    bgcolor: 'custom.menu',
                },
            }}>
            {detailsPanel === 'file' && (
                <FileDetails details={details} detailsPanelClose={detailsPanelClose} />
            )}

            {detailsPanel === 'folder' && (
                <FolderDetails details={details} detailsPanelClose={detailsPanelClose} />
            )}
        </Drawer>
    ) : (
        <Grid
            item
            sx={{
                width: detailsPanel ? '290px' : '0px',
                flexBasis: detailsPanel ? '290px' : '0px',
                transform: detailsPanel ? 'transform(0)' : 'translateX(290px)',
                ml: detailsPanel ? 1.5 : 0,
                transition: '0.2s ease-in',
                transitionProperty: 'width, transform',
                height: 'calc(100dvh - 90px)',
                backgroundColor: 'background.main',
                borderRadius: '12px',
                overflowY: 'auto',
            }}>
            {detailsPanel === 'file' && (
                <FileDetails details={details} detailsPanelClose={detailsPanelClose} />
            )}

            {detailsPanel === 'folder' && (
                <FolderDetails details={details} detailsPanelClose={detailsPanelClose} />
            )}
        </Grid>
    );
};

export default memo(DetailsPanel);
