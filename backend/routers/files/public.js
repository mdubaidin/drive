import express from 'express';
import upload from '../../routes/files/public/upload.js';
import _delete from '../../routes/files/public/delete.js';

const publicRouter = new express.Router();

// POST
publicRouter.post('/', upload);
publicRouter.post('/:platform', upload);

// DELETE
publicRouter.delete('/:id', _delete);

export default publicRouter;
