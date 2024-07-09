import { Card, FormControl, Grid, InputBase, Typography, useFormControl } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { getFileIcon, handleAxiosError } from '../utils/function';
import Icon from './Icon';
// import TuneIcon from '@mui/icons-material/Tune';
import { useMessage } from '../providers/Provider';

const SearchWrapper = styled('div')(({ theme }) => ({
    position: 'relative',
    marginLeft: 0,
    width: '100%',
    maxWidth: '720px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.custom.search.main,
    border: 'none',
    borderRadius: '20px',
}));

const IconWrapperLeft = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
}));

// const IconWrapperRight = styled('div')(({ theme }) => ({
//     padding: theme.spacing(0, 1),
//     height: '100%',
//     position: 'absolute',
//     right: 0,
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     zIndex: 10,
// }));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        [theme.breakpoints.up('sm')]: {
            padding: theme.spacing(1.5, 1, 1.5),
            paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        },
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        '&:focus': {
            backgroundColor: theme.palette.custom.search.focus,
            boxShadow: 'rgba(0, 0, 0, 0.24) 0px 1px 3px',
            borderRadius: '20px',
        },
    },
}));

// location.search.slice(location.search.indexOf('q=') + 2) ||
const SearchBar = () => {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState(null);
    const { showError } = useMessage();
    const location = useLocation();
    const navigate = useNavigate();
    const inputRef = useRef();

    const searchHandler = e => {
        const { value } = e.target;
        setSearch(value);

        if (!value.trim()) return setResults(null);
        fetchResults(value);
    };

    const fetchResults = async search => {
        try {
            const response = await axios.get(`/file/search?search=${search}`);
            const files = [];
            const folders = [];
            response.data.results.forEach(object => {
                if (object.file === true) return files.unshift(object);
                folders.unshift(object);
            });

            setResults({ files, folders });
        } catch (e) {
            handleAxiosError(e, showError);
        }
    };

    useEffect(() => {
        setSearch(location.search.slice(location.search.indexOf('q=') + 2));
    }, [location]);

    return (
        <SearchWrapper>
            <IconWrapperLeft>
                <SearchIcon />
            </IconWrapperLeft>
            <FormControl fullWidth>
                <StyledInputBase
                    inputRef={inputRef}
                    sx={{
                        flex: 1,
                        '.MuiInputBase-input:focus': {
                            borderBottomRightRadius:
                                results?.files.length || results?.folders.length ? 0 : null,
                            borderBottomLeftRadius:
                                results?.files.length || results?.folders.length ? 0 : null,
                        },
                    }}
                    placeholder='Search in Drive'
                    value={search}
                    onChange={searchHandler}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            navigate(`/search?q=${search}`);
                            inputRef?.current.blur();
                        }
                    }}
                />

                <SearchResults results={results} />
            </FormControl>
            {/* <IconWrapperRight>
                <IconButton sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
                    <TuneIcon />
                </IconButton>
            </IconWrapperRight> */}
        </SearchWrapper>
    );
};

export default SearchBar;

const SearchResults = props => {
    const { results } = props;
    const { focused } = useFormControl() || {};
    const navigate = useNavigate();

    const navigateToFiles = file => {
        if (file.mimetype) {
            const index = file.key.lastIndexOf('/');

            if (index !== -1) {
                navigate(`/folder/${file.key.slice(index + 1)}`);
            } else if (!file.key) {
                navigate(`/`);
            } else {
                navigate(`/folder/${file.key}`);
            }
        } else {
            navigate(`/folder/${file._id}`);
        }
    };

    return results && focused ? (
        <Card
            elevation={1}
            sx={{
                position: 'absolute',
                width: '100%',
                top: 40,
                borderBottomRightRadius: '12px',
                borderBottomLeftRadius: '12px',
                maxHeight: '250px',
                overflowY: 'auto',
                transition: 'all 0.3s ease-in',
                backgroundColor: 'custom.search.focus',
            }}>
            {[...results.files, ...results.folders].map(file => (
                <Grid
                    container
                    alignItems='center'
                    columnSpacing={1}
                    px={1.5}
                    py={1}
                    sx={{ '&:hover': { bgcolor: 'custom.cardHover', cursor: 'pointer' } }}
                    onMouseDown={() => {
                        navigateToFiles(file);
                    }}>
                    <Grid item height='20px'>
                        <Icon
                            name={file.mimetype ? getFileIcon(file.name) : 'folder.png'}
                            height='20px'
                        />
                    </Grid>
                    <Grid item xs sx={{ overflow: 'hidden' }}>
                        <Typography
                            variant='body2'
                            fontWeight='500'
                            sx={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1,
                            }}>
                            {file.name}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant='caption'>
                            {new Date(file.createdAt).toDateString().slice(4, 11)}
                        </Typography>
                    </Grid>
                </Grid>
            ))}
        </Card>
    ) : null;
};
