import express from 'express';
import create from '../routes/folder/create.js';
import fetch from '../routes/folder/fetch.js';
import upload from '../routes/folder/upload.js';
import favoriteRouter from './folder/favorite.js';
import move from '../routes/folder/move.js';
import rename from '../routes/folder/rename.js';
import download from '../routes/folder/download.js';

const folderRouter = new express.Router();

// USE
folderRouter.use('/favorite', favoriteRouter);

// GET
folderRouter.get('/:folderId', fetch);
folderRouter.get('/download/:folderId', download);

// POST
folderRouter.post('/', create);
folderRouter.post('/fetch', fetch);
folderRouter.post('/upload', upload);
folderRouter.post('/upload/:parentKey', upload);
folderRouter.post('/:parentKey', create);

// PATCH
folderRouter.patch('/move', move);
folderRouter.patch('/rename/:folderId', rename);

export default folderRouter;
