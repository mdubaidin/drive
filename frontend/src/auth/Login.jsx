import { Box, Button, CircularProgress, Divider, Grid, Stack, Typography } from '@mui/material';
import React from 'react';
import { useForm } from 'react-hook-form';
import Form from '../components/Form';
import FacebookButton from '../components/button/FacebookButton';
import GoogleButton from '../components/button/GoogleButton';
import Input from '../components/Input';
import useErrorHandler from '../hooks/useErrorHandler';
import { isEmpty } from '../utils/function';
import { authApi } from '../utils/axios';
import IntroBox from './components/IntroBox';
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { useNavigate, Link } from 'react-router-dom';
import Image from '../components/Image';
import { setCookie } from '../utils/cookies';
import Title from './components/Title';

const Login = () => {
    const navigate = useNavigate();
    const errorHandler = useErrorHandler();
    const signIn = useSignIn();

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

            setCookie('jwt-auth.access-token', data.accessToken);
            setCookie('jwt-auth.refresh-token', data.refreshToken);
            navigate('/');
        } catch (err) {
            errorHandler(err);
        }
    };

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
        <Grid container height='100%'>
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
                    <Title>Sign In</Title>
                    <Typography variant='body2' mb={isEmpty(errors) ? 6 : 1} color='text.secondary'>
                        Enter your credentials to sign-in your account.
                    </Typography>

                    {isEmpty(errors) ? null : (
                        <Typography variant='body2' color='red' mb={3.5}>
                            {Object.values(errors)[0]?.message}
                        </Typography>
                    )}
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Typography variant='subtitle2' gutterBottom>
                            Email Address
                        </Typography>

                        <Input
                            fieldName='email'
                            placeholder='name@workmail.com'
                            register={register}
                            registerOptions={{
                                required: 'Email address is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                    message: 'Email address must be valid',
                                },
                            }}
                        />
                        <Typography variant='subtitle2' gutterBottom>
                            Password
                            <div
                                variant='body2'
                                onClick={() => navigate('/auth/identify')}
                                style={{
                                    float: 'right',
                                    textDecoration: 'none',
                                    color: '#0472D2',
                                    cursor: 'pointer',
                                    fontSize: 13,
                                }}>
                                Forget password?
                            </div>
                        </Typography>

                        <Input
                            fieldName='password'
                            placeholder='Enter your password'
                            type='password'
                            register={register}
                            registerOptions={{ required: 'Password is required' }}
                            sx={{ mb: 2.5 }}
                        />

                        <Button
                            type='submit'
                            variant='contained'
                            size='large'
                            fullWidth
                            disabled={isSubmitting}
                            endIcon={
                                isSubmitting && <CircularProgress color='inherit' size='small' />
                            }
                            sx={{ p: 1.5, my: 1 }}>
                            Sign in
                        </Button>
                    </Form>
                    <Divider variant='middle' sx={{ borderWidth: '2px', my: 2 }}>
                        <Typography variant='body2' color='text.secondary'>
                            Or continue with
                        </Typography>
                    </Divider>

                    <Stack mt={3} spacing={2} my={3.5}>
                        <GoogleButton name='Continue with Google' />
                        <FacebookButton name='Continue with Facebook' />
                    </Stack>

                    <Stack direction='row' justifyContent='center' spacing={2}>
                        <div>New to Drive?</div>
                        <Link to='/auth/sign-up'>Sign up</Link>
                    </Stack>
                </Box>
            </Grid>
        </Grid>
    );
};

export default Login;
