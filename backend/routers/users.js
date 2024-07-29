import express from 'express';
import info from '../routes/users/info.js';

const usersRuoter = new express.Router();

// GET
usersRuoter.get('/info', info);

export default usersRuoter;
