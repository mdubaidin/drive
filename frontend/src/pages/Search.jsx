import React, { memo, useCallback, useState } from 'react';

import { useSearchParams } from 'react-router-dom';
import Main from '../components/Main';
import { handleAxiosError } from '../utils/function';
import { useMessage } from '../providers/Provider';
import axios from 'axios';

const Search = () => {
    const [searchParams] = useSearchParams();
    const [files, setFiles] = useState(null);
    const [folders, setFolders] = useState(null);
    const { showError } = useMessage();

    const fetchResults = useCallback(
        async (filter = {}) => {
            const { modified, type, custom, sort, direction } = filter;
            setFiles(null);
            setFolders(null);

            try {
                const response = await axios.get(
                    `/file/search?search=${searchParams.get('q')}&type=${type || ''}&sort=${
                        sort || ''
                    }&direction=${direction}&modified=${modified || ''}${
                        custom ? `&from=${custom.from.$d}&to=${custom.to.$d}` : ''
                    }`
                );

                const files = [];
                const folders = [];
                response.data.results?.forEach(object => {
                    if (object.file === true) return files.push(object);
                    folders.push(object);
                });

                setFiles(files);
                setFolders(folders);
            } catch (e) {
                handleAxiosError(e, showError);
            }
        },
        [searchParams, showError]
    );

    return (
        <Main
            data={{
                files,
                folders,
                title: 'Search results',
                refresh: fetchResults,
            }}
        />
    );
};

export default memo(Search);
