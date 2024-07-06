import express from 'express';
import upload from '../../routes/files/clikkle_projects/upload.js';
import _delete from '../../routes/files/clikkle_projects/delete.js';

const projectsRouter = new express.Router();

// POST
projectsRouter.post('/:id', upload);

// PATCH
projectsRouter.patch('/:id', _delete);

export default projectsRouter;
