import User from '../../schema/User.js';
import CustomError from '../../classes/CustomError.js';
import { setCookie } from '../../utils/cookies.js';
import jwt from 'jsonwebtoken';
import { generateAccessToken } from '../../utils/jwt/jwt.js';

const refreshAccessToken = async function (req, res, next) {
    try {
        const refreshToken = req.body.refreshToken || req.cookies['jwt-auth.refresh'];

        if (!refreshToken) throw new CustomError('Refresh token must be provided', 401);

        const decodedToken = jwt.decode(refreshToken);
        if (!decodedToken) throw new CustomError('Your session has been expired. Login again', 401);

        const decode = jwt.verify(refreshToken, process.env.JWT_SECRET);

        const user = await User.findById(decode.id);

        if (!user) throw new CustomError('Refresh token is invalid', 401);

        const token = await generateAccessToken(user);

        setCookie(res, 'jwt-auth', token);

        const userInfo = user.removeSensitiveInfo();

        res.success({
            user: userInfo,
            token,
        });
    } catch (e) {
        console.log(e);
        res.status(401).error(e?.message || 'refresh token is invalid');
    }
};

export default refreshAccessToken;
