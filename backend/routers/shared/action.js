import Express from 'express';
import download from '../../routes/shared/action/download.js';
import copy from '../../routes/shared/action/copy.js';

const actionRouter = new Express.Router();

actionRouter.post('/download', download);
actionRouter.post('/copy/:id', copy);

export default actionRouter;
