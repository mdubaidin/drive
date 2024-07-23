import Typography from '@mui/material/Typography';
import React from 'react';

const Title = ({ children }) => {
    return (
        <Typography
            variant='h4'
            sx={{
                fontSize: 40,
                fontWeight: '500',
                backgroundImage:
                    'linear-gradient(56deg, rgba(43, 46, 224, 0.15) 0%,rgba(26, 218, 182, 0.15) 100%),linear-gradient(336deg, rgb(50, 52, 221),rgb(60, 239, 241))',
                backgroundClip: 'text',
                color: 'transparent',
            }}
            gutterBottom>
            {children}
        </Typography>
    );
};

export default Title;
