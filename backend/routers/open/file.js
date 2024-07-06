import express from 'express';
import fetch from '../../routes/open/files/fetch.js';
import download from '../../routes/open/files/download.js';

const filesRouter = new express.Router();

// GET
filesRouter.get('/:id', fetch);
filesRouter.get('/preview/:id', download('preview'));
filesRouter.get('/download/:id', download('download'));

export default filesRouter;
