import { Button, Container, Stack, Typography } from '@mui/material';
import React from 'react';
import Image from './Image';

const Error = props => {
    const { error } = props;
    return (
        <Container maxWidth='lg'>
            <Stack
                justifyContent='center'
                alignItems='center'
                minHeight='calc(100vh - 80px)'
                textAlign='center'
                my={5}>
                <Image name='logo.png' sx={{ height: '65px', mb: 2 }} alt='logo' />{' '}
                <Typography variant='h4' mb={1}>
                    This Page isn&apos;t available
                </Typography>
                <Typography variant='subtitle1'>
                    The link that you followed may be broken or {error}
                    That&apos;s all we know
                </Typography>
                <Button
                    variant='text'
                    href='/'
                    sx={{ mt: 1.5, mb: 2, py: 1, borderRadius: '10px' }}>
                    Return to Cloud Drive
                </Button>
            </Stack>
        </Container>
    );
};

export default Error;
