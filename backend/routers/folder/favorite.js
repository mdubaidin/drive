import express from 'express';
import add from '../../routes/folder/favorite/add.js';
import remove from '../../routes/folder/favorite/remove.js';

const favoriteRouter = new express.Router();

// PATCH
favoriteRouter.patch('/add/:folderId', add);
favoriteRouter.patch('/remove/:folderId', remove);

export default favoriteRouter;
