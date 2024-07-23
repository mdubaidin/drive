import React, { memo, useCallback, useState } from 'react';

//mui component
import axios from 'axios';
import Main from '../components/Main';
import { handleAxiosError } from '../utils/function';
import { useMessage } from '../providers/Provider';

const Favorite = () => {
    const [folders, setFolders] = useState(null);
    const [files, setFiles] = useState(null);
    const { showError } = useMessage();

    const getFiles = useCallback(
        async (filter = {}) => {
            const { type, modified, custom, sort, direction } = filter;
            setFiles(null);
            setFolders(null);

            try {
                const response = await axios.get(
                    `/content/favorite?type=${type || ''}&sort=${
                        sort || ''
                    }&direction=${direction}&modified=${modified}${
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
                title: 'Favorite',
                refresh: getFiles,
                defaultImage: 'favorite.png',
                defaultTitle: 'No favorite files',
                defaultCaption: 'Add favorite to things that you want to easily find later.',
            }}
        />
    );
};

export default memo(Favorite);
