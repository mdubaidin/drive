import express from 'express';
import stats from '../routes/stats/stats.js';

const statRouter = new express.Router();

// GET
statRouter.get('/', stats);

export default statRouter;
