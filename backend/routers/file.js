import express from 'express';
import upload from '../routes/files/upload.js';
import { fetch, fetchById } from '../routes/files/fetch.js';
import recentRouter from './files/recent.js';
import favoriteRouter from './files/favorite.js';
import download from '../routes/files/download.js';
import search from '../routes/files/search.js';
import move from '../routes/files/move.js';
import rename from '../routes/files/rename.js';
import copy from '../routes/files/copy.js';
import _delete from '../routes/files/private/delete.js';
import privateRouter from './files/private.js';
import accessRouter from './files/access.js';
import publicRouter from './files/public.js';

const filesRouter = new express.Router();

// USE
filesRouter.use('/recent', recentRouter);
filesRouter.use('/favorite', favoriteRouter);
filesRouter.use('/private', privateRouter);
filesRouter.use('/public', publicRouter);
filesRouter.use('/access', accessRouter);

// GET
filesRouter.get('/preview', download('preview'));
filesRouter.get('/download', download('download'));
filesRouter.get('/search', search);
filesRouter.get('/:id', fetchById);

// POST
filesRouter.post('/', upload);
filesRouter.post('/fetch', fetch);

// PATCH
filesRouter.patch('/move', move);
filesRouter.patch('/rename/:id', rename);
filesRouter.patch('/copy/:id', copy);

export default filesRouter;
