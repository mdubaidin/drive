import express from 'express';
import add from '../../routes/files/favorite/add.js';
import remove from '../../routes/files/favorite/remove.js';

const favoriteRouter = new express.Router();

// PATCH
favoriteRouter.patch('/add/:fileId', add);
favoriteRouter.patch('/remove/:fileId', remove);

export default favoriteRouter;
