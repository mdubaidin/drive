import User from '../../schema/User.js';
import CustomError from '../../classes/CustomError.js';
import { setCookie } from '../../utils/cookies.js';
import jwt from 'jsonwebtoken';
import { generateRefreshToken } from '../../utils/jwt/jwt.js';

const refreshAccessToken = async function (req, res, next) {
    try {
        const token = req.body.refreshToken || req.cookies['jwt-auth.refresh-token'];

        if (!token) throw new CustomError('Refresh token must be provided', 401);

        const decode = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decode.id);

        if (!user) throw new CustomError('Refresh token is invalid', 404);

        const refreshToken = await generateRefreshToken(user);

        setCookie(res, 'jwt-auth.refresh-token', refreshToken);

        res.success({
            user,
            refreshToken,
        });
    } catch (e) {
        console.log(e);
        res.status(401).error(e?.message || 'refresh token is invalid');
    }
};

export default refreshAccessToken;
