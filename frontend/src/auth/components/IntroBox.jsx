import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Image from '../../components/Image';

const IntroBox = props => {
    const { imageName, title, content } = props;

    return (
        <Box
            sx={{
                backgroundImage: "url('/images/auth-bg.jpg')",
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                borderRadius: '5px',
                color: 'white',
                height: '100%',
            }}>
            <Box textAlign='center' mb={4}>
                <Image name={imageName} sx={{ width: '95%', boxSizing: 'border-box', my: 2 }} />
            </Box>
            <Typography
                variant='subtitle1'
                align='center'
                component='p'
                sx={{ fontWeight: '500', mb: 2 }}>
                {title}
            </Typography>
            <Typography
                variant='body2'
                align='center'
                component='p'
                sx={{ fontSize: '12px', px: 2, pb: 5 }}>
                {content}
            </Typography>
        </Box>
    );
};

export default IntroBox;
