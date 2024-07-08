import React, { memo, useCallback, useEffect, useState } from 'react';

//mui component
import axios from 'axios';
import eventEmitter from '../utils/eventEmitter';
import { useMessage } from '../providers/Provider';
import { handleAxiosError } from '../utils/function';
import Main from '../components/Main';

const Recent = () => {
    const [files, setFiles] = useState(null);
    const [filesByDate, setFilesByDate] = useState({});
    const { showError } = useMessage();

    const getFiles = useCallback(
        async (filter = {}) => {
            const { modified, type, custom } = filter;
            setFiles(null);

            try {
                const response = await axios.get(
                    `/file/recent?type=${type || ''}&modified=${modified || ''}${
                        custom ? `&from=${custom.from.$d}&to=${custom.to.$d}` : ''
                    }`
                );

                const filesByDate = {};
                const files = [];

                for (const file of response.data.files) {
                    filesByDate[file._id] = file;
                    files.push(...file.files);
                }

                setFilesByDate(filesByDate);
                setFiles(files);
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
            eventEmitter.off('uploaded', () => {
                getFiles();
            });
    }, [getFiles]);

    return (
        <Main
            data={{
                files: files,
                folders: files && [],
                filesByDate,
                title: 'Recent',
                refresh: getFiles,
                content: { name: 'Recent', key: '', id: '' },
                defaultImage: 'recent.png',
                defaultTitle: 'Add Files to View Recent Activity',
                defaultCaption:
                    'Your recent files will appear here once you upload them. Get started now!',
            }}
        />
    );
};

export default memo(Recent);
