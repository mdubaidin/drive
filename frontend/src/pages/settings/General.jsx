import {
    Box,
    Button,
    Divider,
    FormControlLabel,
    Radio,
    RadioGroup,
    styled,
    Typography,
} from '@mui/material';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import useErrorHandler from '../../hooks/useErrorHandler';
import { useMessage } from '../../providers/Provider';
import { parseKB } from '../../utils/function';
import { useTheme } from '../../theme';

const StorageProgress = styled(LinearProgress)(({ theme }) => ({
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 300 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
        backgroundColor: theme.palette.secondary.main,
    },
}));

const General = () => {
    const [stats, setStats] = useState(null);
    const errorHandler = useErrorHandler();
    const { showError } = useMessage();
    const { setTheme, theme } = useTheme();

    const getStorage = useCallback(async () => {
        try {
            const response = await axios.get(`/stats`);

            const { success, errors, stats } = response.data;
            if (!success) return showError(errors);

            setStats(stats);
        } catch (e) {
            errorHandler(e);
        }
    }, [errorHandler, showError]);

    useEffect(() => {
        getStorage();
    }, [getStorage]);

    return (
        <Box sx={{ px: 6, py: 2, maxWidth: 'min(576px, 90%)' }}>
            {stats ? (
                <>
                    <Typography variant='h5' gutterBottom>
                        Storage
                    </Typography>
                    <StorageProgress
                        variant='determinate'
                        value={(stats.used / stats.storage) * 100}
                        sx={{ borderRadius: '5px', width: 256 }}
                    />
                    <Typography variant='caption' component='div' my={1} color='text.primary'>
                        {parseKB(stats.used)} of {parseKB(stats.storage)} used
                    </Typography>
                    <Button
                        variant='text'
                        color='secondary'
                        sx={{
                            width: 130,
                            borderRadius: '100px',
                            border: '1px solid',
                            borderColor: 'custom.border',
                        }}>
                        Buy storage
                    </Button>
                    <Divider variant='fullWidth' sx={{ borderColor: 'custom.border', my: 2.5 }} />
                </>
            ) : null}

            <Typography variant='h5' gutterBottom>
                Appearance
            </Typography>
            <RadioGroup value={theme} onChange={e => setTheme(e.target.value)}>
                <FormControlLabel
                    value='light'
                    control={<Radio color='secondary' />}
                    label='Light'
                    sx={{ mb: 1 }}
                />
                <FormControlLabel
                    value='dark'
                    control={<Radio color='secondary' />}
                    label='Dark'
                    sx={{ mb: 1 }}
                />
                <FormControlLabel
                    value='system'
                    control={<Radio color='secondary' />}
                    label='Device default'
                    sx={{ mb: 1 }}
                />
            </RadioGroup>
        </Box>
    );
};

export default General;
