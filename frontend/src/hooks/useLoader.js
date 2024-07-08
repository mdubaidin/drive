import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import React, { useState } from 'react';
import { useCallback } from 'react';

const useLoader = props => {
    const { size, color } = props || {};
    const [loading, setLoading] = useState(false);

    const start = useCallback(() => setLoading(true), [setLoading]);
    const end = useCallback(() => setLoading(false), [setLoading]);

    return {
        circular: loading && (
            <CircularProgress
                sx={{ color: color || 'inherit' }}
                size={size ? size + 'px' : '18px'}
            />
        ),
        linear: loading && <LinearProgress sx={{ color: 'inherit' }} />,
        loaderState: loading,
        start,
        end,
    };
};

export default useLoader;
