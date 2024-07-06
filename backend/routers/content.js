import express from 'express';
import contents from '../routes/content/contents.js';
import favorite from '../routes/content/favorite.js';

const contentRouter = new express.Router();

// POST
contentRouter.get('/favorite', favorite);
contentRouter.get('/', contents);
contentRouter.get('/:folderId', contents);

export default contentRouter;
