import express from 'express';
import fetch from '../routes/trash/fetch.js';
import trash from '../routes/trash/trash.js';
import restore from '../routes/trash/restore.js';
import emplyTrash from '../routes/trash/emplyTrash.js';
import deleteForever from '../routes/trash/deleteForever.js';

const trashRouter = new express.Router();

// GET
trashRouter.get('/', fetch);

// POST
trashRouter.post('/restore', restore);
trashRouter.post('/restore/file/:fileId', restore);
trashRouter.post('/restore/folder/:folderId', restore);
trashRouter.post('/file/:fileId', trash);
trashRouter.post('/folder/:folderId', trash);

// PATCH

trashRouter.patch('/delete', deleteForever);
trashRouter.patch('/empty', emplyTrash);
trashRouter.patch('/delete/file/:fileId', deleteForever);
trashRouter.patch('/delete/folder/:folderId', deleteForever);

export default trashRouter;
