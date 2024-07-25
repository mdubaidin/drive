import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import GradeOutlinedIcon from '@mui/icons-material/GradeOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';

const fileManager = [
    {
        name: 'My Drive',
        icon: <FolderOutlinedIcon fontSize='small' />,
        to: '/',
    },
    {
        name: 'Recent',
        icon: <AccessTimeOutlinedIcon fontSize='small' />,
        to: '/recent',
    },
    {
        name: 'Starred',
        icon: <GradeOutlinedIcon fontSize='small' />,
        to: '/favorite',
    },
];

const sharedFile = [
    {
        name: 'Shared with me',
        icon: <PeopleIcon fontSize='small' />,
        to: '/shared-with-me',
    },
    {
        name: 'Shared by me',
        icon: <PersonIcon fontSize='small' />,
        to: '/shared-by-me',
    },
    {
        name: 'Bin',
        icon: <DeleteOutlinedIcon fontSize='small' />,
        to: '/trash',
    },
];

export { fileManager, sharedFile };
