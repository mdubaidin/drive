import express from 'express';
import _public from '../../routes/files/access/public.js';
import _private from '../../routes/files/access/private.js';

const accessRouter = new express.Router();

// PATCH
accessRouter.patch('/public/:id', _public);
accessRouter.patch('/private/:id', _private);

export default accessRouter;
