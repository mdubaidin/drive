import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './utils/axios';

//pages
import Folders from './pages/Folders';
import Recent from './pages/Recent';
import Trash from './pages/Trash';
import Favorite from './pages/favorite';
import Search from './pages/Search';
import MyFiles from './pages/MyFiles';
import SharedWithMe from './pages/shared/SharedWithMe';
import SharedWithFolder from './pages/shared/SharedWithMe/Folder';
import SharedByFolder from './pages/shared/SharedByMe/Folder';
import SharedByMe from './pages/shared/SharedByMe';
import FileViewer from './components/FileViewer';
import FolderViewer from './components/folderViewer/FolderViewer';
import Folder from './components/folderViewer/Folder';
import Provider from './providers/Provider';
import AuthLayout from './auth/AuthLayout';
import CreateAccount from './auth/CreateAccount';
import Identify from './auth/Identify';
import Login from './auth/Login';
import ResetPassword from './auth/ResetPassword';
import NotFound from './components/NotFound';
import AuthOutlet from '@auth-kit/react-router/AuthOutlet';

const App = () => {
    return (
        <Provider>
            <Routes>
                <Route path='auth' element={<AuthLayout />}>
                    <Route index element={<NotFound />} />
                    <Route path='sign-up' element={<CreateAccount />} />
                    <Route path='identify' element={<Identify />} />
                    <Route path='sign-in' element={<Login />} />
                    <Route path='reset-password' element={<ResetPassword />} />
                </Route>

                <Route path='/' element={<AuthOutlet fallbackPath='/auth/sign-in' />}>
                    <Route index element={<MyFiles />} />
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
                <Route path='/file/d/:id' element={<FileViewer />} />
                <Route path='/folder/d/:id' element={<FolderViewer />} />
                <Route path='/folders/:id' element={<Folder />} />

                <Route path='*' element={<NotFound />} />
            </Routes>
        </Provider>
    );
};

export default App;
