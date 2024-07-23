import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '../theme';

const Logo = props => {
    const { variant = 'text', sx, ...rest } = props;
    const { mode } = useTheme();

    const image = useMemo(() => {
        if (variant === 'icon') return '/images/logo.png';
        return mode === 'dark' ? '/images/logo-text-light.png' : '/images/logo-text.png';
    }, [variant, mode]);

    return (
        <Box
            component='img'
            src={process.env.PUBLIC_URL + image}
            alt='logo'
            draggable='false'
            sx={{ maxWidth: '100%', ...sx }}
            {...rest}
        />
    );
};

export default Logo;
