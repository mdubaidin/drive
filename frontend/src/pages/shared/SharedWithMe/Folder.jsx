import React, { memo, useCallback, useEffect, useState } from 'react';

//mui component

import axios from 'axios';
import { useParams } from 'react-router-dom';
import eventEmitter from '../../../utils/eventEmitter';
import { handleAxiosError, setSessionData } from '../../../utils/function';
import Main from '../components/Main';
import { useMessage } from '../../../providers/Provider';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';

const SharedFolders = () => {
    const [files, setFiles] = useState(null);
    const [folders, setFolders] = useState(null);
    const [content, setContent] = useState(null);
    const user = useAuthUser();
    const { showError } = useMessage();
    const { id } = useParams();

    const getFolderContent = useCallback(
        async (filter = {}) => {
            const { modified, type, custom, people, sort, direction } = filter;
            setFiles(null);
            setFolders(null);

            try {
                const response = await axios.get(
                    `/share/receive/${id}?type=${type || ''}&modified=${modified || ''}&people=${
                        people || ''
                    }&sort=${sort || ''}&direction=${direction}${
                        custom ? `&from=${custom.from.$d}&to=${custom.to.$d}` : ''
                    }`
                );
                const content = response.data.contents;

                const files = [];
                const folders = [];
                content?.contents.forEach(object => {
                    if (object.file === true) return files.push(object);
                    folders.push(object);
                });

                const isAccessable =
                    content?.userId === user._id ||
                    content?.sharedWith?.find(sharedUser => sharedUser.userId === user._id)
                        ?.access === 'editor';

                if (isAccessable) {
                    setSessionData('parentKey', encodeURIComponent(content?.fullPath));
                }

                setContent(content);
                setFiles(files);
                setFolders(folders);
            } catch (e) {
                handleAxiosError(e, showError);
            }
        },
        [id, showError, user]
    );

    // useEffect(() => {
    //     getFolderContent();
    // }, [getFolderContent]);

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
                shared: 'with',
            }}
        />
    );
};

export default memo(SharedFolders);
