import { Button, Card, IconButton, Stack, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';
import { Form, Submit, useForm } from '../../hooks/useForm';
import { useMessage } from '../../providers/Provider';
import { Input } from '../../hooks/useForm/inputs';
import eventEmitter from '../../utils/eventEmitter';
import { getSessionData, handleAxiosError, setSessionData } from '../../utils/function';

const CreateFolder = props => {
    const { closeModal } = props;
    const { showError, showResponse } = useMessage();
    // const { state } = useLocation();

    const handlers = useForm(
        {
            name: '',
        },
        { Input: TextField }
    );

    const onSubmit = function (res) {
        const { success, message } = res.data;
        setSessionData('parentKey', '');

        closeModal();
        if (success) {
            eventEmitter.emit('folderCreated');
            showResponse('Folder created!');
            return;
        }
        showError(message);
    };

    const onError = function (err) {
        handleAxiosError(err, showError);
    };

    return (
        <Card
            sx={{
                boxShadow: 'rgba(0, 0, 0, 0.45) 0px 25px 20px -20px',
                borderRadius: '8px',
                maxWidth: '500px',
                width: '100%',
                mx: 2,
                p: 2,
            }}>
            <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
                <Typography variant='h6' fontWeight={500}>
                    Create a folder
                </Typography>

                <IconButton onClick={closeModal}>
                    <CloseIcon />
                </IconButton>
            </Stack>
            <Form
                handlers={handlers}
                action={`/folder/${getSessionData('parentKey') || ''}`}
                method='POST'
                onError={onError}
                onSubmit={onSubmit}>
                <Input
                    variant='outlined'
                    size='small'
                    name='name'
                    placeholder='Enter your folder name'
                    fullWidth
                />

                <Submit loaderProps={{ color: 'primary', size: 20 }}>
                    {loader => (
                        <Button
                            type='submit'
                            variant='contained'
                            sx={{ float: 'right', mt: 5 }}
                            disabled={Boolean(loader) || !Boolean(handlers.values.name.trim())}
                            endIcon={loader}>
                            Create
                        </Button>
                    )}
                </Submit>
            </Form>
        </Card>
    );
};

export default CreateFolder;
