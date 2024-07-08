import { Button, Card, IconButton, Stack, TextField, Typography } from '@mui/material';
import { Form, Submit, useForm } from '../hooks/useForm';
import { useMessage } from '../providers/Provider';
import { Input } from '../hooks/useForm/inputs';
import { handleAxiosError } from '../utils/function';
import CloseIcon from '@mui/icons-material/Close';

const Rename = props => {
    const { closeModal, name, id, refresh, file } = props;
    const { showError, showResponse } = useMessage();

    const handlers = useForm(
        {
            name: { value: name, required: true },
        },
        { Input: TextField }
    );

    const onSubmit = function (res) {
        const { success, message } = res.data;

        closeModal();
        if (success) {
            refresh();
            showResponse('File rename successfully');
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
                    Rename
                </Typography>

                <IconButton onClick={closeModal}>
                    <CloseIcon />
                </IconButton>
            </Stack>
            <Form
                handlers={handlers}
                action={file ? `/file/rename/${id}` : `/folder/rename/${id}`}
                method='PATCH'
                onError={onError}
                onSubmit={onSubmit}>
                <Input variant='outlined' size='small' name='name' fullWidth />

                <Submit loaderProps={{ color: 'primary', size: 20 }}>
                    {loader => (
                        <Button
                            type='submit'
                            variant='contained'
                            sx={{ float: 'right', mt: 5 }}
                            disabled={Boolean(loader) || !Boolean(handlers.values.name.trim())}
                            endIcon={loader}>
                            Rename
                        </Button>
                    )}
                </Submit>
            </Form>
        </Card>
    );
};

export default Rename;
