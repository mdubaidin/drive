import Button from '@mui/material/Button';

import React from 'react';
import Image from '../Image';

const GoogleButton = props => {
    return (
        <Button
            variant='outlined'
            startIcon={<Image alt='google' name='google.png' sx={{ height: 20, width: 20 }} />}
            fullWidth
            sx={{
                '&, &:hover': {
                    py: 0.8,
                    color: 'text.primary',
                    borderColor: 'gray',
                    backgroundColor: 'transparent',
                    fontWeight: 500,
                    borderRadius: '10px',
                },
            }}
            {...props}>
            {props.name}
        </Button>
    );
};

export default GoogleButton;
