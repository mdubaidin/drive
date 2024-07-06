import Jwt from 'jsonwebtoken';
import CustomError from '../classes/CustomError.js';
import fs from 'fs';
import { Types } from 'mongoose';

const PUBLIC_KEY = fs.readFileSync('./certs/private.pem', 'utf8');

export default function (req, res, next) {
    try {
        const token = req.headers.accessToken;

        if (typeof token !== 'string') throw new CustomError('Provided Auth token is invalid');

        if (!token) throw new CustomError('JWT must be provided', 401);

        const user = Jwt.verify(token, PUBLIC_KEY);

        console.log('user: ', user);

        req.user = user;
        req.user.id = new Types.ObjectId(user.id);

        next();
    } catch (err) {
        console.log(err);
        res.status(401).error(err.message || 'Unauthorized access');
    }
}
