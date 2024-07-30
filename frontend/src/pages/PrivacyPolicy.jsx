import { Button, Container, Typography } from '@mui/material';
import React from 'react';

const PrivacyPolicy = () => {
    return (
        <Container
            maxWidth='md'
            sx={{
                mx: 'auto',
                height: '100%',
                pt: 20,
                '& .MuiTypography-root.MuiTypography-subtitle1': {
                    fontSize: { xs: 14, sm: 16 },
                },
            }}>
            <Typography variant='h3' fontWeight={700} mb={1} fontSize={{ xs: 35, sm: 48 }}>
                Cloud Drive Privacy Policy
            </Typography>
            <Typography variant='subtitle1' color='text.tertiary' fontWeight={600} mb={2}>
                Learn about our policies and practices to ensure the privacy and security of your
                personal information
            </Typography>
            <Typography variant='body2' fontWeight={700} mb={5}>
                Effective Date: July 29, 2024
            </Typography>

            <Typography variant='h4' fontWeight={700} mb={2}>
                Privacy
            </Typography>
            <Typography variant='subtitle1' fontWeight={500} mb={3} color='text.tertiary'>
                Cloud Drive allows you to upload, submit, store, send and receive content. your
                content remains yours. We do not claim ownership in any of your content, including
                any text, data, information, and files that you upload, share, or store in your
                Drive account. if you decide to share a document with someone, or want to open it on
                a different device, we can provide that functionality.
            </Typography>

            <Typography variant='subtitle1' fontWeight={500} mb={3} color='text.tertiary'>
                Cloud Drive also allows you to collaborate on the content of other Cloud Drive
                users. The “owner” of the content is the one who controls the content and its use.
            </Typography>

            <Typography variant='subtitle1' fontWeight={500} mb={3} color='text.tertiary'>
                Sharing settings in Cloud Drive allow you to control what others can do with your
                content in Cloud Drive. The privacy settings of your files depends on the folder
                they are in. Files in your individual drive are private, until you decide to share
                them. You can share your content and can transfer control of your content to other
                users. Files you create or place in folders or drives shared by others will inherit
                the sharing settings and may inherit the ownership settings of the folder or drive
                they are in. We will not share your files and data with others except as described
                in our Privacy Policy.
            </Typography>

            <Button variant='text' href='/' sx={{ mt: 1.5, mb: 2, py: 1, borderRadius: '10px' }}>
                Cloud Drive
            </Button>
        </Container>
    );
};

export default PrivacyPolicy;
