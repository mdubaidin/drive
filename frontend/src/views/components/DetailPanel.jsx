import { Box, Divider, Drawer, Grid, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { getFileIcon, parseKB } from '../../utils/function';
import Icon from '../../components/Icon';

const DetailPanel = props => {
    const { details, detailsPanel, detailsPanelClose, xmLayout } = props;

    return xmLayout ? (
        <Drawer
            anchor='bottom'
            open={detailsPanel}
            onClose={detailsPanelClose}
            sx={{
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                '::-webkit-scrollbar': {
                    display: 'none',
                },
                '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    bgcolor: 'custom.menu',
                },
            }}>
            {details && (
                <Box p={2}>
                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                        <Box display='inline-flex' alignItems='center' overflow='hidden'>
                            <Icon name={getFileIcon(details.name)} height='20px' sx={{ mr: 1 }} />
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

                    <Divider sx={{ my: 2 }} />
                    <Typography variant='subtitle1' fontWeight={500} mb={1}>
                        General Info
                    </Typography>
                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Type
                            </Typography>
                        </Grid>
                        <Grid item xs>
                            <Typography variant='body2' color='text.primary' fontSize={11} mb={2}>
                                {details.name
                                    ?.match(/.[a-zA-Z0-9]+$/)[0]
                                    .toUpperCase()
                                    .slice(1)}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Size
                            </Typography>
                        </Grid>

                        <Grid item xs>
                            <Typography variant='body2' fontSize={11} mb={2}>
                                {parseKB(details.size)}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Storage used
                            </Typography>
                        </Grid>
                        <Grid item xs>
                            <Typography variant='body2' fontSize={11} mb={2}>
                                {parseKB(details.size)}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Modified
                            </Typography>
                        </Grid>
                        <Grid item xs>
                            <Typography variant='body2' fontSize={11} mb={2}>
                                {new Date(details.updatedAt).toDateString()}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Created
                            </Typography>
                        </Grid>
                        <Grid item xs>
                            <Typography variant='body2' fontSize={11} mb={2}>
                                {new Date(details.createdAt).toDateString()}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant='subtitle1' fontWeight={500} mt={2} gutterBottom>
                        Sharing
                    </Typography>
                    <Typography variant='body2' mb={2}>
                        {details.email}
                    </Typography>
                </Box>
            )}
        </Drawer>
    ) : (
        <Grid
            item
            sx={{
                width: detailsPanel ? '310px' : '0px',
                transform: detailsPanel ? 'transform(0)' : 'translateX(280px)',
                ml: detailsPanel ? 1.5 : 0,
                transition: '0.2s ease-in',
                transitionProperty: 'width, transform',
                height: 'calc(100vh - 120px)',
                m: 2,
                mt: 'auto',
                backgroundColor: 'background.default',
                borderRadius: '12px',
                overflowY: 'auto',
            }}>
            {details && (
                <Box p={2}>
                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                        <Box display='inline-flex' alignItems='center' overflow='hidden'>
                            <Icon name={getFileIcon(details.name)} height='20px' sx={{ mr: 1 }} />
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

                    <Divider sx={{ my: 2 }} />
                    <Typography variant='subtitle1' fontWeight={500} mb={1}>
                        General Info
                    </Typography>
                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Type
                            </Typography>
                        </Grid>
                        <Grid item xs>
                            <Typography variant='body2' fontSize={11} mb={2}>
                                {details.name
                                    ?.match(/.[a-zA-Z0-9]+$/)[0]
                                    .toUpperCase()
                                    .slice(1)}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Size
                            </Typography>
                        </Grid>

                        <Grid item xs>
                            <Typography variant='body2' fontSize={11} mb={2}>
                                {parseKB(details.size)}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Storage used
                            </Typography>
                        </Grid>
                        <Grid item xs>
                            <Typography variant='body2' fontSize={11} mb={2}>
                                {parseKB(details.size)}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Modified
                            </Typography>
                        </Grid>
                        <Grid item xs>
                            <Typography variant='body2' fontSize={11} mb={2}>
                                {new Date(details.updatedAt).toDateString()}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item xs>
                            <Typography
                                variant='body1'
                                fontWeight={500}
                                fontSize={12}
                                color='text.secondary'>
                                Created
                            </Typography>
                        </Grid>
                        <Grid item xs>
                            <Typography variant='body2' fontSize={11} mb={2}>
                                {new Date(details.createdAt).toDateString()}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant='subtitle1' fontWeight={500} mt={2} gutterBottom>
                        Sharing
                    </Typography>
                    <Typography variant='body2' mb={2}>
                        {details.email}
                    </Typography>
                </Box>
            )}
        </Grid>
    );
};

export default DetailPanel;
