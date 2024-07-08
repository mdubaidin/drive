import { SnackbarContent } from '@mui/material';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import React, { useReducer } from 'react';

const snackReducer = function (state, action) {
    if (!action) return { show: false, severity: state.severity };
    const severity = Object.keys(action)[0];
    const message = Object.values(action)[0];
    return { show: true, severity, message, action };
};

function SlideTransition(props) {
    return <Slide {...props} direction='up' />;
}

export default function useSnack() {
    const [snack, showMessage] = useReducer(snackReducer, { show: false });

    console.log(snack?.action);
    return {
        SnackBar: (
            <Snackbar
                open={snack.show}
                autoHideDuration={4000}
                onClose={() => showMessage(null)}
                TransitionComponent={SlideTransition}
                sx={{
                    '& .MuiSnackbarContent-root': {
                        backgroundColor: 'custom.response',
                        color: 'custom.common',
                    },
                }}>
                {snack.severity === 'response' ? (
                    <SnackbarContent
                        message={snack.message}
                        action={
                            <React.Fragment>
                                <IconButton
                                    sx={{ p: 0.5, color: 'inherit' }}
                                    onClick={() => showMessage(null)}>
                                    <CloseIcon />
                                </IconButton>
                            </React.Fragment>
                        }
                    />
                ) : (
                    <Alert color={snack.severity} severity={snack.severity}>
                        {snack.message}
                    </Alert>
                )}
            </Snackbar>
        ),
        showMessage,
    };
}
