import { Box, Button, Select as MuiSelect, Stack } from '@mui/material';
import React, { useState } from 'react';
import Close from '@mui/icons-material/Close';
import Done from '@mui/icons-material/Done';

const Select = props => {
    const { children, filter, clear, sx, ...rest } = props;
    const [select, setSelect] = useState(false);

    const closeSelect = () => setSelect(false);
    const openSelect = () => setSelect(true);

    return (
        <Box sx={{ position: 'relative', p: 0, m: 0 }}>
            <MuiSelect
                open={select}
                onClose={closeSelect}
                onOpen={e => {
                    e.stopPropagation();
                    openSelect();
                }}
                size='small'
                sx={{
                    py: 0.5,
                    '& .MuiSelect-select.MuiInputBase-input.MuiOutlinedInput-input': {
                        px: filter && 5,
                    },
                    ...sx,
                }}
                {...rest}>
                {children}
            </MuiSelect>
            {filter && (
                <Stack
                    direction='row'
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 3,
                        right: 0,
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        backgroundColor: 'custom.selectedCard',
                        borderRadius: '8px',
                        // alignItems: 'stretch',
                    }}>
                    <Button
                        startIcon={<Done />}
                        onClick={openSelect}
                        sx={{
                            flexBasis: '100%',
                            color: 'text.primary',
                            borderTopLeftRadius: '8px',
                            borderBottomLeftRadius: '8px',
                            paddingTop: '4px',
                            paddingBottom: '4px',
                            '&:hover': {
                                backgroundColor: 'custom.selectedHover',
                            },
                        }}>
                        {filter[0].toUpperCase() + filter.slice(1)}
                    </Button>
                    <Button
                        onClick={clear}
                        sx={{
                            p: 0,
                            flexBasis: '30px',
                            minWidth: '30px',
                            color: 'text.primary',
                            borderTopRightRadius: '8px',
                            borderBottomRightRadius: '8px',
                            paddingTop: '4px',
                            paddingBottom: '4px',
                            '&:hover': {
                                backgroundColor: 'custom.selectedHover',
                            },
                        }}>
                        <Close sx={{ fontSize: '18px' }} />
                    </Button>
                </Stack>
            )}
        </Box>
    );
};

export default Select;
