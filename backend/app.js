import './config/config.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import upload from './libs/multer.js';

import errorHandler from './middlewares/errorHandler.js';
import authenticate from './middlewares/authenticate.js';
import validateJWT from './middlewares/validateJWT.js';
import authorize from './middlewares/authorize.js';

import filesRouter from './routers/file.js';
import folderRouter from './routers/folder.js';

import trashRouter from './routers/trash.js';
import actionRouter from './routers/action.js';
import contentRouter from './routers/content.js';
import sharedRouter from './routers/shared.js';
import openRouter from './routers/open.js';
import authRouter from './routers/auth.js';
import statRouter from './routers/stats.js';

const app = new express();

app.use(
    upload.fields([
        { name: 'files', maxCount: 100 },
        { name: 'folder', maxCount: 1 },
    ])
);

app.use(
    cors({
        origin: ['http://localhost:3000'],
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/public', express.static('public'));

app.use('/open', openRouter);

app.use('/auth', authorize, authRouter);

app.use(validateJWT);
app.use(authenticate);

app.use('/file', filesRouter);
app.use('/folder', folderRouter);
app.use('/trash', trashRouter);
app.use('/action', actionRouter);
app.use('/content', contentRouter);
app.use('/share', sharedRouter);
app.use('/stats', statRouter);

app.use(errorHandler);

export default app;
