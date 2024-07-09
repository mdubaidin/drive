import { Container, Typography } from '@mui/material';
import React from 'react';

const Notifications = () => {
    return (
        <Container sx={{ mx: 3, py: 3, maxWidth: 'min(768px, 90%)' }}>
            <Typography variant='h5'>Notifications</Typography>
        </Container>
    );
};

export default Notifications;
