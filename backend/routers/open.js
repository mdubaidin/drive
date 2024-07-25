import express from 'express';
import validateAccess from '../routes/open/validateAccess.js';
import stats from '../routes/stats/stats.js';
import filesRouter from './open/file.js';
import folderRouter from './open/folder.js';

const openRouter = new express.Router();

openRouter.use('/files', filesRouter);
openRouter.use('/folders', folderRouter);

// GET
openRouter.get('/validate/:id', validateAccess);
openRouter.get('/stats', stats);

export default openRouter;
