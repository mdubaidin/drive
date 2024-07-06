import express from 'express';
import fetch from '../../routes/shared/file/fetch.js';
import copy from '../../routes/shared/file/copy.js';
import rename from '../../routes/shared/file/rename.js';
import download from '../../routes/shared/file/download.js';

const filesRouter = new express.Router();

// GET
filesRouter.get('/:id', fetch);
filesRouter.get('/preview/:userId', download('preview'));
filesRouter.get('/download/:userId', download('download'));

// PATCH
filesRouter.patch('/copy', copy);
filesRouter.patch('/rename/:fileId', rename);

export default filesRouter;
