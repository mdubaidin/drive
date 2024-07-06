import { getParentId, sanitizeParent, validateFolder } from '../../utils/functions.js';
import File from '../../schema/File.js';
import { addSharedWith } from '../../utils/asyncFunctions.js';

export default async function (req, res, next) {
    try {
        const userId = req.user.id;
        const parentKey = req.params.parentKey || '';

        const name = req.body.name;

        const parentId = getParentId(parentKey);

        const { sharedWith, ownerId } = await addSharedWith(parentId, userId);

        if (!validateFolder(name))
            Error.throw(
                'Folder name should consist of uppercase and lowercase letters, numbers, underscores (_), and hyphens (-).',
                400
            );

        const folder = new File({
            name,
            userId: ownerId,
            key: sanitizeParent(parentKey),
            file: false,
            sharedWith,
        });
        await folder.save();

        res.success({ message: 'folder created sucessfully' });
    } catch (e) {
        next(e);
    }
}
