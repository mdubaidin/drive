import express from 'express';
import { checkSetup, setup } from '../routes/setup/setup.js';

const setupRouter = new express.Router();

// GET
setupRouter.get('/', checkSetup);

// POST
setupRouter.post('/', setup);

export default setupRouter;
