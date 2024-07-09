import React, { useState } from 'react';
import useErrorHandler from '../hooks/useErrorHandler';
import { useForm } from 'react-hook-form';
import IntroBox from './components/IntroBox';
import { Box, Button, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import Image from '../components/Image';
import { isEmpty } from '../utils/function';
import Input from '../components/Input';
import { Link } from 'react-router-dom';
import { authApi } from '../utils/axios';
import Form from '../components/Form';
import Title from './components/Title';
import Layout from './Layout';

const Identify = () => {
    const errorHandler = useErrorHandler();
    const [emailSent, setEmailSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const onSubmit = async data => {
        try {
            await authApi.post('/identify', data);

            setEmailSent(true);
        } catch (err) {
            errorHandler(err);
        }
    };
    return (
        <Layout>
            <Grid container>
                <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                    <IntroBox
                        imageName='login-img01.png'
                        title={`Let's store your life`}
                        content='Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,
molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum
numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium
optio, eaque rerum! Provident similique accusantium nemo autem. Veritatis
obcaecati tenetur iure eius earum ut molestias architecto voluptate aliquam
nihil, eveniet aliquid culpa officia aut!'
                    />
                </Grid>
                <Grid item xs={12} md={7}>
                    <Box sx={{ p: { xs: 2.5, md: 5 } }}>
                        <Image name='logo.png' sx={{ height: 30 }} />

                        {emailSent ? (
                            <Box>
                                <Title>Email Sent!</Title>

                                <Typography
                                    variant='body2'
                                    mb={isEmpty(errors) ? 6 : 1}
                                    color='text.secondary'>
                                    Kindly check your email inbox. we have just sent your reset
                                    password link
                                </Typography>
                            </Box>
                        ) : (
                            <Box>
                                <Title>Trouble Logging in?</Title>
                                <Typography
                                    variant='body2'
                                    mb={isEmpty(errors) ? 6 : 1}
                                    color='text.secondary'>
                                    Please enter your email address and we&apos;ll send you a link
                                    to get back into your account.
                                </Typography>

                                {isEmpty(errors) ? null : (
                                    <Typography variant='body2' color='red' mb={3.5}>
                                        {Object.values(errors)[0]?.message}
                                    </Typography>
                                )}
                                <Form onSubmit={handleSubmit(onSubmit)}>
                                    <Input
                                        fieldName='email'
                                        variation='auth'
                                        placeholder='Email address'
                                        register={register}
                                        registerOptions={{
                                            required: 'Email address is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                                message: 'Email address must be valid',
                                            },
                                        }}
                                    />

                                    <Button
                                        fullWidth
                                        type='submit'
                                        variant='contained'
                                        disabled={isSubmitting}
                                        endIcon={
                                            isSubmitting && (
                                                <CircularProgress color='inherit' size='small' />
                                            )
                                        }
                                        sx={{
                                            mt: 1,
                                            mb: 2,
                                            py: 1,
                                            borderRadius: '10px',
                                        }}>
                                        Send
                                    </Button>
                                </Form>
                                <Stack direction='row' justifyContent='center' mt={3} spacing={2}>
                                    <div>Already have an account?</div>
                                    <Link to='/auth/sign-in'>Sign in</Link>
                                </Stack>
                            </Box>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Layout>
    );
};

export default Identify;
