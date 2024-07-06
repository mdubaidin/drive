import User from '../../../schema/User.js';
import CustomError from '../../../classes/CustomError.js';
import { setTokenCookies } from '../../../utils/jwt/token.js';
import { generateJwtPair } from '../../../utils/jwt/jwt.js';

const createAccount = async function (req, res, next) {
    try {
        const { providerId, name, email, picture, provider } = req.body;

        if (!providerId) throw new CustomError('Provider Id must be provided');

        if (!provider) throw new CustomError('Provider name must be provided');

        let user = null;

        user = await User.findOne({ providerId });

        if (!user) {
            user = new User({
                name,
                email,
                picture,
                provider,
                providerId,
                password: providerId,
            });

            await user.save();
        }

        const { accessToken, refreshToken } = await generateJwtPair(user);
        setTokenCookies(res, accessToken, refreshToken);
        const userInfo = user.removeSensitiveInfo();

        res.success({
            ...userInfo,
            accessToken,
            refreshToken,
        });
    } catch (e) {
        next(e);
    }
};

export default createAccount;
