import Jwt from 'jsonwebtoken';
import User from '../schema/User.js';
import { isAccessTokenExpire } from '../utils/jwt/token.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt/jwt.js';
import { setCookie } from '../utils/cookies.js';

export default async function (req, res, next) {
    try {
        const accessToken =
            req.headers.authorization?.replace('Bearer', '') || req.cookies['jwt-auth'];
        const refreshToken = req.cookies['jwt-auth_refresh'];

        // console.log('refresh', refreshToken, 'access', accessToken);

        if (!accessToken) throw new CustomError('JWT access token must be provided', 401);

        if (isAccessTokenExpire(accessToken) && refreshToken) {
            await validate(req, res, refreshToken);

            return next();
        }

        req.headers.accessToken = accessToken;
        req.headers.refreshToken = refreshToken;
        next();
    } catch (err) {
        console.log(err);
        res.status(401).error(err.message || 'Unauthorized access');
    }
}

async function validate(req, res, refreshToken) {
    const decodedToken = Jwt.decode(refreshToken);
    if (!decodedToken) throw new CustomError('Your session has been expired. Login again', 401);

    const decode = Jwt.verify(refreshToken, process.env.JWT_SECRET);

    const user = await User.findById(decode.id);

    if (!user) throw new CustomError('Refresh token is invalid, Login again', 401);

    const now = Date.now() / 1000;
    const tokenExpire = decodedToken.exp ? decodedToken.exp < now : true;

    if (tokenExpire) {
        const newRefreshToken = await generateRefreshToken(user);

        req.headers.refreshToken = newRefreshToken;
        setCookie(res, 'jwt-auth.refresh-token', newRefreshToken);
    } else {
        req.headers.refreshToken = refreshToken;
    }

    const newAccessToken = generateAccessToken(user);
    req.headers.accessToken = newAccessToken;
    setCookie(res, 'jwt-auth.access-token', newAccessToken);
}
