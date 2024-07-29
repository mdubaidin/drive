import { Box, Button, CircularProgress, Divider, Stack, Typography, Link } from '@mui/material';
import React, { createContext, useState, useContext, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Form from '../components/Form';
import Input from '../components/Input';
import useErrorHandler from '../hooks/useErrorHandler';
import { isEmpty } from '../utils/function';
import { useMessage } from '../providers/Provider';
import { authApi } from '../utils/axios';

import { useNavigate } from 'react-router-dom';
import Image from '../components/Image';
import Title from './components/Title';
import Layout from './Layout';
import { GoogleLogin } from '@react-oauth/google';
import useLoader from '../hooks/useLoader';
import useSignIn from 'react-auth-kit/hooks/useSignIn';

const initialFormInput = { name: '', email: '', password: '', otp: '' };

const FormContext = createContext({
    data: initialFormInput,
    setData: () => {},
    step: 0,
    setStep: () => {},
});

const Steps = [CreateAccount, EmailConfirmation];

const Main = () => {
    const [data, setData] = useState({});
    const [step, setStep] = useState(0);

    return (
        <Layout>
            <FormContext.Provider value={{ data, setData, step, setStep }}>
                {React.createElement(Steps[step])}
            </FormContext.Provider>
        </Layout>
    );
};

function CreateAccount() {
    const { setData, setStep } = useContext(FormContext);
    const errorHandler = useErrorHandler();
    const { showError } = useMessage();
    const signIn = useSignIn();
    const navigate = useNavigate();
    const { start, end, backdrop } = useLoader();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const onSubmit = async data => {
        try {
            await authApi.post('/create-account/step1', { email: data.email });

            setData(data);
            setStep(1);
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

    return (
        <Box sx={{ p: 5 }}>
            {backdrop}
            <Image name='logo.png' sx={{ height: 30 }} />
            <Title>Create account</Title>
            <Typography variant='body2' mb={isEmpty(errors) ? 6 : 1} color='text.secondary'>
                Enter your credentials and start journey with us.
            </Typography>

            {isEmpty(errors) ? null : (
                <Typography variant='body2' color='red' mb={3.5}>
                    {Object.values(errors)[0]?.message}
                </Typography>
            )}
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Input
                    label='Full name'
                    fieldName='name'
                    register={register}
                    registerOptions={{
                        required: 'Full name is required',
                        minLength: {
                            value: 3,
                            message: 'Name must be at least 3 characters',
                        },
                        maxLength: {
                            value: 40,
                            message: 'Name exceeds the maximum character limit',
                        },
                    }}
                    sx={{ mb: 2.5 }}
                />

                <Input
                    label='Email address'
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

                <Button
                    type='submit'
                    variant='contained'
                    fullWidth
                    disabled={isSubmitting}
                    endIcon={isSubmitting && <CircularProgress color='inherit' size='small' />}
                    sx={{ p: 1, my: 1 }}>
                    Next
                </Button>
            </Form>
            <Divider variant='middle' sx={{ borderWidth: '2px', my: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                    Or create an account with
                </Typography>
            </Divider>

            <Stack spacing={2} my={2.5} justifyContent='center'>
                <GoogleLogin
                    text='signup_with'
                    width='400px'
                    size='large'
                    useOneTap
                    onSuccess={createAccountByProvider}
                    context='signup'
                    onError={() => showError('Something went wrong while signing in with Google')}
                />
            </Stack>

            <Stack direction='row' justifyContent='center' mt={3} spacing={2}>
                <Typography variant='body2'>Already have an account?</Typography>
                <Link href='/auth/sign-in' color='primary.main' fontWeight={500}>
                    Sign In
                </Link>
            </Stack>
        </Box>
    );
}

function EmailConfirmation() {
    const { data, setStep } = useContext(FormContext);
    const errorHandler = useErrorHandler();
    const navigate = useNavigate();
    const { showSuccess } = useMessage();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const onSubmit = async inputData => {
        try {
            await authApi.post('/create-account/step2', { ...data, ...inputData });

            showSuccess('Account created');
            navigate('/auth/sign-in');
        } catch (err) {
            errorHandler(err);
        }
    };

    return (
        <Box sx={{ p: { xs: 2.5, md: 5 } }}>
            <Image name='logo.png' sx={{ height: 30 }} />
            <Title>Email Confirmation</Title>
            <Typography variant='body2' mb={isEmpty(errors) ? 6 : 1} color='text.secondary'>
                Cloud Drive wants to make sure that it&apos;s really you. Cloud Drive will send an
                email with a six-digit confirmation code on your{' '}
                <Link href={`mailto:${data.email}`}>{data.email}</Link>.
            </Typography>

            {isEmpty(errors) ? null : (
                <Typography variant='body2' color='red' mb={3.5}>
                    {Object.values(errors)[0]?.message}
                </Typography>
            )}
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Input
                    label='Email confirmation code'
                    fieldName='otp'
                    type='number'
                    register={register}
                    registerOptions={{
                        required: 'Email confirmation code is required',
                        minLength: {
                            value: 6,
                            message: 'Code must be at least 6 characters',
                        },
                        maxLength: {
                            value: 6,
                            message: 'Code must be at least 6 characters',
                        },
                    }}
                />

                <Button
                    fullWidth
                    type='submit'
                    variant='contained'
                    disabled={isSubmitting}
                    endIcon={isSubmitting && <CircularProgress color='inherit' size='small' />}
                    sx={{
                        mt: 2,
                        mb: 2,
                        py: 1,
                        borderRadius: '10px',
                    }}>
                    Confirm
                </Button>
                <Button
                    fullWidth
                    variant='outlined'
                    onClick={() => {
                        setStep(0);
                    }}
                    sx={{
                        mb: 2.5,
                        py: 1,
                        borderRadius: '10px',
                    }}>
                    Back
                </Button>
            </Form>
        </Box>
    );
}

export default Main;
