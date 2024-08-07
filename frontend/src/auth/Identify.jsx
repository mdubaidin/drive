import React, { useState } from 'react';
import useErrorHandler from '../hooks/useErrorHandler';
import { useForm } from 'react-hook-form';
import { Box, Button, CircularProgress, Stack, Typography, Link } from '@mui/material';
import Image from '../components/Image';
import { isEmpty } from '../utils/function';
import Input from '../components/Input';
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
            <Box sx={{ p: { xs: 2.5, md: 5 } }}>
                <Image name='logo.png' sx={{ height: 30 }} />

                {emailSent ? (
                    <Box>
                        <Title>Email Sent!</Title>

                        <Typography
                            variant='body2'
                            mb={isEmpty(errors) ? 6 : 1}
                            color='text.secondary'>
                            Kindly check your email inbox. we have just sent your reset password
                            link
                        </Typography>
                    </Box>
                ) : (
                    <Box>
                        <Title>Trouble Logging in?</Title>
                        <Typography
                            variant='body2'
                            mb={isEmpty(errors) ? 6 : 1}
                            color='text.secondary'>
                            Please enter your email address and we&apos;ll send you a link to get
                            back into your account.
                        </Typography>

                        {isEmpty(errors) ? null : (
                            <Typography variant='body2' color='red' mb={3.5}>
                                {Object.values(errors)[0]?.message}
                            </Typography>
                        )}
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Input
                                label='Email address'
                                fieldName='email'
                                variation='auth'
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
                                type='submit'
                                variant='contained'
                                fullWidth
                                disabled={isSubmitting}
                                endIcon={
                                    isSubmitting && (
                                        <CircularProgress color='inherit' size='small' />
                                    )
                                }
                                sx={{ p: 1, my: 1 }}>
                                Send
                            </Button>
                        </Form>
                        <Stack direction='row' justifyContent='center' mt={3} spacing={2}>
                            <Typography variant='body2'>Already have an account?</Typography>
                            <Link href='/auth/sign-in'>Sign in</Link>
                        </Stack>
                    </Box>
                )}
            </Box>
        </Layout>
    );
};

export default Identify;
