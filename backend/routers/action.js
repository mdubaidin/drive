import express from 'express';
import trash from '../routes/action/trash.js';
import move from '../routes/action/move.js';
import download from '../routes/action/download.js';
import copy from '../routes/action/copy.js';
import add from '../routes/action/favorite/add.js';
import remove from '../routes/action/favorite/remove.js';
import shareAccess from '../routes/action/shared/shareAccess.js';
import access from '../routes/action/shared/access.js';

const actionRouter = new express.Router();

// POST
actionRouter.post('/trash', trash);
actionRouter.post('/move', move);
actionRouter.post('/download', download);
actionRouter.post('/copy', copy);
actionRouter.post('/add-favorite', add);
actionRouter.post('/remove-favorite', remove);
actionRouter.post('/grant-access', shareAccess);

// PATCH
actionRouter.patch('/access/public', access(true));
actionRouter.patch('/access/private', access(false));

export default actionRouter;
