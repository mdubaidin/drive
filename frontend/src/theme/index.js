import { createTheme, useMediaQuery } from '@mui/material';
import React, { useMemo, useContext, useState, createContext, useLayoutEffect } from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { getCookie, setCookie } from '../utils/cookies';

const ThemeContext = createContext({ setTheme: () => {}, theme: 'system' });

const ThemeProvider = props => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const preferTheme = getCookie('theme-options');

    const [mode, setMode] = useState('dark');
    const [theme, setTheme] = useState(preferTheme || 'system');

    useLayoutEffect(() => {
        if (theme === 'system') {
            const preferTheme = prefersDarkMode ? 'dark' : 'light';
            setCookie('theme-options', theme);
            return setMode(preferTheme);
        }

        setCookie('theme-options', theme);
        setMode(theme);
    }, [prefersDarkMode, theme]);

    const light = useMemo(
        () => ({
            primary: {
                main: '#c2e7ff',
            },
            secondary: {
                main: '#3347ce',
            },
            background: {
                main: '#FFFFFF',
                paper: '#FFFFFF',
                default: '#f8fafd',
                box: '#F7F9FC',
                button: {
                    listItemHover: '#e7e8eb',
                    new: '#FFFFFF',
                    newHover: '#edf2fc',
                },
            },
            text: {
                secondary: '#818991',
            },
            contrast: 'black',
            divider: '#e7e3e3',
            custom: {
                search: {
                    main: '#edf2fc',
                    focus: 'white',
                },
                border: '#747775',
                hoverColor: '#45B5E8',
                common: 'white',
                color: 'rgba(0, 0, 0, 0.87)',
                appsHover: 'rgb(232, 240, 254)',
                menu: '#FFFFFF',
                cardHover: '#E1E5EA',
                trashCaption: '#E3E3E3',
                selectedCard: '#c2e7ff',
                selectedMove: '#c2e7ff',
                selectedPanel: '#f2f6fc',
                response: '#2f2e2e',
                selectedHover: '#B3D7EF',
                shareHover: 'rgb(140 140 140 / 15%)',
                uploadButton: '#FFF',
                uploadButtonHover: '#EDF2FA',
            },
        }),
        []
    );

    const dark = useMemo(
        () => ({
            primary: {
                main: '#004a77',
            },
            secondary: {
                main: '#9cb0e6',
            },
            background: {
                main: '#000000',
                paper: '#141414',
                default: '#1b1b1b',
                box: '#000000',
                button: {
                    listItemHover: '#2b2b2b',
                    new: '#37393b',
                    newHover: '#43484d',
                },
            },
            text: {
                secondary: '#c4c7c5',
            },
            contrast: 'white',
            divider: '#424242',
            custom: {
                search: {
                    main: '#282a2c',
                    focus: '#2F2F2F',
                },
                // border: '#616161',
                border: '#8e918f',
                hoverColor: '#fff',
                common: 'black',
                appsHover: 'rgb(39, 46, 58)',
                menu: '#000000',
                cardHover: '#2F2F2F',
                trashCaption: '#2f2e2e',
                selectedCard: '#2f2e2e',
                selectedPanel: '#2f2e2e',
                selectedMove: '#44b5e899',
                response: 'white',
                selectedHover: 'rgba(255, 255, 255, 0.08)',
                shareHover: 'rgba(255, 255, 255, 0.08)',
                uploadButton: '#2F2F2F',
                uploadButtonHover: '#141414',
            },
        }),
        []
    );

    const baseTheme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'light' ? light : dark),
                },
                breakpoints: {
                    keys: ['xs', 'sm', 'md', 'xm', 'lg', 'xlg', 'xl', 'xxl'],
                    values: {
                        xs: 0,
                        sm: 576,
                        md: 768,
                        xm: 1000,
                        lg: 1146,
                        xlg: 1380,
                        xl: 1600,
                        xxl: 1756,
                    },
                },
                components: {
                    MuiCssBaseline: {
                        styleOverrides: theme => ({
                            body: {
                                '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                                    backgroundColor: 'transparent',
                                    width: '6px',
                                },
                                '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                                    borderRadius: 8,
                                    backgroundColor: theme.palette.divider,
                                    // backgroundColor: 'red',
                                },
                                '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus':
                                    {
                                        backgroundColor: '#747775',
                                    },
                                '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active':
                                    {
                                        backgroundColor: '#747775',
                                    },
                                '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover':
                                    {
                                        backgroundColor: '#747775',
                                    },
                            },
                        }),
                    },

                    MuiDivider: {
                        styleOverrides: {
                            light: {
                                borderColor: '#424242',
                                width: '100%',
                            },
                        },
                    },
                    MuiListItemButton: {
                        variants: [
                            {
                                props: { variant: 'sidebarButton' },
                                style: ({ theme }) => ({
                                    padding: '2px 15px',
                                    cursor: 'pointer',
                                    color: theme.palette.text.primary,
                                    fontSize: 14,
                                    borderRadius: '100px',

                                    '& .MuiListItemIcon-root': {
                                        color: theme.palette.contrast,
                                        height: 20,
                                    },

                                    '&:hover': {
                                        backgroundColor:
                                            theme.palette.background.button.listItemHover,
                                    },
                                    '&.Mui-selected': {
                                        '&:hover': {
                                            backgroundColor: theme.palette.primary.main,
                                        },
                                        backgroundColor: theme.palette.primary.main,
                                        height: 32,
                                        '.MuiListItemIcon-root': {
                                            color: theme.palette.contrast,
                                        },
                                        '.MuiListItemText-root': {
                                            color: theme.palette.primary.contrastText,
                                            m: 0,
                                        },
                                    },
                                }),
                            },
                        ],
                    },
                    MuiButton: {
                        variants: [
                            {
                                props: { variant: 'contained' },
                                style: ({ theme }) => ({ color: theme.palette.common.white }),
                            },
                        ],
                        styleOverrides: {
                            root: {
                                textTransform: 'none',
                            },
                        },
                    },
                    MuiTextField: {
                        styleOverrides: {
                            root: {
                                marginBottom: '16px',
                            },
                        },
                    },
                    MuiMenu: {
                        styleOverrides: {
                            root: {
                                // '.MuiPaper-root.MuiMenu-paper.MuiPopover-paper': {
                                //     minWidth: '180px',
                                // },
                                '.MuiMenu-list': {
                                    padding: '5px',
                                },
                                '.MuiButtonBase-root.MuiMenuItem-root': {
                                    fontSize: '14px',
                                },
                            },
                        },
                    },
                    MuiSelect: {
                        styleOverrides: {
                            root: ({ theme }) => ({
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                '& .MuiSelect-select.MuiInputBase-input.MuiOutlinedInput-input': {
                                    paddingTop: '2px',
                                    paddingBottom: '2px',
                                    paddingRight: '42px',
                                },
                                '& .MuiOutlinedInput-notchedOutline ': {
                                    borderColor: theme.palette.custom.border,
                                },
                                '& .MuiListItemIcon-root': {
                                    minWidth: '30px',
                                },
                            }),
                        },
                    },
                    MuiTab: {
                        styleOverrides: {
                            root: {
                                textTransform: 'capitalize',
                            },
                        },
                    },
                },
            }),
        [mode, dark, light]
    );

    return (
        <ThemeContext.Provider value={{ setTheme, theme }}>
            <MuiThemeProvider theme={baseTheme}>
                <CssBaseline />
                {props.children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

const useTheme = () => {
    const { setTheme, theme } = useContext(ThemeContext);

    return { setTheme, theme };
};

export { useTheme, ThemeContext };

export default ThemeProvider;
