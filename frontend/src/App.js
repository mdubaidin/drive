import React from 'react';
import './utils/axios';
import { Route, Routes } from 'react-router-dom';

//pages
import Folders from './pages/Folders';
import Recent from './pages/Recent';
import Trash from './pages/Trash';
import Favorite from './pages/Favorite';
import Search from './pages/Search';
import MyDrive from './pages/MyDrive';
import SharedWithMe from './pages/shared/SharedWithMe';
import SharedWithFolder from './pages/shared/SharedWithMe/Folder';
import SharedByFolder from './pages/shared/SharedByMe/Folder';
import SharedByMe from './pages/shared/SharedByMe';
import Provider from './providers/Provider';
import CreateAccount from './auth/CreateAccount';
import Identify from './auth/Identify';
import Login from './auth/Login';
import ResetPassword from './auth/ResetPassword';
import Settings from './pages/settings';
import AuthOutlet from '@auth-kit/react-router/AuthOutlet';
import General from './pages/settings/General';
import Account from './pages/settings/Account';
import Notifications from './pages/settings/Notifications';
import AuthContext from './providers/AuthContext';
import Auth from './auth/Auth';
import FileViewer from './views/Files';
import FolderViewer from './components/folderViewer/FolderViewer';
import Folder from './components/folderViewer/Folder';
import NotFound from './components/NotFound';
import Views from './views';

const App = () => {
    return (
        <Provider>
            <Routes>
                <Route path='/auth' element={<Auth />}>
                    <Route path='sign-up' element={<CreateAccount />} />
                    <Route path='identify' element={<Identify />} />
                    <Route path='sign-in' element={<Login />} />
                    <Route path='reset' element={<ResetPassword />} />
                </Route>

                <Route path='/' element={<AuthContext />}>
                    <Route index element={<MyDrive />} />
                    <Route path='/folder/:id' element={<Folders />} />
                    <Route path='/recent' element={<Recent />} />
                    <Route path='/favorite' element={<Favorite />} />
                    <Route path='/trash' element={<Trash />} />
                    <Route path='/search' element={<Search />} />
                    <Route path='/shared-with-me' element={<SharedWithMe />} />
                    <Route path='/shared-with-me/folder/:id' element={<SharedWithFolder />} />
                    <Route path='/shared-by-me' element={<SharedByMe />} />
                    <Route path='/shared-by-me/folder/:id' element={<SharedByFolder />} />
                </Route>

                <Route
                    path='/settings'
                    element={
                        <Settings>
                            <AuthOutlet fallbackPath='/auth/sign-in' />
                        </Settings>
                    }>
                    <Route index element={<General />} />
                    <Route path='notifications' element={<Notifications />} />
                    <Route path='account' element={<Account />} />
                </Route>

                <Route path='/d' element={<Views />}>
                    <Route path='file/:id' element={<FileViewer />} />
                    <Route path='folder/:id' element={<FolderViewer />} />
                    <Route path='folders/:id' element={<Folder />} />
                </Route>

                <Route path='*' element={<NotFound />} />
            </Routes>
        </Provider>
    );
};

export default App;
