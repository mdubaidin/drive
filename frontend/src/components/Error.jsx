import { Box, Container, Grid, Typography } from '@mui/material';
import React from 'react';
import Image from './Image';

const Error = props => {
    const { error, errorCode, title } = props;
    return (
        <Container maxWidth='lg'>
            <Box
                display='flex'
                justifyContent='center'
                alignItems='center'
                minHeight='calc(100dvh - 80px)'
                color='white'
                my={5}>
                <Grid container alignItems='center' spacing={2}>
                    <Grid item xs={12} md={8}>
                        <Image cdn='files/logo/2023/files-text.png' sx={{ height: '70px' }} />

                        <Box ml={2}>
                            <Typography variant='h4' color='text.secondary' fontWeight={400} my={3}>
                                <Typography
                                    variant='h5'
                                    fontWeight={500}
                                    color='text.primary'
                                    component='span'>
                                    {errorCode}
                                </Typography>
                                {title || `That's an error.`}
                            </Typography>
                            <Typography variant='h6' mb={1}>
                                {error}
                            </Typography>
                            <Typography variant='subtitle1' color='text.secondary'>
                                That's all we know
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4} align='center'>
                        <Image
                            name='robot.png'
                            sx={{ maxWidth: '384px', width: '100%', mt: { xs: 4, md: 0 } }}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default Error;
