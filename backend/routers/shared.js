import express from 'express';
import received from '../routes/shared/received.js';
import grantAccess from '../routes/shared/grantAccess.js';
import updateAccess from '../routes/shared/updateAccess.js';
import send from '../routes/shared/send.js';
import access from '../routes/action/shared/access.js';
import folderRouter from './shared/folder.js';
import filesRouter from './shared/file.js';
import actionRouter from './shared/action.js';

const sharedRouter = new express.Router();

sharedRouter.use('/folder', folderRouter);
sharedRouter.use('/file', filesRouter);
sharedRouter.use('/action', actionRouter);

// GET
sharedRouter.get('/receive', received);
sharedRouter.get('/receive/:folderId', received);
sharedRouter.get('/send', send);
sharedRouter.get('/send/:folderId', send);

// POST
sharedRouter.post('/', grantAccess);

// PATCH
sharedRouter.patch('/', updateAccess);
sharedRouter.patch('/allow-access/:id', access(true));
sharedRouter.patch('/deny-access/:id', access(false));

export default sharedRouter;
