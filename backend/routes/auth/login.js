import User from '../../schema/User.js';
import CustomError from '../../classes/CustomError.js';
import { generateJwtPair } from '../../utils/jwt/jwt.js';

const login = async function (req, res, next) {
    const { email, password } = req.body;

    try {
        const query = { email };
        const user = await User.findOne(query);

        if (!user) throw new CustomError(`We can't find account with ${email}`, 404);

        if (await user.isUnauthorized(password))
            throw new CustomError('The password you entered is incorrect, Please try again', 404);

        const { accessToken, refreshToken } = await generateJwtPair(user);

        const userInfo = user.removeSensitiveInfo();

        res.success({
            user: userInfo,
            accessToken,
            refreshToken,
        });
    } catch (e) {
        next(e);
    }
};

export { login };
