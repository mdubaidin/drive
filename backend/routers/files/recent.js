import express from 'express';
import fetch from '../../routes/files/recent/fetch.js';

const recentRouter = new express.Router();

// GET
recentRouter.get('/', fetch);

export default recentRouter;
