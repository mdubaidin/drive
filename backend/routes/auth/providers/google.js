import User from '../../../schema/User.js';
import CustomError from '../../../classes/CustomError.js';
import { setTokenCookies } from '../../../utils/jwt/token.js';
import { generateJwtPair } from '../../../utils/jwt/jwt.js';
import { jwtDecode } from 'jwt-decode';

const createAccount = async function (req, res, next) {
    try {
        const credential = req.body.credential;

        if (!credential) throw new CustomError('Credential Id must be provided');

        const { sub, given_name, email, picture } = jwtDecode(credential);

        let user = null;

        user = await User.findOne({ providerId: sub });

        if (!user) {
            user = new User({
                name: given_name,
                email,
                picture,
                provider: 'google',
                providerId: sub,
                password: sub,
            });

            await user.save();
        }

        const { accessToken, refreshToken } = await generateJwtPair(user);
        setTokenCookies(res, accessToken, refreshToken);
        const userInfo = user.removeSensitiveInfo();

        res.success({
            userInfo,
            accessToken,
            refreshToken,
        });
    } catch (e) {
        next(e);
    }
};

export default createAccount;
