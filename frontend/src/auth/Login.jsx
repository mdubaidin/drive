import { Box, Button, CircularProgress, Divider, Stack, Typography, Link } from '@mui/material';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Form from '../components/Form';
import Input from '../components/Input';
import useErrorHandler from '../hooks/useErrorHandler';
import { isEmpty } from '../utils/function';
import { authApi } from '../utils/axios';
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { useNavigate } from 'react-router-dom';
import Image from '../components/Image';
import Title from './components/Title';
import Layout from './Layout';
import { GoogleLogin } from '@react-oauth/google';
import useLoader from '../hooks/useLoader';
import { useMessage } from '../providers/Provider';

const Login = () => {
    const navigate = useNavigate();
    const errorHandler = useErrorHandler();
    const signIn = useSignIn();
    const { start, end, backdrop } = useLoader();
    const { showError } = useMessage();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async ({ email, password }) => {
        try {
            const { data } = await authApi.post('/login', { email, password });

            signIn({
                auth: { token: data.accessToken },
                refresh: data.refreshToken,
                userState: data.user,
            });

            navigate('/');
        } catch (err) {
            errorHandler(err);
        }
    };

    const createAccountByProvider = useCallback(
        async response => {
            try {
                start();
                const { data } = await authApi.post('/providers/google', {
                    credential: response.credential,
                });

                const auth = { token: data.accessToken };
                const refresh = data.refreshToken;
                const userState = data.userInfo;

                signIn({
                    auth,
                    refresh,
                    userState,
                });

                navigate('/');
            } catch (e) {
                errorHandler(e);
            } finally {
                end();
            }
        },
        [errorHandler, start, end, signIn, navigate]
    );

    // useEffect(() => {
    //     const params = new URLSearchParams(location.search);
    //     const error = params.get('e');
    //     const status = params.get('s');
    //     if (error && status !== '200') {
    //         showError(error);
    //     }
    //     if (status === '200') {
    //         navigate('/');
    //     }
    // }, [navigate, showError]);

    return (
        <Layout>
            <Box sx={{ p: 5 }}>
                <Image name='logo.png' sx={{ height: 30 }} />
                {backdrop}
                <Title>Sign In</Title>
                <Typography variant='body1' mb={isEmpty(errors) ? 6 : 1} color='text.secondary'>
                    Enter your credentials to sign-in your account.
                </Typography>

                {isEmpty(errors) ? null : (
                    <Typography variant='body2' color='red' mb={3.5}>
                        {Object.values(errors)[0]?.message}
                    </Typography>
                )}
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Input
                        label='Email Address'
                        fieldName='email'
                        register={register}
                        registerOptions={{
                            required: 'Email address is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                message: 'Email address must be valid',
                            },
                        }}
                        sx={{ mb: 2.5 }}
                    />

                    <Input
                        label='Password'
                        fieldName='password'
                        type='password'
                        register={register}
                        registerOptions={{ required: 'Password is required' }}
                        sx={{ mb: 2.5 }}
                    />

                    <Typography
                        variant='body2'
                        onClick={() => navigate('/auth/identify')}
                        sx={{
                            mt: -1.5,
                            float: 'right',
                            textDecoration: 'none',
                            color: '#0472D2',
                            cursor: 'pointer',
                            fontSize: 13,
                        }}>
                        Forget password?
                    </Typography>

                    <Button
                        type='submit'
                        variant='contained'
                        fullWidth
                        disabled={isSubmitting}
                        endIcon={isSubmitting && <CircularProgress color='inherit' size='small' />}
                        sx={{ p: 1, my: 1 }}>
                        Sign in
                    </Button>
                </Form>
                <Divider variant='middle' sx={{ borderWidth: '2px', my: 2 }}>
                    <Typography variant='body2' color='text.secondary'>
                        Or continue with
                    </Typography>
                </Divider>

                <Stack spacing={2} my={2.5} justifyContent='center' alignItems='center'>
                    <GoogleLogin
                        text='continue_with'
                        size='large'
                        useOneTap
                        onSuccess={createAccountByProvider}
                        onError={() =>
                            showError('Something went wrong while signing in with Google')
                        }
                    />
                </Stack>

                <Stack direction='row' justifyContent='center' spacing={2}>
                    <Typography variant='body2'>New to Cloud Drive?</Typography>
                    <Link href='/auth/sign-up' color='primary.main'>
                        Sign up
                    </Link>
                </Stack>
            </Box>
        </Layout>
    );
};

export default Login;
