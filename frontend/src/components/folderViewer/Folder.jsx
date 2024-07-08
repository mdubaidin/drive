import React, { memo, useCallback, useEffect, useState } from 'react';

//mui component

import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FolderViewer } from './FolderViewer';

const Folder = () => {
    const [files, setFiles] = useState(null);
    const [folders, setFolders] = useState(null);
    const [content, setContent] = useState(null);
    const { id } = useParams();

    const getFolderContent = useCallback(async () => {
        try {
            const response = await axios.get(`/open/folder/${id}`);
            const data = response.data.content;
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
            console.log(e);
        }
    }, [id]);

    useEffect(() => {
        getFolderContent();
    }, [getFolderContent]);

    return <FolderViewer subFolder={{ files, folders, content }} />;
};

export default memo(Folder);
