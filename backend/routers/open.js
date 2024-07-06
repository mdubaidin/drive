import express from 'express';
import validateAccess from '../routes/open/validateAccess.js';
import stats from '../routes/open/stats.js';
import fetch from '../routes/open/clikkle_projects/fetch.js';
import filesRouter from './open/file.js';
import folderRouter from './open/folder.js';

const openRouter = new express.Router();

openRouter.use('/file', filesRouter);
openRouter.use('/folder', folderRouter);

// GET
openRouter.get('/validate/:id', validateAccess);
openRouter.get('/stats/:id', stats);
openRouter.get('/projects/:id', fetch);

export default openRouter;
