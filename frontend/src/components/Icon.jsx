import Box from '@mui/material/Box';
import React from 'react';

const Icon = props => {
    const { name, src, sx, ...rest } = props;

    const link = process.env.REACT_APP_CDN_SERVER + '/images/' + src;

    return (
        <>
            <Box
                component='img'
                src={src ? link : `${process.env.PUBLIC_URL}/images/icons/${name}`}
                alt='icon'
                sx={{ maxWidth: '100%', ...sx }}
                {...rest}
            />
        </>
    );
};

export default Icon;
