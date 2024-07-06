import CustomError from '../classes/CustomError.js';

export default function (req, res, next) {
    const authKey = req.headers.authorization;
    console.log('Auth key: ' + authKey);

    if (!authKey || authKey !== process.env.API_KEY) {
        throw new CustomError('Access Denied: A valid API key is required to proceed.', 401);
    }
    next();
}
