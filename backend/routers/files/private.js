import express from 'express';
import fetch from '../../routes/files/private/fetch.js';
import upload from '../../routes/files/private/upload.js';
import update from '../../routes/files/private/update.js';
import _delete from '../../routes/files/private/delete.js';
import download from '../../routes/files/private/download.js';

const privateRouter = new express.Router();

// GET
privateRouter.get('/:id', fetch);
privateRouter.get('/download/:id', download);

// POST
privateRouter.post('/:platform', upload);

// PATCH
privateRouter.patch('/:id', update);

// DELETE
privateRouter.delete('/:id', _delete);

export default privateRouter;
