import { Box, Button, Card, Stack, TextField, Typography } from '@mui/material';
import Image from './Image';
import { useForm, Form, Submit } from './../hooks/useForm';
import { Input } from './../hooks/useForm/inputs';
import { useMessage } from '../providers/Provider';
import { useAuthorize } from '../hooks/Authorize';

function Setup() {
    const { showSuccess, showError } = useMessage();
    const authorize = useAuthorize();

    const handlers = useForm(
        {
            purpose: { required: true },
            occupation: { required: true },
        },
        { Input: TextField }
    );

    const onSubmit = res => {
        const { success, message } = res.data;

        if (success) {
            showSuccess(message);
            authorize(success);
            return;
        }

        showError(message);
    };

    function onError(err) {
        const { message } = err.response.data;

        showError(message);
    }

    return (
        <Box
            maxWidth='900px'
            mx='auto'
            display='flex'
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent='center'
            minHeight='100dvh'>
            <Card
                sx={{
                    borderRadius: '8px',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: { xs: 'transparent', sm: '#1f2228' },
                    width: { xs: '100%', sm: '448px', xl: '512px' },
                    p: { xs: 3, sm: 5 },
                    transition: '.2s',
                }}
                elevation={0}>
                <Box mb={7} textAlign='center'>
                    <Stack
                        direction='row'
                        alignItems='center'
                        justifyContent='center'
                        spacing={1}
                        mb={3}>
                        <Image cdn='files/logo/files.png' sx={{ height: '40px' }} />
                        <Typography variant='h5' fontWeight={500}>
                            Clikkle Files
                        </Typography>
                    </Stack>
                    <Typography variant='body2' maxWidth='46ch' mx='auto'>
                        Welcome to Clikkle, the secure cloud file storage service. Enjoy easy file
                        management, flexible sharing, and advanced encryption.
                    </Typography>
                </Box>

                <Box>
                    <Form
                        onSubmit={onSubmit}
                        handlers={handlers}
                        action='/setup'
                        method='post'
                        onError={onError}>
                        <Typography variant='subtitle2' gutterBottom>
                            What is your occupation or professional field?
                        </Typography>
                        <Input variant='outlined' name='occupation' fullWidth />
                        <Typography variant='subtitle2' gutterBottom>
                            Why do you prefer our files service?
                        </Typography>
                        <Input variant='outlined' name='purpose' fullWidth />

                        <Submit loaderProps={{ color: 'primary', size: 20 }}>
                            {loader => (
                                <Button
                                    variant='contained'
                                    type='submit'
                                    sx={{ float: 'right', py: 1.5, px: 3.2 }}
                                    disabled={Boolean(loader)}
                                    endIcon={loader}>
                                    Start
                                </Button>
                            )}
                        </Submit>
                    </Form>
                </Box>
            </Card>
        </Box>
    );
}

export default Setup;
