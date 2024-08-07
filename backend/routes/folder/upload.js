import { getParentId, removeSlashFromStart } from '../../utils/functions.js';
import path from 'path';
import atob from 'atob';
import File from '../../schema/File.js';
import { addSharedWith, uploadFile } from '../../utils/asyncFunctions.js';
import FileSystem from '../../classes/FileSystem.js';
import { isDefined } from '../../utils/utils.js';

export default async function (req, res, next) {
    const fileSystem = new FileSystem();
    const files = req.files.files;
    const userId = req.user.id;
    const parentKey = req.params.parentKey || '';
    const ROOT = req.user.storagePath;

    try {
        if (!ROOT) Error.throw('Provide ROOT path to upload file');

        if (!files) Error.throw('File not found', 404);

        const parentId = getParentId(parentKey);

        const { sharedWith, ownerId } = await addSharedWith(parentId, userId);
        console.log({ files, ROOT, sharedWith, ownerId, parentId });

        const parentSymbol = Symbol('parent');
        const folders = {
            [parentSymbol]: { parentKey },
        };

        for (const file of files) {
            const relativePath = path.dirname(atob(file.originalname));
            const foldersList = relativePath.split('/');

            for (let i = 0; i < foldersList.length; i++) {
                const parent = i ? foldersList.slice(0, i).join('/') : parentSymbol;
                const folder = (i ? parent + '/' : '') + foldersList[i];
                folders[folder] = { parent };
            }
        }

        async function createFolder(folderPath) {
            const folderKey = folders[folderPath].parentKey;

            if (isDefined(folderKey)) return folderKey;

            const folder = folders[folderPath];
            const parentName = folder.parent;

            const parentKey = await createFolder(parentName);

            console.log('folder created ', sharedWith);
            const dbFolder = new File({
                userId: ownerId,
                key: parentKey,
                name: path.basename(folderPath),
                file: false,
                sharedWith,
            });
            await dbFolder.save();
            return (folders[folderPath].parentKey = removeSlashFromStart(
                dbFolder.key + '/' + dbFolder._id
            ));
        }

        for (const folderName in folders) {
            await createFolder(folderName);
        }

        for (const file of files) {
            const relativePath = path.dirname(atob(file.originalname));

            const parentName = relativePath;
            const parentKey = folders[parentName].parentKey;
            file.originalname = path.basename(atob(file.originalname));

            await uploadFile({ userId: ownerId, parentKey, ROOT, file, sharedWith });
        }

        res.success({ message: 'file uploaded sucessfully', folders });
    } catch (e) {
        const filePaths = files.map(file => file.filename);

        fileSystem.deleteFile(filePaths);
        next(e);
    }
}
