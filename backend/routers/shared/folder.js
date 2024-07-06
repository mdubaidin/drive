import express from 'express';
import fetch from '../../routes/shared/folder/fetch.js';
import download from '../../routes/shared/folder/download.js';
import rename from '../../routes/shared/folder/rename.js';

const folderRouter = new express.Router();

// GET
folderRouter.get('/:id', fetch);
folderRouter.get('/download/:folderId', download);

// PATCH
folderRouter.patch('/rename/:folderId', rename);

export default folderRouter;
