import express from 'express';
import { createAccount, initiateEmail } from '../routes/auth/createAccount.js';
import google from '../routes/auth/providers/google.js';
import { login } from '../routes/auth/login.js';

import refreshAccessToken from '../routes/auth/refreshAccessToken.js';
import logout from '../routes/auth/logout.js';
import authenticate from '../middlewares/authenticate.js';
import validateJWT from '../middlewares/validateJWT.js';
import identify from '../routes/auth/identify.js';
import verify from '../routes/auth/verify.js';
import createPassword from '../routes/auth/createPassword.js';

const authRouter = express.Router();

// GET
authRouter.get('/logout', validateJWT, authenticate, logout);
// authRouter.get('/reset-code/:email', generateResetToken);

// POST
authRouter.post('/providers/google', google);
authRouter.post('/create-account/step1', initiateEmail);
authRouter.post('/create-account/step2', createAccount);
authRouter.post('/login', login);
authRouter.post('/refresh', refreshAccessToken);
authRouter.post('/identify', identify);
authRouter.post('/verify', verify);
// authRouter.post('/users-info', getUsersInfo);
// authRouter.post('/exists/email', exists('email'));
// authRouter.post('/verify/reset-code', verifyResetToken);
// authRouter.post('/unused-emails', getUnusedEmails);

// PATCH
authRouter.patch('/create-password', createPassword);

export default authRouter;
