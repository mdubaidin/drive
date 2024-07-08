import React, { useCallback, useEffect, useState } from 'react';
import Main from '../components/Main';
import axios from 'axios';
import eventEmitter from '../utils/eventEmitter';
import { handleAxiosError, setSessionData } from '../utils/function';
import { useMessage } from '../providers/Provider';

const MyFiles = () => {
    const [files, setFiles] = useState(null);
    const [folders, setFolders] = useState(null);
    const { showError } = useMessage();

    const getFiles = useCallback(
        async (filter = {}) => {
            const { modified, type, custom, sort, direction } = filter;
            setFiles(null);
            setFolders(null);

            try {
                console.log('Fetching Files...');
                const response = await axios.get(
                    `/content?type=${type || ''}&sort=${
                        sort || ''
                    }&direction=${direction}&modified=${modified || ''}${
                        custom ? `&from=${custom.from.$d}&to=${custom.to.$d}` : ''
                    }`
                );
                const files = [];
                const folders = [];
                response.data.contents.forEach(object => {
                    if (object.file === true) return files.push(object);
                    folders.push(object);
                });

                setSessionData('parentKey', '');

                setFiles(files);
                setFolders(folders);
            } catch (e) {
                handleAxiosError(e, showError);
            }
        },
        [showError]
    );

    // useEffect(() => {
    //     getFiles();
    // }, [getFiles]);

    useEffect(() => {
        eventEmitter.on('uploaded', () => {
            getFiles();
        });
        return () =>
            eventEmitter.removeListener('uploaded', () => {
                getFiles();
            });
    }, [getFiles]);

    useEffect(() => {
        eventEmitter.on('folderCreated', () => {
            getFiles();
        });
        return () =>
            eventEmitter.removeListener('folderCreated', () => {
                getFiles();
            });
    }, [getFiles]);

    return (
        <Main
            data={{
                files,
                folders,
                title: 'My Files',
                refresh: getFiles,
                content: { name: 'My Files', key: '', id: '' },
                defaultImage: 'upload.png',
                defaultTitle: 'A place for all of your files',
                defaultCaption: 'You can drag files or folders right into Clikkle files',
            }}
        />
    );
};

export default MyFiles;
