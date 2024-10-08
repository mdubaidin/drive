import { Box, Button, CircularProgress, Link, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import Image from '../components/Image';
import Title from './components/Title';
import { isEmpty } from '../utils/function';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authApi } from '../utils/axios';
import useErrorHandler from '../hooks/useErrorHandler';
import Form from '../components/Form';
import Input from '../components/Input';
import { useMessage } from '../providers/Provider';
import NotFound from '../components/NotFound';
import Layout from './Layout';

const ResetPassword = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const errorHandler = useErrorHandler();
    const { showSuccess } = useMessage();
    const [isValid, setIsValid] = useState(false);
    const email = params.get('email');
    const code = params.get('code');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
    } = useForm();

    const onSubmit = async data => {
        try {
            await authApi.patch('/create-password', {
                email: params.get('email'),
                password: data.password,
            });

            showSuccess('Password changed!');
            navigate('/auth/sign-in');
        } catch (err) {
            errorHandler(err);
        }
    };

    const verify = useCallback(
        async function (email, otp) {
            try {
                await authApi.post('/verify', { email, otp });
                setIsValid(true);
            } catch (err) {
                errorHandler(err);
            }
        },
        [errorHandler, setIsValid]
    );

    useEffect(() => {
        verify(email, code);
    }, [verify, email, code, setIsValid]);

    if (!isValid) {
        return <NotFound />;
    }

    return (
        <Layout>
            <Box sx={{ p: { xs: 2.5, md: 5 } }}>
                <Image name='logo.png' sx={{ height: 30 }} />
                <Title>Create a new password</Title>
                <Typography variant='body2' mb={isEmpty(errors) ? 7 : 1} color='text.secondary'>
                    Guard your digital gate with a strong password: a mix of characters, length, and
                    uniqueness.
                </Typography>

                {isEmpty(errors) ? null : (
                    <Typography variant='body2' color='red' mb={3.5}>
                        {Object.values(errors)[0]?.message}
                    </Typography>
                )}
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Input
                        variation='auth'
                        type='password'
                        label='New password'
                        fieldName='password'
                        register={register}
                        registerOptions={{ required: 'Password is required' }}
                    />

                    <Input
                        variation='auth'
                        type='password'
                        label='Confirm password'
                        fieldName='confirmPassword'
                        register={register}
                        registerOptions={{
                            required: 'Confirm password is required',
                            validate: val => {
                                if (watch('password') !== val) {
                                    return `Password did not match`;
                                }
                            },
                        }}
                    />

                    <Button
                        type='submit'
                        variant='contained'
                        fullWidth
                        disabled={isSubmitting}
                        endIcon={isSubmitting && <CircularProgress color='inherit' size='small' />}
                        sx={{ p: 1, my: 1 }}>
                        Reset password
                    </Button>
                </Form>

                <Stack direction='row' justifyContent='center' mt={3} spacing={2}>
                    <Typography variant='body2'>Already have an account?</Typography>
                    <Link href='/auth/sign-in' color='primary.main' fontWeight={500}>
                        Sign In
                    </Link>
                </Stack>
            </Box>
        </Layout>
    );
};

export default ResetPassword;
