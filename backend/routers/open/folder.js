import express from 'express';
import fetch from '../../routes/open/folder/fetch.js';
import download from '../../routes/open/folder/download.js';

const folderRouter = new express.Router();

// GET
folderRouter.get('/:id', fetch);
folderRouter.get('/download/:id', download);

export default folderRouter;
