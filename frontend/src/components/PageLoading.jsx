import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import React from 'react';

export default function PageLoading(props) {
    const { condition, children, height, ...rest } = props;
    return condition ? (
        children
    ) : (
        <Box
            display='flex'
            alignItems='center'
            justifyContent='center'
            height={height || 'calc(100% - 150px)'}>
            <CircularProgress {...rest} />
        </Box>
    );
}
