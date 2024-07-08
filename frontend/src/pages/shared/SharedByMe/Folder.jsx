import React, { memo, useCallback, useEffect, useState } from 'react';

//mui component

import axios from 'axios';
import { useParams } from 'react-router-dom';
import eventEmitter from '../../../utils/eventEmitter';
import { handleAxiosError } from '../../../utils/function';
import Main from '../components/Main';
import { useMessage } from '../../../providers/Provider';

const SharedFolders = () => {
    const [files, setFiles] = useState(null);
    const [folders, setFolders] = useState(null);
    const [content, setContent] = useState(null);
    const { showError } = useMessage();
    const { id } = useParams();

    const getFolderContent = useCallback(
        async (filter = {}) => {
            const { modified, type, custom, people, sort, direction } = filter;
            setFiles(null);
            setFolders(null);

            try {
                const response = await axios.get(
                    `/share/send/${id}?type=${type || ''}&modified=${modified || ''}&people=${
                        people || ''
                    }&sort=${sort || ''}&direction=${direction}${
                        custom ? `&from=${custom.from.$d}&to=${custom.to.$d}` : ''
                    }`
                );
                const data = response.data.contents;

                const files = [];
                const folders = [];
                data?.contents.forEach(object => {
                    if (object.file === true) return files.push(object);
                    folders.push(object);
                });

                setContent(data);
                setFiles(files);
                setFolders(folders);
            } catch (e) {
                handleAxiosError(e, showError);
            }
        },
        [id, showError]
    );

    useEffect(() => {
        eventEmitter.on('uploaded', () => {
            getFolderContent();
        });
        return () =>
            eventEmitter.removeListener('uploaded', () => {
                getFolderContent();
            });
    }, [getFolderContent]);

    useEffect(() => {
        eventEmitter.on('folderCreated', () => {
            getFolderContent();
        });
        return () =>
            eventEmitter.removeListener('folderCreated', () => {
                getFolderContent();
            });
    }, [getFolderContent]);

    return (
        <Main
            data={{
                folders,
                files,
                title: content?.name,
                refresh: getFolderContent,
                content: content,
                shared: 'by',
            }}
        />
    );
};

export default memo(SharedFolders);
