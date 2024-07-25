import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';

const Logo = props => {
    const { variant = 'text', sx, ...rest } = props;
    const theme = useTheme();

    const image = useMemo(() => {
        if (variant === 'icon') return '/images/logo.png';
        return theme.palette.mode === 'dark'
            ? '/images/logo-text-light.png'
            : '/images/logo-text.png';
    }, [variant, theme.palette.mode]);

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
