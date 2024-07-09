import { Box, Button, CircularProgress, Divider, Grid, Stack, Typography } from '@mui/material';
import React, { createContext, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import Form from '../components/Form';
import FacebookButton from '../components/button/FacebookButton';
import GoogleButton from '../components/button/GoogleButton';
import Input from '../components/Input';
import useErrorHandler from '../hooks/useErrorHandler';
import { isEmpty } from '../utils/function';
import { useMessage } from '../providers/Provider';
import { authApi } from '../utils/axios';
import IntroBox from './components/IntroBox';

import { useNavigate, Link } from 'react-router-dom';
import Image from '../components/Image';
import Title from './components/Title';
import Layout from './Layout';

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

    return (
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
                    <Title>Sign Up</Title>
                    <Typography variant='body2' mb={isEmpty(errors) ? 6 : 1} color='text.secondary'>
                        Enter your credentials to login your account.
                    </Typography>

                    {isEmpty(errors) ? null : (
                        <Typography variant='body2' color='red' mb={3.5}>
                            {Object.values(errors)[0]?.message}
                        </Typography>
                    )}
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Typography variant='subtitle2' gutterBottom>
                            Full Name
                        </Typography>
                        <Input
                            fieldName='name'
                            placeholder='John Smith'
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
                        />
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
                        </Typography>

                        <Input
                            fieldName='password'
                            placeholder='Create a new password'
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
                            Next
                        </Button>
                    </Form>
                    <Divider variant='middle' sx={{ borderWidth: '2px', my: 2 }}>
                        <Typography variant='body2' color='text.secondary'>
                            Or create an account with
                        </Typography>
                    </Divider>

                    <Stack mt={3} spacing={2} my={3}>
                        <GoogleButton name='Sign up with Google' />
                        <FacebookButton name='Sign up with Facebook' />
                    </Stack>

                    <Stack direction='row' justifyContent='center' mt={3} spacing={2}>
                        <div>Already have an account?</div>
                        <Link to='/auth/sign-in' color='primary.main' fontWeight={500}>
                            Sign In
                        </Link>
                    </Stack>
                </Box>
            </Grid>
        </Grid>
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
                    <Title>Email Confirmation</Title>
                    <Typography variant='body2' mb={isEmpty(errors) ? 6 : 1} color='text.secondary'>
                        Messenger wants to make sure that it&apos;s really you. Messenger will send
                        an email with a six-digit confirmation code on your{' '}
                        <Link href={`mailto:${data.email}`}>{data.email}</Link>.
                    </Typography>

                    {isEmpty(errors) ? null : (
                        <Typography variant='body2' color='red' mb={3.5}>
                            {Object.values(errors)[0]?.message}
                        </Typography>
                    )}
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Typography variant='subtitle2' gutterBottom>
                            Full Name
                        </Typography>
                        <Input
                            fieldName='otp'
                            placeholder='Email confirmation code'
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
                            endIcon={
                                isSubmitting && <CircularProgress color='inherit' size='small' />
                            }
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
            </Grid>
        </Grid>
    );
}

export default Main;
