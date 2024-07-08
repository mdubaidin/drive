import React, { useCallback, useState } from 'react';
import Main from '../components/Main';
import axios from 'axios';
import { handleAxiosError } from '../../../utils/function';
import { useMessage } from '../../../providers/Provider';

const Index = () => {
    const [files, setFiles] = useState(null);
    const [folders, setFolders] = useState(null);
    const { showError } = useMessage();

    const getFiles = useCallback(
        async (filter = {}) => {
            const { modified, type, custom, people, sort, direction } = filter;
            setFiles(null);
            setFolders(null);

            try {
                console.log('Fetching Files...');
                const response = await axios.get(
                    `/share/receive?type=${type || ''}&modified=${modified || ''}&people=${
                        people || ''
                    }&sort=${sort || ''}&direction=${direction}${
                        custom ? `&from=${custom.from.$d}&to=${custom.to.$d}` : ''
                    }`
                );
                const files = [];
                const folders = [];
                response.data.contents.forEach(object => {
                    if (object.file === true) return files.push(object);
                    folders.push(object);
                });

                setFiles(files);
                setFolders(folders);
            } catch (e) {
                handleAxiosError(e, showError);
            }
        },
        [showError]
    );

    return (
        <Main
            data={{
                files,
                folders,
                title: 'Shared with me',
                refresh: getFiles,
                shared: 'with',
            }}
        />
    );
};

export default Index;
